-- 0027_wishlists.sql

create table wishlists (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid unique not null references customers(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table wishlist_items (
  id uuid primary key default gen_random_uuid(),
  wishlist_id uuid not null references wishlists(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  variant_id uuid references product_variants(id) on delete cascade,
  added_at timestamptz not null default now(),
  unique (wishlist_id, product_id, variant_id)
);

alter table wishlists enable row level security;
alter table wishlist_items enable row level security;

create policy "customer manages own wishlist" on wishlists
  for all to authenticated
  using (customer_id = auth.uid())
  with check (customer_id = auth.uid());

create policy "customer manages own wishlist items" on wishlist_items
  for all to authenticated
  using (exists (select 1 from wishlists w where w.id = wishlist_id and w.customer_id = auth.uid()))
  with check (exists (select 1 from wishlists w where w.id = wishlist_id and w.customer_id = auth.uid()));
