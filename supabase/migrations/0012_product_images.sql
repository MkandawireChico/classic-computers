-- 0012_product_images.sql
-- Metadata only. Actual files live in the product-images Storage bucket
-- (see 0029). storage_path is a bucket key, never a baked-in absolute URL.

create table product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  variant_id uuid references product_variants(id) on delete cascade,
  storage_path text not null,
  alt_text text,
  display_order int not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index product_images_one_primary
  on product_images(product_id, variant_id) where (is_primary);
create index product_images_product_idx on product_images(product_id, display_order);

create trigger set_product_images_updated_at before update on product_images
  for each row execute function set_updated_at();

alter table product_images enable row level security;

create policy "images readable if parent product published" on product_images
  for select to anon, authenticated using (
    exists (select 1 from products p where p.id = product_id and p.status = 'published')
  );
create policy "products.read can read all images" on product_images
  for select to authenticated using (has_permission(auth.uid(), 'products.read'));
create policy "products.write manages images" on product_images
  for all to authenticated
  using (has_permission(auth.uid(), 'products.write'))
  with check (has_permission(auth.uid(), 'products.write'));
