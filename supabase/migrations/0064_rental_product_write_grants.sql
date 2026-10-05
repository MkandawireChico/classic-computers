-- Authenticated staff need table privileges in addition to the existing
-- rentals.write RLS policy. No anon write access or delete privilege is granted.
grant insert, update on table public.rental_products to authenticated;
