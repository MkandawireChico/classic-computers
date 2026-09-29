-- PostgreSQL unique indexes treat NULL values as distinct, so the original
-- (product_id, variant_id) index did not prevent multiple product-level
-- primaries where variant_id is NULL. Keep the earliest displayed primary
-- and clear any duplicates before enforcing one primary per image group.
with ranked_product_primaries as (
  select
    id,
    row_number() over (partition by product_id order by display_order, created_at, id) as position
  from public.product_images
  where variant_id is null and is_primary
)
update public.product_images as images
set is_primary = false
from ranked_product_primaries as ranked
where images.id = ranked.id
  and ranked.position > 1;

drop index if exists public.product_images_one_primary;

create unique index product_images_one_primary_product
  on public.product_images(product_id)
  where is_primary and variant_id is null;

create unique index product_images_one_primary_variant
  on public.product_images(product_id, variant_id)
  where is_primary and variant_id is not null;
