-- 0010_product_variants.sql

create table product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  sku text unique not null,
  name text not null,
  price numeric(12,2) not null check (price >= 0),
  sale_price numeric(12,2) check (sale_price is null or sale_price < price),
  is_default boolean not null default false,
  status variant_status_enum not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index product_variants_one_default
  on product_variants(product_id) where (is_default);
create index product_variants_product_idx on product_variants(product_id);

create trigger set_product_variants_updated_at before update on product_variants
  for each row execute function set_updated_at();

alter table product_variants enable row level security;

create policy "variants readable if parent product published" on product_variants
  for select to anon, authenticated using (
    exists (select 1 from products p where p.id = product_id and p.status = 'published')
  );
create policy "products.read can read all variants" on product_variants
  for select to authenticated using (has_permission(auth.uid(), 'products.read'));
create policy "products.write manages variants" on product_variants
  for all to authenticated
  using (has_permission(auth.uid(), 'products.write'))
  with check (has_permission(auth.uid(), 'products.write'));
