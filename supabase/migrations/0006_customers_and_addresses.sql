-- 0006_customers_and_addresses.sql

create table customers (
  id uuid primary key references profiles(id) on delete cascade,
  referral_code text unique not null,
  student_status student_status_enum not null default 'none',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table addresses (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  label text,
  line1 text not null,
  line2 text,
  city text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index addresses_one_default_per_customer
  on addresses(customer_id) where (is_default);

create trigger set_customers_updated_at before update on customers
  for each row execute function set_updated_at();
create trigger set_addresses_updated_at before update on addresses
  for each row execute function set_updated_at();

-- ------------------------------------------------------------------
-- Referral code generator: short, unique, human-shareable code.
-- Called from a trigger on customer creation so callers never have to
-- generate/collision-check one themselves.
-- ------------------------------------------------------------------
create or replace function public.generate_referral_code()
returns text
language plpgsql
as $$
declare
  candidate text;
  exists_already boolean;
begin
  loop
    candidate := upper(substr(md5(gen_random_uuid()::text), 1, 8));
    select exists(select 1 from customers where referral_code = candidate) into exists_already;
    exit when not exists_already;
  end loop;
  return candidate;
end;
$$;

create or replace function public.set_referral_code()
returns trigger
language plpgsql
as $$
begin
  if new.referral_code is null then
    new.referral_code := generate_referral_code();
  end if;
  return new;
end;
$$;

create trigger set_customer_referral_code before insert on customers
  for each row execute function set_referral_code();

alter table customers enable row level security;
alter table addresses enable row level security;

create policy "customer can read own record" on customers
  for select to authenticated using (id = auth.uid());
create policy "customer can update own record" on customers
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "staff can read customers" on customers
  for select to authenticated using (has_permission(auth.uid(), 'customers.read'));
create policy "staff can write customers" on customers
  for update to authenticated
  using (has_permission(auth.uid(), 'customers.write'))
  with check (has_permission(auth.uid(), 'customers.write'));

create policy "customer manages own addresses" on addresses
  for all to authenticated
  using (customer_id = auth.uid())
  with check (customer_id = auth.uid());
create policy "staff can read addresses" on addresses
  for select to authenticated using (has_permission(auth.uid(), 'customers.read'));
