-- product_specifications previously used a single unique index on
-- (product_id, variant_id, spec_definition_id). That allows duplicate
-- product-level specs because NULL values are treated as distinct in a B-tree
-- unique index. Keep one row per product-level spec and one row per
-- variant-specific spec.

with ranked_product_specs as (
  select
    id,
    row_number() over (
      partition by product_id, spec_definition_id
      order by id
    ) as position
  from public.product_specifications
  where variant_id is null
)
delete from public.product_specifications as specs
using ranked_product_specs as ranked
where specs.id = ranked.id
  and ranked.position > 1;

with ranked_variant_specs as (
  select
    id,
    row_number() over (
      partition by product_id, variant_id, spec_definition_id
      order by id
    ) as position
  from public.product_specifications
  where variant_id is not null
)
delete from public.product_specifications as specs
using ranked_variant_specs as ranked
where specs.id = ranked.id
  and ranked.position > 1;

drop index if exists public.product_specifications_product_id_variant_id_spec_definitio_key;

create unique index product_specifications_one_per_product_spec
  on public.product_specifications(product_id, spec_definition_id)
  where variant_id is null;

create unique index product_specifications_one_per_variant_spec
  on public.product_specifications(product_id, variant_id, spec_definition_id)
  where variant_id is not null;
