-- 0033_order_delivery_snapshot_and_min_order_total.sql
--
-- Phase 4 correction pass, items 1 and 2. Does not touch 0001-0032.
--
-- ITEM 1 — delivery address snapshot:
-- Guest delivery addresses were being folded into orders.notes as free
-- text (Phase 4 gap, documented in PHASE_4_REPORT.md item 9). This adds a
-- proper structured snapshot column and builds it inside create_order()
-- at order-creation time — for guests, from the checkout form fields; for
-- authenticated customers, from their chosen address row (0006) plus
-- profile/auth.users contact info, copied in at that moment so the order
-- always displays the address as it was THEN, never the customer's
-- current profile/address (which may since have changed or been
-- deleted). Existing orders get delivery_snapshot = null — per the
-- instruction not to invent missing historical delivery information,
-- no backfill is attempted.
--
-- ITEM 2 — discounts.min_order_total:
-- The Phase 4 version of create_order() computed the order subtotal by
-- accumulating it DURING the same loop that selects and applies
-- discounts, so a min_order_total condition had no correct subtotal to
-- compare against yet at the point each line's discount was chosen. This
-- version computes the authoritative subtotal in one pass BEFORE the
-- discount-selection loop, so min_order_total is evaluated against the
-- real order subtotal for every line, regardless of scope.

alter table orders add column delivery_snapshot jsonb;

comment on column orders.delivery_snapshot is
  'Structured delivery address as it was AT ORDER CREATION TIME (full_name, phone, email, line1, line2, city, district). Null for pickup orders and for orders created before this column existed. Never re-derive delivery info by joining to the customer''s current profile/addresses — this snapshot is the authoritative historical record.';

-- CREATE OR REPLACE only replaces a function with an IDENTICAL parameter
-- signature. Since this version adds four new parameters, without this
-- explicit drop the old 8-parameter create_order() from 0032 would remain
-- as a second, stale, still-callable overload rather than being replaced.
drop function if exists public.create_order(
  uuid, fulfillment_type_enum, text, text, text, text, uuid, text
);

