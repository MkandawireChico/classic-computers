-- 0038_student_discount_enforcement.sql
--
-- Found while wiring up student verification (Phase 6, section 6): the
-- discounts.scope enum (0018) has included 'student' since Phase 2, and
-- the admin discounts UI (Phase 5) lets staff create a discount with
-- that scope — but create_order()'s discount-selection query (0032,
-- carried through 0033) only ever matches scope IN ('all','product',
-- 'category'). A 'student' discount was silently unmatchable: eligible
-- or not, it would never apply to anyone's order. This replaces
-- create_order() (same 12-parameter signature as 0033 — plain
-- CREATE OR REPLACE is sufficient, no DROP needed) adding the missing
-- branch, gated on the customer's OWN server-side student_status —
-- never a client-supplied "I'm a student" flag.

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
  v_customer_is_verified_student boolean := false;
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

  -- Student eligibility resolved ONCE, here, from the customer's own row
  -- (student_verifications.status kept in sync onto customers
  -- .student_status by sync_customer_student_status(), 0020) — never
  -- from anything the client sends. A guest is never eligible.
  if v_customer_id is not null then
    select (student_status = 'approved') into v_customer_is_verified_student
      from customers where id = v_customer_id;
  end if;

  select exists(select 1 from cart_items where cart_id = p_cart_id) into v_has_items;
  if not v_has_items then
    raise exception 'Cart is empty';
  end if;

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

    -- Student-scoped discounts now actually match (the fix this
    -- migration exists for) — gated on v_customer_is_verified_student,
    -- resolved server-side above, never client-supplied.
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
          or (d.scope = 'student' and v_customer_is_verified_student)
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

-- Grants unchanged from 0033 (same signature) — no new GRANT/REVOKE
-- statement needed since CREATE OR REPLACE preserves existing privileges
-- on a function whose signature didn't change.
