-- 0018_discounts.sql

create table discounts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type discount_type_enum not null,
  value numeric(12,2) not null check (value > 0),
  scope discount_scope_enum not null,
  min_quantity int,
  min_order_total numeric(12,2),
  max_discount_amount numeric(12,2),
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or starts_at is null or ends_at > starts_at),
  check (type <> 'percentage' or value <= 100)
);

create table discount_products (
  discount_id uuid not null references discounts(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  primary key (discount_id, product_id)
);

create table discount_categories (
  discount_id uuid not null references discounts(id) on delete cascade,
  category_id uuid not null references categories(id) on delete cascade,
  primary key (discount_id, category_id)
);

create trigger set_discounts_updated_at before update on discounts
  for each row execute function set_updated_at();

create or replace function public.audit_discount_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform log_audit_event(
    case tg_op when 'INSERT' then 'discount.created' else 'discount.updated' end,
    'discount', new.id, jsonb_build_object('name', new.name, 'value', new.value, 'is_active', new.is_active)
  );
  return new;
end;
$$;

create trigger audit_discounts_trigger after insert or update on discounts
  for each row execute function audit_discount_change();

alter table discounts enable row level security;
alter table discount_products enable row level security;
alter table discount_categories enable row level security;

create policy "active discounts readable by everyone" on discounts
  for select to anon, authenticated using (is_active);
create policy "settings.write manages discounts" on discounts
  for all to authenticated
  using (has_permission(auth.uid(), 'settings.write'))
  with check (has_permission(auth.uid(), 'settings.write'));

create policy "discount_products readable by everyone" on discount_products
  for select to anon, authenticated using (true);
create policy "settings.write manages discount_products" on discount_products
  for all to authenticated
  using (has_permission(auth.uid(), 'settings.write'))
  with check (has_permission(auth.uid(), 'settings.write'));

create policy "discount_categories readable by everyone" on discount_categories
  for select to anon, authenticated using (true);
create policy "settings.write manages discount_categories" on discount_categories
  for all to authenticated
  using (has_permission(auth.uid(), 'settings.write'))
  with check (has_permission(auth.uid(), 'settings.write'));
