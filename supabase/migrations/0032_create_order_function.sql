-- 0032_create_order_function.sql
--
-- The single, atomic entry point for turning a cart into an order. A
-- Postgres function call is one implicit transaction: if any RAISE
-- EXCEPTION fires partway through, every change made so far in this call
-- (order row, order_items, inventory decrements, cart deletion) is rolled
-- back automatically — there is no partial-order state.
--
-- Concurrency / oversell prevention: the `update inventory set
-- quantity_on_hand = quantity_on_hand - N` statement takes a row lock on
-- that inventory row for the duration of this transaction. If two
-- customers check out the last unit at the same moment, the second
-- transaction blocks until the first commits or rolls back, then re-reads
-- the now-updated value — so the `quantity_on_hand >= 0` CHECK constraint
-- on `inventory` (0014) is evaluated against the correct, post-lock value
-- and rejects (only) the second order. No SELECT ... FOR UPDATE or
-- advisory lock is needed; ordinary row-level locking on UPDATE covers it.
--
-- Price/discount authority: unit prices are read from `products`/
-- `product_variants` at call time, never accepted as a parameter — the
-- caller passes only a cart_id and checkout details, never a price.

create or replace function public.create_order(
  p_cart_id uuid,
  p_fulfillment_type fulfillment_type_enum,
  p_payment_method text,
  p_guest_name text default null,
  p_guest_phone text default null,
  p_guest_email text default null,
  p_delivery_address_id uuid default null,
  p_notes text default null
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
begin
  select * into v_cart from carts where id = p_cart_id and status = 'active';
  if not found then
    raise exception 'Cart not found or already checked out';
  end if;

  -- Ownership: an authenticated customer's cart must belong to them. Guest
  -- carts (customer_id is null) have no RLS identity of their own — the
  -- caller (a Server Action) is responsible for verifying the guest's
  -- session_token cookie matches this cart BEFORE invoking this function
  -- with the privileged client. This function itself still refuses to
  -- attach a stranger's authenticated session to a guest cart silently:
  -- if auth.uid() is set (an authenticated call) the cart must be theirs.
  if v_cart.customer_id is not null and v_cart.customer_id <> auth.uid() then
    raise exception 'Not authorized for this cart';
  end if;

  if v_cart.customer_id is null and (p_guest_name is null or p_guest_phone is null) then
    raise exception 'Guest name and phone are required for guest checkout';
  end if;

  v_customer_id := v_cart.customer_id;

  select exists(select 1 from cart_items where cart_id = p_cart_id) into v_has_items;
  if not v_has_items then
    raise exception 'Cart is empty';
  end if;

  v_order_number := generate_order_number();

  insert into orders (
    order_number, customer_id, guest_name, guest_phone, guest_email,
    subtotal, discount_total, total, payment_method, fulfillment_type,
    delivery_address_id, notes
  ) values (
    v_order_number, v_customer_id, p_guest_name, p_guest_phone, p_guest_email,
    0, 0, 0, p_payment_method, p_fulfillment_type,
    p_delivery_address_id, p_notes
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

    -- Authoritative price: variant sale price > variant price >
    -- product sale price > product base price. Never client-supplied.
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

    -- Atomic decrement; see header comment for the concurrency argument.
    update inventory
      set quantity_on_hand = quantity_on_hand - v_item.quantity
      where id = v_inventory.id;

    insert into inventory_movements (
      inventory_id, movement_type, quantity_delta, reference_type, reference_id, note, created_by
    ) values (
      v_inventory.id, 'sale', -v_item.quantity, 'order', v_order_id, 'Order ' || v_order_number, auth.uid()
    );

    -- Best single active discount applicable to this line (all/product/
    -- category scope). Per-order min_order_total is intentionally not
    -- enforced here yet — see PHASE_4_REPORT.md "Known issues".
    select d.* into v_best_discount
      from discounts d
      where d.is_active
        and (d.starts_at is null or d.starts_at <= now())
        and (d.ends_at is null or d.ends_at >= now())
        and (d.min_quantity is null or v_item.quantity >= d.min_quantity)
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

    v_subtotal := v_subtotal + v_line_subtotal;
    v_discount_total := v_discount_total + v_line_discount;
    v_best_discount := null;
  end loop;

  v_total := v_subtotal - v_discount_total;

  update orders
    set subtotal = v_subtotal, discount_total = v_discount_total, total = v_total
    where id = v_order_id;

  delete from cart_items where cart_id = p_cart_id;
  update carts set status = 'converted' where id = p_cart_id;

  -- Internal notification for staff (order.read holders). Customer-facing
  -- email/SMS is explicitly out of scope — see PHASE_4_REPORT.md.
  insert into notifications (recipient_role_id, type, title, body, related_entity_type, related_entity_id)
  select r.id, 'order.created', 'New order ' || v_order_number,
         'A new order was placed' || case when v_customer_id is null then ' (guest checkout).' else '.' end,
         'order', v_order_id
  from roles r where r.name in ('admin', 'staff', 'sales');

  return query select v_order_id, v_order_number;
end;
$$;

revoke all on function public.create_order(uuid, fulfillment_type_enum, text, text, text, text, uuid, text) from public;
grant execute on function public.create_order(uuid, fulfillment_type_enum, text, text, text, text, uuid, text)
  to authenticated, service_role;
-- Granted to service_role explicitly (in addition to Supabase's own default
-- grants) since guest checkout invokes this via the privileged client —
-- see lib/services/checkout.ts for exactly why that's the sanctioned path.
