-- 0043_rental_internal_notes.sql
--
-- Found during the Phase 6 integrity review: rental_bookings (0022) has
-- exactly one `notes` column — the customer's own additional
-- requirements, submitted at booking time. The admin rentals module
-- built earlier in this phase added an "internal notes" editor that
-- writes to this SAME column, which both (a) destructively overwrites
-- whatever the customer originally wrote, and (b) means any internal-only
-- staff note becomes visible to the customer via /account/rentals/[id]
-- and to a guest via the tracking token lookup — since both of those
-- select `notes` and display it as the customer's own. This is the same
-- bug class as orders.notes vs orders.internal_notes, already fixed once
-- in Phase 4 (migration 0035) — reintroduced here in a different table
-- during this phase and caught by the integrity review before being
-- reported as done, not after.

alter table rental_bookings add column internal_notes text;

comment on column rental_bookings.internal_notes is
  'Staff-only internal notes about the booking. Never shown to the customer or a guest via tracking_token — distinct from rental_bookings.notes, which is the customer''s own request notes and must not be overwritten by admin actions.';
