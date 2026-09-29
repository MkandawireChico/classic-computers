-- 0003_roles_and_permissions.sql
-- Role/permission catalogue and the many-to-many grants between them.
-- No RLS "read" restriction on roles/permissions for authenticated users —
-- knowing that a "products.write" permission key exists is not sensitive;
-- what's sensitive is who holds it, guarded below.

create table roles (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  description text,
  created_at timestamptz not null default now()
);

create table permissions (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  description text,
  created_at timestamptz not null default now()
);

create table role_permissions (
  role_id uuid not null references roles(id) on delete cascade,
  permission_id uuid not null references permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);

create table user_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role_id uuid not null references roles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, role_id)
);
create index user_roles_user_id_idx on user_roles(user_id);

alter table roles enable row level security;
alter table permissions enable row level security;
alter table role_permissions enable row level security;
alter table user_roles enable row level security;

-- Any authenticated user can read the role/permission catalogue (needed so
-- the admin UI can render a role-assignment screen); only users.manage /
-- roles.manage holders can write. Regular users can see their OWN role
-- assignments only.
create policy "roles readable by authenticated" on roles
  for select to authenticated using (true);

create policy "permissions readable by authenticated" on permissions
  for select to authenticated using (true);

create policy "role_permissions readable by authenticated" on role_permissions
  for select to authenticated using (true);

create policy "user can read own role assignments" on user_roles
  for select to authenticated using (user_id = auth.uid());

-- Write policies for roles/permissions/role_permissions/user_roles are added
-- in 0005 once has_permission() exists, to avoid a forward reference.

-- ------------------------------------------------------------------
-- Seed: the role/permission catalogue itself. This is real production
-- configuration required for the app to function (not test/demo data) —
-- distinct from the development-only sample data in 0030_dev_seed_data.sql.
-- ------------------------------------------------------------------
insert into roles (name, description) values
  ('admin', 'Full access to every module.'),
  ('staff', 'Day-to-day store operations: products, inventory, orders, customers, reviews, students (read).'),
  ('sales', 'Orders and customer-facing sales information.'),
  ('technician', 'Repair tickets assigned to them.'),
  ('customer', 'Storefront customer — access governed by ownership, not permission keys.');

insert into permissions (key, description) values
  ('products.read', 'View product catalogue (including unpublished/draft).'),
  ('products.write', 'Create/edit products, variants, images, specifications.'),
  ('products.delete', 'Delete products.'),
  ('inventory.read', 'View stock levels and movement history.'),
  ('inventory.write', 'Receive stock / create inventory records.'),
  ('inventory.adjust', 'Make manual stock adjustments/corrections.'),
  ('orders.read', 'View orders.'),
  ('orders.write', 'Update order status, notes, fulfillment.'),
  ('orders.cancel', 'Cancel an order.'),
  ('customers.read', 'View customer records.'),
  ('customers.write', 'Edit customer records.'),
  ('repairs.read', 'View repair tickets.'),
  ('repairs.write', 'Update repair tickets.'),
  ('rentals.read', 'View rental products/bookings.'),
  ('rentals.write', 'Update rental products/bookings.'),
  ('reviews.read', 'View reviews (including pending).'),
  ('reviews.moderate', 'Approve/reject/hide reviews.'),
  ('students.read', 'View student verification requests.'),
  ('students.verify', 'Approve/reject student verification, view documents.'),
  ('reports.read', 'View admin reports.'),
  ('settings.read', 'View site settings (including non-public ones).'),
  ('settings.write', 'Edit site settings and discounts.'),
  ('users.manage', 'Provision staff accounts and assign roles.'),
  ('roles.manage', 'Edit role/permission grants.'),
  ('audit_logs.read', 'View the audit log.');

-- Default role -> permission grants (changeable later via /admin/users).
insert into role_permissions (role_id, permission_id)
select r.id, p.id from roles r cross join permissions p where r.name = 'admin';

insert into role_permissions (role_id, permission_id)
select r.id, p.id from roles r, permissions p
where r.name = 'staff' and p.key in (
  'products.read', 'products.write',
  'inventory.read', 'inventory.write',
  'orders.read', 'orders.write',
  'customers.read', 'customers.write',
  'reviews.read', 'reviews.moderate',
  'students.read',
  'reports.read'
);

insert into role_permissions (role_id, permission_id)
select r.id, p.id from roles r, permissions p
where r.name = 'sales' and p.key in ('orders.read', 'orders.write', 'customers.read', 'reports.read');

insert into role_permissions (role_id, permission_id)
select r.id, p.id from roles r, permissions p
where r.name = 'technician' and p.key in ('repairs.read', 'repairs.write');

-- 'customer' intentionally gets no role_permissions rows: customer access is
-- entirely ownership-based (auth.uid() = ... comparisons), not permission keys.
