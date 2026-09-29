-- Variant mutations require both table privileges and the existing
-- products.write row-level security policy.
grant insert, update, delete on table public.product_variants to authenticated;