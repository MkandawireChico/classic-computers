-- 0071_harden_checkout_pricing_and_rpc.sql
--
-- Keep product, variant, cart and order pricing consistent. The storefront
-- treats a sale price as valid only when it is positive and below the
-- regular price. Enforce the same rule in PostgreSQL and in create_order().
--
-- Clean up legacy zero/negative sale prices before validating the stronger
-- constraints. Invalid sale prices are removed, not used to reduce prices.
update public.products
set sale_price = null
where sale_price is not null and sale_price <= 0;

update public.product_variants
set sale_price = null
where sale_price is not null and sale_price <= 0;

alter table public.products
  drop constraint if exists products_sale_price_check;
alter table public.products
  add constraint products_sale_price_check
  check (sale_price is null or (sale_price > 0 and sale_price < base_price));

alter table public.product_variants
  drop constraint if exists product_variants_sale_price_check;
alter table public.product_variants
  add constraint product_variants_sale_price_check
  check (sale_price is null or (sale_price > 0 and sale_price < price));

-- Optional discount conditions are positive values in the admin form.
-- Normalize legacy zero/negative values to "not configured", then enforce
-- the same rule for all future writes.
update public.discounts set min_quantity = null where min_quantity is not null and min_quantity <= 0;
update public.discounts set min_order_total = null where min_order_total is not null and min_order_total <= 0;
update public.discounts set max_discount_amount = null where max_discount_amount is not null and max_discount_amount <= 0;

alter table public.discounts
  add constraint discounts_min_quantity_positive
  check (min_quantity is null or min_quantity > 0) not valid;
alter table public.discounts
  add constraint discounts_min_order_total_positive
  check (min_order_total is null or min_order_total > 0) not valid;
alter table public.discounts
  add constraint discounts_max_discount_amount_positive
  check (max_discount_amount is null or max_discount_amount > 0);

alter table public.discounts validate constraint discounts_min_quantity_positive;
alter table public.discounts validate constraint discounts_min_order_total_positive;
alter table public.discounts validate constraint discounts_max_discount_amount_positive;

-- Keep cart mutations serialized against order creation. create_order()
-- locks the parent cart row; this trigger takes the same lock for item
-- inserts/updates/deletes. A mutation either completes before checkout reads
-- the cart, or waits until checkout commits and then sees a converted cart.
create or replace function public.guard_active_cart_item_mutation()
returns trigger
language plpgsql
set search_path = pg_catalog, public, pg_temp
as $
declare
  v_cart_id uuid;
  v_cart_status public.cart_status_enum;
  v_variant_product_id uuid;
begin
  if tg_op = 'UPDATE' and new.cart_id is distinct from old.cart_id then
    raise exception 'Cart items cannot be moved between carts';
  end if;

  if tg_op = 'DELETE' then
    v_cart_id := old.cart_id;
  else
    v_cart_id := new.cart_id;
  end if;

  select status into v_cart_status
    from public.carts
    where id = v_cart_id
    for update;

  -- A parent-cart deletion cascades to cart_items after the parent row
  -- disappears. Permit only that cascading DELETE; all ordinary mutations
  -- require an existing active cart.
  if not found then
    if tg_op = 'DELETE' then
      return old;
    end if;
    raise exception 'Cart is no longer available';
  end if;

  if v_cart_status <> 'active' then
    raise exception 'Cart has already been checked out';
  end if;

  if tg_op <> 'DELETE' then
    if new.variant_id is not null then
      select product_id into v_variant_product_id
        from public.product_variants
        where id = new.variant_id;

      if not found or v_variant_product_id is distinct from new.product_id then
        raise exception 'Selected configuration does not belong to this product';
      end if;
    end if;
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$;

revoke all on function public.guard_active_cart_item_mutation() from public;

drop trigger if exists cart_items_active_cart_guard on public.cart_items;
create trigger cart_items_active_cart_guard
  before insert or update or delete on public.cart_items
  for each row execute function public.guard_active_cart_item_mutation();

-- Replace the latest 12-argument create_order() implementation from 0058.
-- Preserve delivery snapshots, student eligibility, product-scoped student
-- offers, discount limits, inventory movements, notifications and grants.
--
-- Price precedence:
--   selected variant: valid variant sale price, otherwise variant price
--   product without variant: valid product sale price, otherwise base price
--
-- The subtotal and each order line use the identical rule.
--
-- Student offers are limited to the products explicitly linked in
-- discount_products. Approval remains resolved from the customer's own
-- customer row inside create_order(); client-supplied student status is
-- never trusted.

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
set search_path = pg_catalog, public, pg_temp
as $
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
  v_payment_setting_key text;
  v_payment_enabled boolean := false;
