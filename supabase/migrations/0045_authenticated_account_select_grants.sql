-- 0045_authenticated_account_select_grants.sql
--
-- The authenticated storefront customer experience is deliberately protected by
-- row-level security, but the tables behind those policies were never granted
-- SELECT access to the authenticated role. PostgreSQL checks both: the query is
-- allowed only if the table privilege exists and the RLS policy passes.
--
-- Keep this migration deliberately narrow: only the tables the current logged-in
-- customer legitimately reads are granted SELECT. No write grants are added, and
-- no anonymous access is exposed.

grant select on table public.profiles to authenticated;
grant select on table public.customers to authenticated;
grant select on table public.addresses to authenticated;
grant select on table public.orders to authenticated;
grant select on table public.order_items to authenticated;
grant select on table public.order_status_history to authenticated;
grant select on table public.repair_tickets to authenticated;
grant select on table public.repair_updates to authenticated;
grant select on table public.repair_parts to authenticated;
grant select on table public.rental_bookings to authenticated;
grant select on table public.rental_status_history to authenticated;
grant select on table public.student_verifications to authenticated;
grant select on table public.notifications to authenticated;
grant select on table public.enquiries to authenticated;
grant select on table public.wishlists to authenticated;
grant select on table public.wishlist_items to authenticated;
