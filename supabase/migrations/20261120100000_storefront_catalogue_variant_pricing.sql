-- Keep catalogue price display, filtering and sorting aligned with the
-- lowest-priced active product configuration. The view is security-invoker
-- so the underlying products and variants RLS policies remain in force.

create or replace view public.storefront_product_prices
with (security_invoker = true, security_barrier = true)
as
select
  p.id as product_id,
  coalesce(
    active_variant.display_price,
    case
      when p.sale_price is not null
        and p.sale_price > 0
        and p.sale_price < p.base_price
      then p.sale_price
      else p.base_price
    end
  ) as display_price,
  coalesce(active_variant.regular_price, p.base_price) as regular_price,
  (active_variant.product_id is not null) as has_active_variants
from public.products p
left join lateral (
  select
    pv.product_id,
    pv.price as regular_price,
    case
      when pv.sale_price is not null
        and pv.sale_price > 0
        and pv.sale_price < pv.price
      then pv.sale_price
      else pv.price
    end as display_price
  from public.product_variants pv
  where pv.product_id = p.id
    and pv.status = 'active'
  order by
    case
      when pv.sale_price is not null
        and pv.sale_price > 0
        and pv.sale_price < pv.price
      then pv.sale_price
      else pv.price
    end asc,
    pv.price asc,
    pv.created_at asc,
    pv.id asc
  limit 1
) active_variant on true;

grant select on public.storefront_product_prices to anon, authenticated;
