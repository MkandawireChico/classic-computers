-- Restore table-level privileges required by existing, permission-scoped RLS policies.
-- RLS remains enabled and continues to decide which authenticated users may act.

grant update on table public.rental_bookings to authenticated;
grant select on table public.inventory_movements to authenticated;
