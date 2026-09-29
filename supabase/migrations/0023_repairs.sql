-- 0023_repairs.sql

create table repair_tickets (
  id uuid primary key default gen_random_uuid(),
  ticket_number text unique not null,
  customer_id uuid references customers(id) on delete set null,
  guest_name text,
  guest_phone text,
  guest_email text,
  device_type text not null,
  brand text,
  model text,
  serial_number text,
  problem_description text not null,
  accessories_received text,
  status repair_status_enum not null default 'checked_in',
  assigned_technician_id uuid references auth.users(id) on delete set null,
  quote_amount numeric(12,2),
  quote_approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index repair_tickets_technician_idx on repair_tickets(assigned_technician_id);
create index repair_tickets_status_idx on repair_tickets(status);

create table repair_updates (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references repair_tickets(id) on delete cascade,
  note text not null,
  is_internal boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table repair_parts (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references repair_tickets(id) on delete cascade,
  part_name text not null,
  cost numeric(12,2) not null default 0,
  quantity int not null default 1
);

create sequence if not exists repair_ticket_number_seq;

create or replace function public.generate_ticket_number()
returns text
language plpgsql
as $$
begin
  return 'REP-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('repair_ticket_number_seq')::text, 6, '0');
end;
$$;

create or replace function public.set_ticket_number()
returns trigger
language plpgsql
as $$
begin
  if new.ticket_number is null then
    new.ticket_number := generate_ticket_number();
  end if;
  return new;
end;
$$;

create trigger set_ticket_number_trigger before insert on repair_tickets
  for each row execute function set_ticket_number();

create trigger set_repair_tickets_updated_at before update on repair_tickets
  for each row execute function set_updated_at();

create or replace function public.audit_repair_ticket_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' and old.status is distinct from new.status then
    perform log_audit_event('repair.updated', 'repair_ticket', new.id, jsonb_build_object(
      'from', old.status, 'to', new.status
    ));
  end if;
  return new;
end;
$$;

create trigger audit_repair_tickets_trigger after update on repair_tickets
  for each row execute function audit_repair_ticket_change();

alter table repair_tickets enable row level security;
alter table repair_updates enable row level security;
alter table repair_parts enable row level security;

create policy "customer can read own ticket" on repair_tickets
  for select to authenticated using (customer_id = auth.uid());
create policy "customer can create own ticket" on repair_tickets
  for insert to authenticated with check (customer_id = auth.uid());
create policy "assigned technician can read ticket" on repair_tickets
  for select to authenticated using (assigned_technician_id = auth.uid());
create policy "repairs.read can read all tickets" on repair_tickets
  for select to authenticated using (has_permission(auth.uid(), 'repairs.read'));
create policy "repairs.write can update tickets" on repair_tickets
  for update to authenticated
  using (has_permission(auth.uid(), 'repairs.write'))
  with check (has_permission(auth.uid(), 'repairs.write'));

-- Customer-facing updates only (is_internal = false); internal technician
-- notes are never exposed to the owning customer, enforced here rather than
-- by a UI toggle.
create policy "customer can read non-internal updates" on repair_updates
  for select to authenticated using (
    not is_internal
    and exists (select 1 from repair_tickets t where t.id = ticket_id and t.customer_id = auth.uid())
  );
create policy "repairs.read can read all updates" on repair_updates
  for select to authenticated using (has_permission(auth.uid(), 'repairs.read'));
create policy "repairs.write can add updates" on repair_updates
  for insert to authenticated with check (has_permission(auth.uid(), 'repairs.write'));

create policy "customer can read own ticket parts" on repair_parts
  for select to authenticated using (
    exists (select 1 from repair_tickets t where t.id = ticket_id and t.customer_id = auth.uid())
  );
create policy "repairs.write manages parts" on repair_parts
  for all to authenticated
  using (has_permission(auth.uid(), 'repairs.write'))
  with check (has_permission(auth.uid(), 'repairs.write'));