create or replace function public.create_order(
  p_cart_id uuid,
  p_fulfillment_type fulfillment_type_enum,
  p_payment_method text,
  p_guest_name text default null,
  p_guest_phone text default null,
  p_guest_email text default null,
  p_delivery_address_id uuid default null,
  p_notes text default null,
  p_guest_delivery_line1 text default null,
  p_guest_delivery_line2 text default null,
  p_guest_delivery_city text default null,
  p_guest_delivery_district text default null
)
returns table(order_id uuid, order_number text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cart record;
  v_customer_id uuid;
  v_item record;
  v_unit_price numeric(12,2);
  v_line_subtotal numeric(12,2);
  v_line_discount numeric(12,2);
  v_subtotal numeric(12,2) := 0;
  v_discount_total numeric(12,2) := 0;
  v_total numeric(12,2);
  v_order_id uuid;
  v_order_number text;
  v_inventory record;
  v_best_discount record;
  v_has_items boolean;
  v_delivery_snapshot jsonb;
  v_address record;
  v_profile record;
  v_customer_email text;
begin
  select * into v_cart from carts where id = p_cart_id and status = 'active';
  if not found then
    raise exception 'Cart not found or already checked out';
  end if;

  if v_cart.customer_id is not null and v_cart.customer_id <> auth.uid() then
    raise exception 'Not authorized for this cart';
  end if;

  if v_cart.customer_id is null and (p_guest_name is null or p_guest_phone is null) then
    raise exception 'Guest name and phone are required for guest checkout';
  end if;

  if p_fulfillment_type = 'delivery' and v_cart.customer_id is null
     and (p_guest_delivery_line1 is null or p_guest_delivery_city is null) then
    raise exception 'A delivery address is required';
  end if;

  v_customer_id := v_cart.customer_id;

  select exists(select 1 from cart_items where cart_id = p_cart_id) into v_has_items;
  if not v_has_items then
    raise exception 'Cart is empty';
  end if;

  -- ITEM 2: authoritative subtotal computed up front (mirrors the same
  -- price-precedence logic used per-line below), so every discount's
  -- min_order_total check below compares against the real order total,
  -- not a partial running sum.
  select coalesce(sum(
    coalesce(
      case when ci.variant_id is not null then pv.sale_price end,
      case when ci.variant_id is not null then pv.price end,
      p.sale_price,
      p.base_price
    ) * ci.quantity
  ), 0)
  into v_subtotal
  from cart_items ci
  join products p on p.id = ci.product_id
  left join product_variants pv on pv.id = ci.variant_id
  where ci.cart_id = p_cart_id;

  -- ITEM 1: build the delivery snapshot from server-known data only —
  -- for an authenticated customer, from their selected address row and
  -- profile (never from client-supplied text); for a guest, from the
  -- structured fields the checkout form collected.
  v_delivery_snapshot := null;
  if p_fulfillment_type = 'delivery' then
    if v_customer_id is not null then
      if p_delivery_address_id is null then
        raise exception 'A delivery address is required';
      end if;

      select * into v_address from addresses
        where id = p_delivery_address_id and customer_id = v_customer_id;
      if not found then
        raise exception 'Delivery address not found';
      end if;

      select * into v_profile from profiles where id = v_customer_id;
      select email into v_customer_email from auth.users where id = v_customer_id;

      v_delivery_snapshot := jsonb_build_object(
        'full_name', v_profile.full_name,
        'phone', v_profile.phone,
        'email', v_customer_email,
        'line1', v_address.line1,
        'line2', v_address.line2,
        'city', v_address.city,
        'district', null,
        'label', v_address.label
      );
    else
      v_delivery_snapshot := jsonb_build_object(
        'full_name', p_guest_name,
        'phone', p_guest_phone,
        'email', p_guest_email,
        'line1', p_guest_delivery_line1,
        'line2', p_guest_delivery_line2,
        'city', p_guest_delivery_city,
        'district', p_guest_delivery_district,
        'label', null
      );
    end if;
  end if;

  v_order_number := generate_order_number();

  insert into orders (
    order_number, customer_id, guest_name, guest_phone, guest_email,
    subtotal, discount_total, total, payment_method, fulfillment_type,
    delivery_address_id, delivery_snapshot, notes
  ) values (
    v_order_number, v_customer_id, p_guest_name, p_guest_phone, p_guest_email,
    v_subtotal, 0, 0, p_payment_method, p_fulfillment_type,
    p_delivery_address_id, v_delivery_snapshot, p_notes
  )
  returning id into v_order_id;

  for v_item in
    select
      ci.id as cart_item_id, ci.product_id, ci.variant_id, ci.quantity,
      p.name as product_name, p.sku as product_sku, p.status as product_status,
      p.base_price, p.sale_price, p.category_id,
      pv.price as variant_price, pv.sale_price as variant_sale_price, pv.status as variant_status
    from cart_items ci
    join products p on p.id = ci.product_id
    left join product_variants pv on pv.id = ci.variant_id
    where ci.cart_id = p_cart_id
  loop
    if v_item.quantity <= 0 then
      raise exception 'Invalid quantity for %', v_item.product_name;
    end if;

    if v_item.product_status <> 'published' then
      raise exception '% is no longer available', v_item.product_name;
    end if;

    if v_item.variant_id is not null and v_item.variant_status is distinct from 'active' then
      raise exception 'The selected configuration for % is no longer available', v_item.product_name;
    end if;

    v_unit_price := coalesce(
      case when v_item.variant_id is not null then v_item.variant_sale_price end,
      case when v_item.variant_id is not null then v_item.variant_price end,
      v_item.sale_price,
      v_item.base_price
    );

    -- Variant-aware inventory lookup — unchanged from 0032, confirmed
    -- correct during this correction pass (item 3): when variant_id is
    -- present this already resolves to that variant's own inventory row,
    -- never the product-level one.
    select * into v_inventory
      from inventory
      where product_id = v_item.product_id
        and variant_id is not distinct from v_item.variant_id;

    if not found then
      raise exception 'No inventory record for %', v_item.product_name;
    end if;

    update inventory
      set quantity_on_hand = quantity_on_hand - v_item.quantity
      where id = v_inventory.id;

    insert into inventory_movements (
      inventory_id, movement_type, quantity_delta, reference_type, reference_id, note, created_by
    ) values (
      v_inventory.id, 'sale', -v_item.quantity, 'order', v_order_id, 'Order ' || v_order_number, auth.uid()
    );

    -- ITEM 2: min_order_total now included, checked against the
    -- pre-computed v_subtotal (the real order subtotal), not a partial sum.
    select d.* into v_best_discount
      from discounts d
      where d.is_active
        and (d.starts_at is null or d.starts_at <= now())
        and (d.ends_at is null or d.ends_at >= now())
        and (d.min_quantity is null or v_item.quantity >= d.min_quantity)
        and (d.min_order_total is null or v_subtotal >= d.min_order_total)
        and (
          d.scope = 'all'
          or (d.scope = 'product' and exists (
                select 1 from discount_products dp
                where dp.discount_id = d.id and dp.product_id = v_item.product_id))
          or (d.scope = 'category' and exists (
                select 1 from discount_categories dc
                where dc.discount_id = d.id and dc.category_id = v_item.category_id))
        )
      order by
        (case d.type
          when 'percentage' then (v_unit_price * v_item.quantity * d.value / 100)
          else d.value
        end) desc
      limit 1;

    v_line_subtotal := v_unit_price * v_item.quantity;

    if v_best_discount.id is not null then
      v_line_discount := case v_best_discount.type
        when 'percentage' then v_line_subtotal * v_best_discount.value / 100
        else least(v_best_discount.value, v_line_subtotal)
      end;
      if v_best_discount.max_discount_amount is not null then
        v_line_discount := least(v_line_discount, v_best_discount.max_discount_amount);
      end if;
    else
      v_line_discount := 0;
    end if;

    insert into order_items (
      order_id, product_id, variant_id, product_name_snapshot, sku_snapshot,
      unit_price, quantity, discount_amount, line_total
    ) values (
      v_order_id, v_item.product_id, v_item.variant_id, v_item.product_name,
      coalesce(v_item.product_sku, ''), v_unit_price, v_item.quantity, v_line_discount,
      v_line_subtotal - v_line_discount
    );

    v_discount_total := v_discount_total + v_line_discount;
    v_best_discount := null;
  end loop;

  v_total := v_subtotal - v_discount_total;

  update orders
    set discount_total = v_discount_total, total = v_total
    where id = v_order_id;

  delete from cart_items where cart_id = p_cart_id;
  update carts set status = 'converted' where id = p_cart_id;

  insert into notifications (recipient_role_id, type, title, body, related_entity_type, related_entity_id)
  select r.id, 'order.created', 'New order ' || v_order_number,
         'A new order was placed' || case when v_customer_id is null then ' (guest checkout).' else '.' end,
         'order', v_order_id
  from roles r where r.name in ('admin', 'staff', 'sales');

  return query select v_order_id, v_order_number;
end;
$$;

revoke all on function public.create_order(
  uuid, fulfillment_type_enum, text, text, text, text, uuid, text, text, text, text, text
) from public;
grant execute on function public.create_order(
  uuid, fulfillment_type_enum, text, text, text, text, uuid, text, text, text, text, text
) to authenticated, service_role;
