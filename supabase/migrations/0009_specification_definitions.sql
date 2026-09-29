-- 0009_specification_definitions.sql
-- The catalogue of which spec fields exist per product type. This is what
-- lets the admin product editor render the right form fields dynamically
-- instead of hard-coding a form per category.

create table specification_definitions (
  id uuid primary key default gen_random_uuid(),
  product_type product_type_enum not null,
  key text not null,
  label text not null,
  data_type spec_data_type_enum not null,
  unit text,
  display_order int not null default 0,
  unique (product_type, key)
);

alter table specification_definitions enable row level security;

create policy "spec definitions readable by everyone" on specification_definitions
  for select to anon, authenticated using (true);
create policy "products.write manages spec definitions" on specification_definitions
  for all to authenticated
  using (has_permission(auth.uid(), 'products.write'))
  with check (has_permission(auth.uid(), 'products.write'));
