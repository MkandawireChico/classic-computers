-- product_views already has an insert-only public RLS policy (0013), but
-- Postgres table privileges are also required for the Data API to reach it.
grant insert on table public.product_views to anon, authenticated;
