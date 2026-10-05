-- Server-only guest flows use service_role after checking the caller's
-- httpOnly cart cookie, order-confirmation cookie, or high-entropy tracking
-- token in application code. RLS policies are unchanged; no privileges are
-- granted to anon or authenticated by this migration.

grant select on table public.products, public.product_variants, public.product_images
  to service_role;
grant select on table public.storefront_inventory_status
  to service_role;

grant select, insert, update on table public.carts
  to service_role;
grant select, insert, update, delete on table public.cart_items
  to service_role;

grant select on table public.orders, public.order_items, public.order_status_history
  to service_role;
grant select on table public.rental_products, public.rental_bookings
  to service_role;
grant select on table public.repair_tickets, public.repair_updates
  to service_role;