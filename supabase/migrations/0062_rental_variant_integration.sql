-- 0062_rental_variant_integration.sql
-- Reuse the existing rental_products catalog, but tie it to the real
-- product variant/inventory architecture instead of a duplicate product list.

alter table public.rental_products
  add column if not exists variant_id uuid references public.product_variants(id) on delete set null;

create index if not exists rental_products_variant_idx
  on public.rental_products(variant_id);

create unique index if not exists rental_products_product_variant_unique
  on public.rental_products(product_id, variant_id)
  where variant_id is not null;

create unique index if not exists rental_products_single_product_level_unique
  on public.rental_products(product_id)
  where variant_id is null;

-- Backfill the common single-variant case so current records point to the
-- real configured variant instead of only a parent product record.
update public.rental_products rp
set variant_id = pv.id
from public.product_variants pv
where rp.variant_id is null
  and rp.product_id = pv.product_id
  and pv.is_default = true
  and (
    select count(*)
    from public.product_variants pv2
    where pv2.product_id = rp.product_id
  ) = 1;

-- For multi-variant products, keep the existing parent-product row as a
-- safe fallback, but the variant-aware queries below will prefer the
-- product_variants row when one exists.
