-- Public storefronts need availability status, but must not expose stock counts.
create or replace view public.storefront_inventory_status
with (security_barrier = true)
as
select product_id, variant_id, status
from public.inventory;

grant select on public.storefront_inventory_status to anon, authenticated;