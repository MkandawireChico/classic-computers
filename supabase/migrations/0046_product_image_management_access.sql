-- Product image management uses the existing products.write permission.
-- Ensure the full-access admin role retains that grant if permissions were
-- configured manually, and grant the Data API table privileges that RLS
-- policies further restrict for authenticated callers.
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
cross join public.permissions p
where r.name = 'admin'
  and p.key = 'products.write'
on conflict (role_id, permission_id) do nothing;

grant insert, update, delete on table public.product_images to authenticated;
