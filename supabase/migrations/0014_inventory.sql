-- 0014_inventory.sql

create table inventory (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  variant_id uuid references product_variants(id) on delete cascade,
  quantity_on_hand int not null default 0 check (quantity_on_hand >= 0),
  quantity_reserved int not null default 0 check (quantity_reserved >= 0),
  low_stock_threshold int not null default 3,
  status inventory_status_enum not null default 'out_of_stock',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, variant_id)
);

create trigger set_inventory_updated_at before update on inventory
  for each row execute function set_updated_at();

-- Keeps `status` in sync with quantity vs threshold automatically, so
-- nothing in the application layer has to remember to update it.
-- 'discontinued' and 'coming_soon' are set explicitly by staff and are
-- left alone by this trigger (it only ever writes in_stock/low_stock/
-- out_of_stock).
create or replace function public.sync_inventory_status()
returns trigger
language plpgsql
as $$
begin
  if new.status in ('discontinued', 'coming_soon') then
    return new;
  end if;

  if new.quantity_on_hand <= 0 then
    new.status := 'out_of_stock';
  elsif new.quantity_on_hand <= new.low_stock_threshold then
    new.status := 'low_stock';
  else
    new.status := 'in_stock';
  end if;

  return new;
end;
$$;

create trigger sync_inventory_status_trigger before insert or update
  on inventory
  for each row execute function sync_inventory_status();

alter table inventory enable row level security;

create policy "inventory.read can read inventory" on inventory
  for select to authenticated using (has_permission(auth.uid(), 'inventory.read'));
create policy "inventory.write can insert inventory" on inventory
  for insert to authenticated with check (has_permission(auth.uid(), 'inventory.write'));
create policy "inventory.write or adjust can update inventory" on inventory
  for update to authenticated
  using (has_permission(auth.uid(), 'inventory.write') or has_permission(auth.uid(), 'inventory.adjust'))
  with check (has_permission(auth.uid(), 'inventory.write') or has_permission(auth.uid(), 'inventory.adjust'));
