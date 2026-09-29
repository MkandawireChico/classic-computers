-- 0044_public_storefront_select_grants.sql
--
-- The storefront relies on RLS policies already defined in earlier
-- migrations, but the anon/authenticated roles were never granted SELECT
-- on the public-read tables. PostgreSQL enforces both policy evaluation
-- and table privileges, so these roles still hit "permission denied" even
-- though the row-level policies themselves are correct.
--
-- Keep this migration intentionally narrow: only the tables that the
-- public storefront reads are granted read access. No write grants are
-- added, no private tables are exposed, and RLS remains enabled.

grant select on table public.brands to anon, authenticated;
grant select on table public.categories to anon, authenticated;
grant select on table public.products to anon, authenticated;
grant select on table public.product_variants to anon, authenticated;
grant select on table public.product_images to anon, authenticated;
grant select on table public.product_specifications to anon, authenticated;
grant select on table public.specification_definitions to anon, authenticated;
grant select on table public.inventory to anon, authenticated;
grant select on table public.discounts to anon, authenticated;
grant select on table public.discount_products to anon, authenticated;
grant select on table public.discount_categories to anon, authenticated;
grant select on table public.rental_products to anon, authenticated;
grant select on table public.site_settings to anon, authenticated;
grant select on table public.site_media to anon, authenticated;
grant select on table public.reviews to anon, authenticated;
