-- Product specification writes are authorized by products.write RLS, but
-- PostgreSQL still requires table privileges for authenticated users to
-- insert/update/delete rows through the Data API.

grant insert, update, delete on table public.product_specifications to authenticated;
