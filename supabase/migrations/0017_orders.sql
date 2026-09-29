-- 0017_orders.sql

create table orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  customer_id uuid references customers(id) on delete set null,
  guest_name text,
  guest_phone text,
  guest_email text,
  subtotal numeric(12,2) not null,
  discount_total numeric(12,2) not null default 0,
  total numeric(12,2) not null,
  currency text not null default 'MWK',
  payment_method text not null,
  payment_status payment_status_enum not null default 'unpaid',
  order_status order_status_enum not null default 'pending',
  fulfillment_type fulfillment_type_enum not null,
  delivery_address_id uuid references addresses(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (customer_id is not null or (guest_name is not null and guest_phone is not null))
);
create index orders_customer_idx on orders(customer_id);
create index orders_status_idx on orders(order_status);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid not null references products(id) on delete restrict,
  variant_id uuid references product_variants(id) on delete restrict,
  product_name_snapshot text not null,
  sku_snapshot text not null,
  unit_price numeric(12,2) not null,
  quantity int not null check (quantity > 0),
  discount_amount numeric(12,2) not null default 0,
  line_total numeric(12,2) not null
);
create index order_items_order_idx on order_items(order_id);

create table order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  from_status text,
  to_status text not null,
  changed_by uuid references auth.users(id) on delete set null,
  note text,
  created_at timestamptz not null default now()
);

create trigger set_orders_updated_at before update on orders
  for each row execute function set_updated_at();

-- Human-readable order number, e.g. CC-2026-000123. Sequence-backed so it's
-- guaranteed unique and monotonically increasing without a collision-retry
-- loop.
create sequence if not exists order_number_seq;

create or replace function public.generate_order_number()
returns text
language plpgsql
as $$
begin
  return 'CC-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('order_number_seq')::text, 6, '0');
end;
$$;

create or replace function public.set_order_number()
returns trigger
language plpgsql
as $$
begin
  if new.order_number is null then
    new.order_number := generate_order_number();
  end if;
  return new;
end;
$$;

create trigger set_order_number_trigger before insert on orders
  for each row execute function set_order_number();

-- Log every status transition automatically, and audit the change.
create or replace function public.audit_order_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    insert into order_status_history (order_id, from_status, to_status, changed_by)
    values (new.id, null, new.order_status, auth.uid());
    perform log_audit_event('order.created', 'order', new.id, jsonb_build_object('order_number', new.order_number));
  elsif tg_op = 'UPDATE' and old.order_status is distinct from new.order_status then
    insert into order_status_history (order_id, from_status, to_status, changed_by)
    values (new.id, old.order_status, new.order_status, auth.uid());
    perform log_audit_event('order.status_changed', 'order', new.id, jsonb_build_object(
      'from', old.order_status, 'to', new.order_status
    ));
  end if;
  return new;
end;
$$;

create trigger audit_order_status_trigger after insert or update on orders
  for each row execute function audit_order_status_change();

alter table orders enable row level security;
alter table order_items enable row level security;
alter table order_status_history enable row level security;

create policy "customer can read own orders" on orders
  for select to authenticated using (customer_id = auth.uid());
create policy "orders.read can read all orders" on orders
  for select to authenticated using (has_permission(auth.uid(), 'orders.read'));
create policy "orders.write can update orders" on orders
  for update to authenticated
  using (has_permission(auth.uid(), 'orders.write') or has_permission(auth.uid(), 'orders.cancel'))
  with check (has_permission(auth.uid(), 'orders.write') or has_permission(auth.uid(), 'orders.cancel'));
-- No direct client INSERT policy on orders: order creation always goes
-- through the createOrder() service (Phase 5), which runs as the
-- authenticated user via lib/supabase/server.ts and revalidates every price
-- server-side before insert — never a raw client insert of a total.

create policy "customer can read own order items" on order_items
  for select to authenticated using (
    exists (select 1 from orders o where o.id = order_id and o.customer_id = auth.uid())
  );
create policy "orders.read can read all order items" on order_items
  for select to authenticated using (has_permission(auth.uid(), 'orders.read'));

create policy "customer can read own order status history" on order_status_history
  for select to authenticated using (
    exists (select 1 from orders o where o.id = order_id and o.customer_id = auth.uid())
  );
create policy "orders.read can read all status history" on order_status_history
  for select to authenticated using (has_permission(auth.uid(), 'orders.read'));
