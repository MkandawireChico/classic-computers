-- Append-only repair status history.
-- Existing tickets receive a baseline snapshot at their original creation time.
-- Historical transitions before this migration are not reconstructed.

create table if not exists public.repair_status_history (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.repair_tickets(id) on delete cascade,
  from_status public.repair_status_enum,
  to_status public.repair_status_enum not null,
  changed_by uuid references auth.users(id) on delete set null,
  assigned_technician_id uuid references auth.users(id) on delete set null,
  is_baseline boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists repair_status_history_ticket_idx
  on public.repair_status_history(ticket_id, created_at desc);
create index if not exists repair_status_history_completed_idx
  on public.repair_status_history(created_at desc)
  where to_status = 'completed';

alter table public.repair_status_history enable row level security;

drop policy if exists "repairs.read can read status history" on public.repair_status_history;
create policy "repairs.read can read status history"
  on public.repair_status_history
  for select to authenticated
  using (public.has_permission(auth.uid(), 'repairs.read'));

grant select on public.repair_status_history to authenticated;
revoke insert, update, delete on public.repair_status_history from anon, authenticated;

create or replace function public.record_repair_status_history()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.repair_status_history (
      ticket_id, from_status, to_status, changed_by, assigned_technician_id, is_baseline, created_at
    ) values (
      new.id, null, new.status, auth.uid(), new.assigned_technician_id, false, coalesce(new.created_at, now())
    );
  elsif old.status is distinct from new.status then
    insert into public.repair_status_history (
      ticket_id, from_status, to_status, changed_by, assigned_technician_id, is_baseline
    ) values (
      new.id, old.status, new.status, auth.uid(), new.assigned_technician_id, false
    );
  end if;
  return new;
end;
$$;

drop trigger if exists record_repair_status_history_trigger on public.repair_tickets;
create trigger record_repair_status_history_trigger
  after insert or update of status on public.repair_tickets
  for each row execute function public.record_repair_status_history();

-- Snapshot current state for pre-existing tickets. These rows establish the
-- earliest known state only; they do not claim to record historical changes.
insert into public.repair_status_history (
  ticket_id, from_status, to_status, changed_by, assigned_technician_id, is_baseline, created_at
)
select t.id, null, t.status, null, t.assigned_technician_id, true, t.created_at
from public.repair_tickets t
where not exists (
  select 1 from public.repair_status_history h where h.ticket_id = t.id
);

revoke all on function public.record_repair_status_history() from public, anon, authenticated;

comment on table public.repair_status_history is
  'Append-only repair status transitions. Existing ticket rows backfilled as baseline snapshots; pre-migration transitions are not known.';
