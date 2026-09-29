-- 0019_reviews.sql

create table reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  customer_id uuid references customers(id) on delete set null,
  rating int not null check (rating between 1 and 5),
  title text,
  comment text,
  status review_status_enum not null default 'pending',
  created_at timestamptz not null default now()
);
create index reviews_product_status_idx on reviews(product_id, status);

alter table reviews enable row level security;

create policy "approved reviews readable by everyone" on reviews
  for select to anon, authenticated using (status = 'approved');
create policy "customer can read own reviews" on reviews
  for select to authenticated using (customer_id = auth.uid());
create policy "customer can submit a review" on reviews
  for insert to authenticated with check (customer_id = auth.uid());
create policy "reviews.moderate can read all reviews" on reviews
  for select to authenticated using (has_permission(auth.uid(), 'reviews.read'));
create policy "reviews.moderate can update reviews" on reviews
  for update to authenticated
  using (has_permission(auth.uid(), 'reviews.moderate'))
  with check (has_permission(auth.uid(), 'reviews.moderate'));
create policy "reviews.moderate can delete reviews" on reviews
  for delete to authenticated using (has_permission(auth.uid(), 'reviews.moderate'));
