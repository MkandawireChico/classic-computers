-- 0040_fix_missing_customer_row.sql
--
-- CRITICAL FIX, found while wiring up referral attribution (Phase 6) but
-- affecting every phase since Phase 4.
--
-- handle_new_user() (0004) creates a `profiles` row and assigns the
-- 'customer' role on signup, but never creates a `customers` row.
-- `customers` has its own primary key (id references profiles(id)) that
-- is NOT automatically populated by anything — and eleven different
-- tables have a foreign key to customers(id): addresses, product_views,
-- carts, orders, reviews, student_verifications, referrals, rental_
-- bookings, repair_tickets, enquiries, wishlists.
--
-- Concretely: every one of those inserts (add to cart, place an order,
-- write a review, submit student verification, request a rental, book a
-- repair, submit an enquiry, save a wishlist item) would fail with a
-- foreign-key-violation error for any real customer, from the moment
-- Phase 4 shipped, because there was never a matching customers row for
-- their profiles.id. This was never caught earlier because nothing in
-- this project has been executed against a live database at any point —
-- every phase report has said so explicitly. This is the first time
-- building on top of the referral system (which reads customers
-- .referral_code) made me trace the FK chain back far enough to notice
-- the row was never created in the first place.
--
-- Fix: CREATE OR REPLACE handle_new_user() with the SAME signature
-- (trigger functions take no arguments — this is a like-for-like
-- replace, no DROP needed) so it also creates the customers row.
-- Also backfill any profiles that already exist without one, so this is
-- safe to apply to a database that already has real signups on it.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  customer_role_id uuid;
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');

  -- THE FIX: every authenticated user needs a customers row — it's what
  -- carts/orders/reviews/student_verifications/referrals/rentals/repairs/
  -- enquiries/wishlists/addresses/product_views all reference. Staff-only
  -- accounts (admin/staff/sales/technician, provisioned manually per
  -- Phase 1's design) still get one too: a staff member can also be a
  -- customer of the same shop, and having the row costs nothing since
  -- nothing forces a customers row to actually be used.
  insert into public.customers (id)
  values (new.id)
  on conflict (id) do nothing;

  select id into customer_role_id from public.roles where name = 'customer';
  if customer_role_id is not null then
    insert into public.user_roles (user_id, role_id)
    values (new.id, customer_role_id)
    on conflict do nothing;
  end if;

  return new;
end;
$$;

-- Backfill: any profile that predates this fix (e.g. created during
-- earlier testing of Phases 1-5 against a real project, if that ever
-- happened) gets its missing customers row now, retroactively.
insert into public.customers (id)
select p.id from public.profiles p
where not exists (select 1 from public.customers c where c.id = p.id)
on conflict (id) do nothing;
