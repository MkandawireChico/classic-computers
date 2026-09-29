-- 0022_rentals.sql

create table rental_products (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  daily_rate numeric(12,2),
  weekly_rate numeric(12,2),
  monthly_rate numeric(12,2),
  deposit_amount numeric(12,2),
  is_available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table rental_bookings (
  id uuid primary key default gen_random_uuid(),
  rental_product_id uuid not null references rental_products(id) on delete restrict,
  customer_id uuid references customers(id) on delete set null,
  guest_name text,
  guest_phone text,
  guest_email text,
  start_date date not null,
  end_date date not null,
  quantity int not null default 1 check (quantity > 0),
  status rental_status_enum not null default 'requested',
  notes text,
  total_charge numeric(12,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date >= start_date)
);

create table rental_status_history (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references rental_bookings(id) on delete cascade,
  from_status text,
  to_status text not null,
  changed_by uuid references auth.users(id) on delete set null,
  note text,
  created_at timestamptz not null default now()
);

create trigger set_rental_products_updated_at before update on rental_products
  for each row execute function set_updated_at();
create trigger set_rental_bookings_updated_at before update on rental_bookings
  for each row execute function set_updated_at();

create or replace function public.audit_rental_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    insert into rental_status_history (booking_id, from_status, to_status, changed_by)
    values (new.id, null, new.status, auth.uid());
  elsif tg_op = 'UPDATE' and old.status is distinct from new.status then
    insert into rental_status_history (booking_id, from_status, to_status, changed_by)
    values (new.id, old.status, new.status, auth.uid());
  end if;
  return new;
end;
$$;

create trigger audit_rental_status_trigger after insert or update on rental_bookings
  for each row execute function audit_rental_status_change();

alter table rental_products enable row level security;
alter table rental_bookings enable row level security;
alter table rental_status_history enable row level security;

create policy "available rental products readable by everyone" on rental_products
  for select to anon, authenticated using (is_available);
create policy "rentals.write manages rental products" on rental_products
  for all to authenticated
  using (has_permission(auth.uid(), 'rentals.write'))
  with check (has_permission(auth.uid(), 'rentals.write'));

create policy "customer can read own bookings" on rental_bookings
  for select to authenticated using (customer_id = auth.uid());
create policy "customer can create own booking" on rental_bookings
  for insert to authenticated with check (customer_id = auth.uid());
create policy "rentals.read can read all bookings" on rental_bookings
  for select to authenticated using (has_permission(auth.uid(), 'rentals.read'));
create policy "rentals.write can update bookings" on rental_bookings
  for update to authenticated
  using (has_permission(auth.uid(), 'rentals.write'))
  with check (has_permission(auth.uid(), 'rentals.write'));

create policy "customer can read own booking status history" on rental_status_history
  for select to authenticated using (
    exists (select 1 from rental_bookings b where b.id = booking_id and b.customer_id = auth.uid())
  );
create policy "rentals.read can read all status history" on rental_status_history
  for select to authenticated using (has_permission(auth.uid(), 'rentals.read'));
