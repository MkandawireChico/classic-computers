-- 0007_brands_and_categories.sql

create table brands (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  slug text unique not null,
  logo_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  parent_id uuid references categories(id) on delete set null,
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index categories_parent_id_idx on categories(parent_id);

create trigger set_brands_updated_at before update on brands
  for each row execute function set_updated_at();
create trigger set_categories_updated_at before update on categories
  for each row execute function set_updated_at();

alter table brands enable row level security;
alter table categories enable row level security;

create policy "brands readable by everyone" on brands
  for select to anon, authenticated using (true);
create policy "products.write manages brands" on brands
  for insert to authenticated with check (has_permission(auth.uid(), 'products.write'));
create policy "products.write updates brands" on brands
  for update to authenticated
  using (has_permission(auth.uid(), 'products.write'))
  with check (has_permission(auth.uid(), 'products.write'));
create policy "products.delete removes brands" on brands
  for delete to authenticated using (has_permission(auth.uid(), 'products.delete'));

create policy "categories readable by everyone" on categories
  for select to anon, authenticated using (true);
create policy "products.write manages categories" on categories
  for insert to authenticated with check (has_permission(auth.uid(), 'products.write'));
create policy "products.write updates categories" on categories
  for update to authenticated
  using (has_permission(auth.uid(), 'products.write'))
  with check (has_permission(auth.uid(), 'products.write'));
create policy "products.delete removes categories" on categories
  for delete to authenticated using (has_permission(auth.uid(), 'products.delete'));
