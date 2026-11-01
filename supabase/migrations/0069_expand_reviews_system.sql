-- 0069_expand_reviews_system.sql
-- Expand reviews to support product, rental, and repair reviews with transaction verification

-- Add review type enum
create type review_type_enum as enum ('product', 'rental', 'repair');

-- Add new columns to reviews table
alter table reviews
  add column review_type review_type_enum not null default 'product',
  add column order_id uuid references orders(id) on delete set null,
  add column rental_booking_id uuid references rental_bookings(id) on delete set null,
  add column repair_ticket_id uuid references repair_tickets(id) on delete set null,
  add column verified_purchase boolean not null default false,
  add column admin_response text,
  add column admin_response_at timestamptz,
  add column admin_response_by uuid references auth.users(id) on delete set null,
  add column updated_at timestamptz not null default now();

-- Add indexes for performance
create index reviews_type_status_idx on reviews(review_type, status);
create index reviews_order_idx on reviews(order_id) where order_id is not null;
create index reviews_rental_idx on reviews(rental_booking_id) where rental_booking_id is not null;
create index reviews_repair_idx on reviews(repair_ticket_id) where repair_ticket_id is not null;

-- Add trigger for updated_at
create trigger set_reviews_updated_at before update on reviews
  for each row execute function set_updated_at();

-- Create review images table
create table review_images (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references reviews(id) on delete cascade,
  image_url text not null,
  alt_text text,
  created_at timestamptz not null default now()
);
create index review_images_review_idx on review_images(review_id);

alter table review_images enable row level security;

create policy "customer can manage own review images" on review_images
  for all to authenticated
  using (exists (
    select 1 from reviews r where r.id = review_id and r.customer_id = auth.uid()
  ))
  with check (exists (
    select 1 from reviews r where r.id = review_id and r.customer_id = auth.uid()
  ));
create policy "reviews.moderate can manage review images" on review_images
  for all to authenticated
  using (has_permission(auth.uid(), 'reviews.moderate'))
  with check (has_permission(auth.uid(), 'reviews.moderate'));

-- Update RLS policies to support new review types
drop policy if exists "approved reviews readable by everyone" on reviews;
drop policy if exists "customer can read own reviews" on reviews;
drop policy if exists "customer can submit a review" on reviews;
drop policy if exists "reviews.moderate can read all reviews" on reviews;
drop policy if exists "reviews.moderate can update reviews" on reviews;
drop policy if exists "reviews.moderate can delete reviews" on reviews;

create policy "approved reviews readable by everyone" on reviews
  for select to anon, authenticated using (status = 'approved');
create policy "customer can read own reviews" on reviews
  for select to authenticated using (customer_id = auth.uid());
create policy "customer can submit a review" on reviews
  for insert to authenticated with check (customer_id = auth.uid());
create policy "customer can update own reviews" on reviews
  for update to authenticated
  using (customer_id = auth.uid() and status = 'pending')
  with check (customer_id = auth.uid() and status = 'pending');
create policy "reviews.moderate can read all reviews" on reviews
  for select to authenticated using (has_permission(auth.uid(), 'reviews.read'));
create policy "reviews.moderate can update reviews" on reviews
  for update to authenticated
  using (has_permission(auth.uid(), 'reviews.moderate'))
  with check (has_permission(auth.uid(), 'reviews.moderate'));
create policy "reviews.moderate can delete reviews" on reviews
  for delete to authenticated using (has_permission(auth.uid(), 'reviews.moderate'));

-- Add constraint to ensure exactly one transaction reference per review
alter table reviews
  add constraint reviews_transaction_reference_check
  check (
    (review_type = 'product' and order_id is not null and rental_booking_id is null and repair_ticket_id is null) or
    (review_type = 'rental' and rental_booking_id is not null and order_id is null and repair_ticket_id is null) or
    (review_type = 'repair' and repair_ticket_id is not null and order_id is null and rental_booking_id is null)
  );

-- Create function to verify purchase for reviews
create or replace function public.verify_review_purchase()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  is_verified boolean := false;
begin
  if new.review_type = 'product' and new.order_id is not null then
    -- Verify customer owns the order and it's completed
    select exists(
      select 1 from orders o
      where o.id = new.order_id
        and o.customer_id = new.customer_id
        and o.order_status = 'completed'
    ) into is_verified;
  elsif new.review_type = 'rental' and new.rental_booking_id is not null then
    -- Verify customer owns the rental and it's returned/completed
    select exists(
      select 1 from rental_bookings rb
      where rb.id = new.rental_booking_id
        and rb.customer_id = new.customer_id
        and rb.status in ('returned', 'completed')
    ) into is_verified;
  elsif new.review_type = 'repair' and new.repair_ticket_id is not null then
    -- Verify customer owns the repair and it's completed
    select exists(
      select 1 from repair_tickets rt
      where rt.id = new.repair_ticket_id
        and rt.customer_id = new.customer_id
        and rt.status = 'completed'
    ) into is_verified;
  end if;
  
  new.verified_purchase := is_verified;
  return new;
end;
$$;

create trigger verify_review_purchase_trigger before insert on reviews
  for each row execute function verify_review_purchase();

-- Create function to prevent duplicate reviews for same transaction
create or replace function public.prevent_duplicate_review()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  duplicate_exists boolean := false;
begin
  if new.review_type = 'product' and new.order_id is not null then
    select exists(
      select 1 from reviews r
      where r.order_id = new.order_id
        and r.customer_id = new.customer_id
        and r.product_id = new.product_id
        and r.status != 'rejected'
    ) into duplicate_exists;
  elsif new.review_type = 'rental' and new.rental_booking_id is not null then
    select exists(
      select 1 from reviews r
      where r.rental_booking_id = new.rental_booking_id
        and r.customer_id = new.customer_id
        and r.status != 'rejected'
    ) into duplicate_exists;
  elsif new.review_type = 'repair' and new.repair_ticket_id is not null then
    select exists(
      select 1 from reviews r
      where r.repair_ticket_id = new.repair_ticket_id
        and r.customer_id = new.customer_id
        and r.status != 'rejected'
    ) into duplicate_exists;
  end if;
  
  if duplicate_exists then
    raise exception 'You have already submitted a review for this transaction';
  end if;
  
  return new;
end;
$$;

create trigger prevent_duplicate_review_trigger before insert on reviews
  for each row execute function prevent_duplicate_review();
