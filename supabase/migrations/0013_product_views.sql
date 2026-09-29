-- 0013_product_views.sql
-- Lightweight view log powering "recently viewed" and basic popularity
-- ranking, without a separate analytics stack.

create table product_views (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  customer_id uuid references customers(id) on delete set null,
  viewed_at timestamptz not null default now()
);
create index product_views_product_time_idx on product_views(product_id, viewed_at);

alter table product_views enable row level security;

-- Insert-only from anyone (viewing a product is not a sensitive act); no
-- public SELECT — only staff with reports.read should be able to query it.
create policy "anyone can log a product view" on product_views
  for insert to anon, authenticated with check (true);
create policy "reports.read can read product views" on product_views
  for select to authenticated using (has_permission(auth.uid(), 'reports.read'));
create policy "customer can read own view history" on product_views
  for select to authenticated using (customer_id = auth.uid());
