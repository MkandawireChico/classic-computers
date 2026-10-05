-- Expose only a computed availability count. Raw inventory quantities and
-- rental booking rows remain protected by their existing RLS policies.
create or replace function public.get_rental_available_quantity(
  p_rental_product_id uuid,
  p_start_date date default current_date,
  p_end_date date default current_date
)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select case
    when p_start_date is null or p_end_date is null or p_end_date < p_start_date then 0
    else greatest(0, coalesce((
      select inventory.quantity_on_hand - coalesce((
        select sum(bookings.quantity)::integer
        from public.rental_bookings bookings
        where bookings.rental_product_id = rental.id
          and bookings.status::text in ('requested', 'approved', 'ready')
          and bookings.start_date <= p_end_date
          and bookings.end_date >= p_start_date
      ), 0)
      from public.rental_products rental
      join public.products product
        on product.id = rental.product_id
       and product.status = 'published'
      join public.inventory inventory
        on inventory.product_id = rental.product_id
       and inventory.variant_id is not distinct from rental.variant_id
      left join public.product_variants variant
        on variant.id = rental.variant_id
       and variant.product_id = rental.product_id
      where rental.id = p_rental_product_id
        and rental.is_available = true
        and inventory.status::text not in ('discontinued', 'coming_soon')
        and (rental.variant_id is null or variant.status::text = 'active')
        and (
          rental.variant_id is not null
          or not exists (
            select 1
            from public.product_variants any_variant
            where any_variant.product_id = rental.product_id
          )
        )
    ), 0))
  end::integer;
$$;

revoke all on function public.get_rental_available_quantity(uuid, date, date) from public;
grant execute on function public.get_rental_available_quantity(uuid, date, date) to anon, authenticated;

comment on function public.get_rental_available_quantity(uuid, date, date) is
  'Returns only available units for a public rental offer and date range; does not expose booking or inventory rows.';