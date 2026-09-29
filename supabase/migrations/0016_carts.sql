-- 0016_carts.sql
-- No price is stored on cart_items — price is always looked up live from
-- products/product_variants, so a stale cart never shows a stale price.

create table carts (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete cascade,
  session_token text unique,
  status cart_status_enum not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (customer_id is not null or session_token is not null)
);

create table cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references carts(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  variant_id uuid references product_variants(id) on delete cascade,
  quantity int not null check (quantity > 0),
  created_at timestamptz not null default now(),
  unique (cart_id, product_id, variant_id)
);

create trigger set_carts_updated_at before update on carts
  for each row execute function set_updated_at();

alter table carts enable row level security;
alter table cart_items enable row level security;

create policy "customer manages own cart" on carts
  for all to authenticated
  using (customer_id = auth.uid())
  with check (customer_id = auth.uid());

create policy "customer manages own cart items" on cart_items
  for all to authenticated
  using (exists (select 1 from carts c where c.id = cart_id and c.customer_id = auth.uid()))
  with check (exists (select 1 from carts c where c.id = cart_id and c.customer_id = auth.uid()));

-- Guest carts (customer_id is null, identified by session_token) are
-- intentionally NOT given a direct anon RLS policy here: an anon client has
-- no stable identity for RLS to key off, so guest cart reads/writes are
-- brokered by a Server Action running as the service-role client, which
-- checks the session_token cookie itself before touching the row. This is
-- documented in lib/supabase/server-admin.ts as one of the sanctioned uses
-- of the privileged client.
