-- Search the public catalogue using the same effective starting price
-- shown on product cards. The function runs as the caller and respects RLS.

create or replace function public.search_storefront_products(
  p_category_id uuid default null,
  p_brand_ids uuid[] default null,
  p_min_price numeric default null,
  p_max_price numeric default null,
  p_query text default null,
  p_available_only boolean default false,
  p_sort text default 'featured',
  p_limit integer default 24,
  p_offset integer default 0
)
returns table (
  product_id uuid,
  display_price numeric,
  regular_price numeric,
  has_active_variants boolean,
  total_count bigint
)
language sql
stable
security invoker
set search_path = public, pg_temp
as $$
  with priced_products as (
    select
      p.id,
      p.created_at,
      p.is_featured,
      p.name,
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
    ) active_variant on true
    where p.status = 'published'
  ),
  filtered_products as (
    select pp.*
    from priced_products pp
    join public.products p on p.id = pp.id
    where (p_category_id is null or p.category_id = p_category_id)
      and (p_brand_ids is null or p.brand_id = any(p_brand_ids))
      and (p_min_price is null or pp.display_price >= p_min_price)
      and (p_max_price is null or pp.display_price <= p_max_price)
      and (
        p_query is null
        or pp.name ilike '%' || p_query || '%'
        or p.sku ilike '%' || p_query || '%'
        or coalesce(p.description, '') ilike '%' || p_query || '%'
      )
      and (
        not p_available_only
        or exists (
          select 1
          from public.storefront_inventory_status si
          where si.product_id = pp.id
            and si.status in ('in_stock', 'low_stock')
        )
      )
  )
  select
    fp.id,
    fp.display_price,
    fp.regular_price,
    fp.has_active_variants,
    count(*) over () as total_count
  from filtered_products fp
  order by
    case when p_sort = 'price_asc' then fp.display_price end asc nulls last,
    case when p_sort = 'price_desc' then fp.display_price end desc nulls last,
    case when p_sort = 'newest' then fp.created_at end desc nulls last,
    case when p_sort = 'name' then fp.name end asc nulls last,
    case when p_sort = 'featured' or p_sort not in ('price_asc', 'price_desc', 'newest', 'name')
      then fp.is_featured end desc nulls last,
    fp.created_at desc,
    fp.id asc
  limit greatest(1, least(coalesce(p_limit, 24), 100))
  offset greatest(coalesce(p_offset, 0), 0);
$$;

revoke all on function public.search_storefront_products(
  uuid, uuid[], numeric, numeric, text, boolean, text, integer, integer
) from public;
grant execute on function public.search_storefront_products(
  uuid, uuid[], numeric, numeric, text, boolean, text, integer, integer
) to anon, authenticated;
