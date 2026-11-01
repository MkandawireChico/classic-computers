-- Authenticated staff need column-level UPDATE privileges in addition to the
-- orders.write RLS policy. RLS continues to enforce which staff may update.
grant update (order_status, payment_status, internal_notes)
on table public.orders
to authenticated;
