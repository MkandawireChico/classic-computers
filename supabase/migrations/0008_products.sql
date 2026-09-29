-- 0008_products.sql

create table products (
  id uuid primary key default gen_random_uuid(),
  sku text unique not null,
  slug text unique not null,
  name text not null,
  brand_id uuid references brands(id) on delete set null,
  category_id uuid not null references categories(id) on delete restrict,
  product_type product_type_enum not null,
  condition condition_enum not null default 'new',
  description text,
  base_price numeric(12,2) not null check (base_price >= 0),
  sale_price numeric(12,2) check (sale_price is null or sale_price < base_price),
  warranty_text text,
  status product_status_enum not null default 'draft',
  is_featured boolean not null default false,
  seo_title text,
  seo_description text,
  view_count bigint not null default 0,
  raw_attributes jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_status_category_idx on products(status, category_id);
create index products_brand_idx on products(brand_id);
create index products_search_idx on products
  using gin (to_tsvector('english', name || ' ' || sku || ' ' || coalesce(description, '')));
create index products_raw_attributes_idx on products using gin (raw_attributes);

create trigger set_products_updated_at before update on products
  for each row execute function set_updated_at();

-- Audit trail: log creation and any update (price, status, etc.) at the
-- database layer so it can never be skipped by an application code path.
create or replace function public.audit_products()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    perform log_audit_event('product.created', 'product', new.id, jsonb_build_object('sku', new.sku));
  elsif tg_op = 'UPDATE' then
    perform log_audit_event('product.updated', 'product', new.id, jsonb_build_object(
      'base_price_before', old.base_price, 'base_price_after', new.base_price,
      'status_before', old.status, 'status_after', new.status
    ));
  end if;
  return new;
end;
$$;

create trigger audit_products_trigger after insert or update on products
  for each row execute function audit_products();

alter table products enable row level security;

create policy "published products readable by everyone" on products
  for select to anon, authenticated using (status = 'published');
create policy "products.read can read all products" on products
  for select to authenticated using (has_permission(auth.uid(), 'products.read'));
create policy "products.write can insert products" on products
  for insert to authenticated with check (has_permission(auth.uid(), 'products.write'));
create policy "products.write can update products" on products
  for update to authenticated
  using (has_permission(auth.uid(), 'products.write'))
  with check (has_permission(auth.uid(), 'products.write'));
create policy "products.delete can delete products" on products
  for delete to authenticated using (has_permission(auth.uid(), 'products.delete'));