begin
  select * into v_cart from carts where id = p_cart_id and status = 'active' for update;
  if not found then
    raise exception 'Cart not found or already checked out';
  end if;

  if v_cart.customer_id is not null and v_cart.customer_id is distinct from auth.uid() then
    raise exception 'Not authorized for this cart';
  end if;

  -- Guest carts are created and submitted only through the server-brokered
  -- guest flow. Authenticated users must never invoke the guest path directly.
  if v_cart.customer_id is null and auth.uid() is not null then
    raise exception 'Guest checkout must be submitted through the storefront';
  end if;

  -- Enforce public payment-method settings at the database boundary too.
  -- This protects the RPC if a caller bypasses the storefront Server Action.
  v_payment_setting_key := case p_payment_method
    when 'pay_at_shop' then 'pay_at_shop'
    when 'bank_transfer' then 'bank_transfer'
    when 'mobile_money' then 'mobile_money'
    when 'cash_on_delivery' then 'cash_on_delivery'
    else null
  end;

  if v_payment_setting_key is null then
    raise exception 'Payment method is invalid';
  end if;

  select coalesce((value ->> v_payment_setting_key) = 'true', false)
    into v_payment_enabled
    from site_settings
    where key = 'payment_methods' and is_public = true;

  if not coalesce(v_payment_enabled, false) then
    raise exception 'This payment method is currently unavailable';
  end if;

  if v_cart.customer_id is null and (p_guest_name is null or p_guest_phone is null) then
    raise exception 'Guest name and phone are required for guest checkout';
  end if;

  if p_fulfillment_type = 'delivery' and v_cart.customer_id is null
     and (p_guest_delivery_line1 is null or p_guest_delivery_city is null) then
    raise exception 'A delivery address is required';
  end if;

  v_customer_id := v_cart.customer_id;

  if v_customer_id is not null then
    select (student_status = 'approved') into v_customer_is_verified_student
      from customers where id = v_customer_id;
  end if;

  select exists(select 1 from cart_items where cart_id = p_cart_id) into v_has_items;
  if not v_has_items then
    raise exception 'Cart is empty';
  end if;

  select coalesce(sum(
    case
      when ci.variant_id is not null then
        case
          when pv.sale_price > 0 and pv.sale_price < pv.price then pv.sale_price
          else pv.price
        end
      else
        case
          when p.sale_price > 0 and p.sale_price < p.base_price then p.sale_price
          else p.base_price
        end
    end * ci.quantity
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
    v_subtotal, 0, v_subtotal, p_payment_method, p_fulfillment_type,
    p_delivery_address_id, v_delivery_snapshot, p_notes
  )
  returning id into v_order_id;

  for v_item in
    select
      ci.id as cart_item_id, ci.product_id, ci.variant_id, ci.quantity,
      p.name as product_name, p.sku as product_sku, p.status as product_status,
      p.base_price, p.sale_price, p.category_id,
      pv.product_id as variant_product_id,
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

    if v_item.variant_id is not null and v_item.variant_product_id is distinct from v_item.product_id then
      raise exception 'The selected configuration does not belong to this product';
    end if;

    if v_item.variant_id is not null and v_item.variant_status is distinct from 'active' then
      raise exception 'The selected configuration for % is no longer available', v_item.product_name;
    end if;

    v_unit_price := case
      when v_item.variant_id is not null then
        case
          when v_item.variant_sale_price > 0 and v_item.variant_sale_price < v_item.variant_price
            then v_item.variant_sale_price
          else v_item.variant_price
        end
      else
        case
          when v_item.sale_price > 0 and v_item.sale_price < v_item.base_price
            then v_item.sale_price
          else v_item.base_price
        end
    end;

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
          or (d.scope = 'student'
              and v_customer_is_verified_student
              and exists (
                select 1 from discount_products dp
                where dp.discount_id = d.id and dp.product_id = v_item.product_id))
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

-- Keep the RPC callable only by authenticated customers and the server-side
-- service role used for the cookie-verified guest checkout flow.
revoke all on function public.create_order(
  uuid, fulfillment_type_enum, text, text, text, text, uuid, text, text, text, text, text
) from public;
grant execute on function public.create_order(
  uuid, fulfillment_type_enum, text, text, text, text, uuid, text, text, text, text, text
) to authenticated, service_role;
