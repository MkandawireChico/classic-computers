-- 0059 included guest rental/repair tracking reads outside the cart and
-- checkout flow. Keep this migration limited to the four SELECT grants
-- introduced there; no anon/authenticated grants or RLS policies change.

revoke select on table public.rental_products, public.rental_bookings,
  public.repair_tickets, public.repair_updates from service_role;