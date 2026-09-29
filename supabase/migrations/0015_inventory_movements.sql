-- 0015_inventory_movements.sql
-- Append-only ledger. quantity_on_hand on `inventory` is a maintained
-- rollup; this table is the source of truth and audit trail for how it
-- got there. Rows are never updated or deleted by the application.

create table inventory_movements (
  id uuid primary key default gen_random_uuid(),
  inventory_id uuid not null references inventory(id) on delete cascade,
  movement_type movement_type_enum not null,
  quantity_delta int not null,
  reference_type text,
  reference_id uuid,
  note text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index inventory_movements_inventory_time_idx
  on inventory_movements(inventory_id, created_at);

alter table inventory_movements enable row level security;

create policy "inventory.read can read movements" on inventory_movements
  for select to authenticated using (has_permission(auth.uid(), 'inventory.read'));
-- No UPDATE/DELETE policy for anyone — append-only by omission (default
-- deny). INSERT only through the apply_inventory_movement() function below,
-- which runs security definer, so even inventory.adjust holders go through
-- one audited path rather than free-form inserts.

-- ------------------------------------------------------------------
-- apply_inventory_movement(): the ONLY sanctioned way to change stock.
-- Atomically locks the inventory row, applies the delta, and writes the
-- ledger entry in the same transaction — so quantity_on_hand and its
-- movement history can never drift apart, and a negative-stock attempt
-- is rejected by the same CHECK constraint as any other write.
-- ------------------------------------------------------------------
create or replace function public.apply_inventory_movement(
  p_inventory_id uuid,
  p_movement_type movement_type_enum,
  p_quantity_delta int,
  p_reference_type text default null,
  p_reference_id uuid default null,
  p_note text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not (has_permission(auth.uid(), 'inventory.write') or has_permission(auth.uid(), 'inventory.adjust')) then
    raise exception 'Missing permission: inventory.write or inventory.adjust';
  end if;

  update inventory
  set quantity_on_hand = quantity_on_hand + p_quantity_delta
  where id = p_inventory_id;
  -- The quantity_on_hand >= 0 CHECK constraint on `inventory` rejects this
  -- update (and the whole transaction) if the movement would drive stock
  -- negative — that is the negative-stock prevention mechanism, enforced
  -- once at the data layer rather than re-implemented per call site.

  insert into inventory_movements (
    inventory_id, movement_type, quantity_delta, reference_type, reference_id, note, created_by
  ) values (
    p_inventory_id, p_movement_type, p_quantity_delta, p_reference_type, p_reference_id, p_note, auth.uid()
  );
end;
$$;

revoke all on function public.apply_inventory_movement(uuid, movement_type_enum, int, text, uuid, text) from public;
grant execute on function public.apply_inventory_movement(uuid, movement_type_enum, int, text, uuid, text) to authenticated;
