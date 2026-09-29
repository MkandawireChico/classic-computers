-- 0035_admin_order_internal_notes.sql
--
-- Phase 5 fix, found while wiring up admin order notes: orders.notes
-- (0017) is the CUSTOMER's own checkout notes field — the admin order
-- detail screen needs a separate, staff-only notes field, or saving an
-- internal note would silently overwrite whatever the customer wrote at
-- checkout. New column, not a repurposing of the existing one.

alter table orders add column internal_notes text;

comment on column orders.internal_notes is
  'Staff-only internal notes about the order. Never shown to the customer (no storefront/account query selects it) — distinct from orders.notes, which is the customer''s own checkout notes and must not be overwritten by admin actions.';

-- Only staff with orders.read can see internal notes at all; RLS on
-- orders already restricts customer access to their own row regardless,
-- but this column is additionally never selected by any customer-facing
-- query (lib/data/orders.ts, lib/data/order-confirmation.ts) as an
-- application-layer safeguard on top of that.
