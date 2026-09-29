-- 0011_product_specifications.sql

create table product_specifications (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  variant_id uuid references product_variants(id) on delete cascade,
  spec_definition_id uuid not null references specification_definitions(id) on delete restrict,
  value text not null,
  unique (product_id, variant_id, spec_definition_id)
);
create index product_specifications_product_idx on product_specifications(product_id);

alter table product_specifications enable row level security;

create policy "specs readable if parent product published" on product_specifications
  for select to anon, authenticated using (
    exists (select 1 from products p where p.id = product_id and p.status = 'published')
  );
create policy "products.read can read all specs" on product_specifications
  for select to authenticated using (has_permission(auth.uid(), 'products.read'));
create policy "products.write manages specs" on product_specifications
  for all to authenticated
  using (has_permission(auth.uid(), 'products.write'))
  with check (has_permission(auth.uid(), 'products.write'));
