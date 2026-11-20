create table if not exists public.repair_work_logs (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.repair_tickets(id) on delete cascade,
  technician_id uuid not null references auth.users(id) on delete restrict default auth.uid(),
  work_date date not null default current_date,
  duration_minutes integer not null check (duration_minutes between 1 and 1440),
  work_performed text not null check (length(trim(work_performed)) between 3 and 2000),
  internal_note text,
  created_at timestamptz not null default now()
);

create index if not exists repair_work_logs_ticket_idx
  on public.repair_work_logs(ticket_id, work_date desc, created_at desc);
create index if not exists repair_work_logs_technician_idx
  on public.repair_work_logs(technician_id, work_date desc);

alter table public.repair_work_logs enable row level security;

drop policy if exists "repairs.read can read work logs" on public.repair_work_logs;
create policy "repairs.read can read work logs" on public.repair_work_logs
for select to authenticated
using (public.has_permission(auth.uid(), 'repairs.read'));

drop policy if exists "assigned technicians can read own work logs" on public.repair_work_logs;
create policy "assigned technicians can read own work logs" on public.repair_work_logs
for select to authenticated
using (
  technician_id = auth.uid()
  and exists (
    select 1 from public.repair_tickets t
    where t.id = ticket_id and t.assigned_technician_id = auth.uid()
  )
);

drop policy if exists "repairs.write can add work logs" on public.repair_work_logs;
create policy "repairs.write can add work logs" on public.repair_work_logs
for insert to authenticated
with check (
  technician_id = auth.uid()
  and (
    public.has_permission(auth.uid(), 'repairs.write')
    or exists (
      select 1 from public.repair_tickets t
      where t.id = ticket_id and t.assigned_technician_id = auth.uid()
    )
  )
);

grant select, insert on public.repair_work_logs to authenticated;
revoke update, delete on public.repair_work_logs from authenticated;

create or replace function public.guard_repair_work_log_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ticket public.repair_tickets%rowtype;
begin
  select * into v_ticket from public.repair_tickets where id = new.ticket_id for update;
  if not found then raise exception 'Repair ticket not found.'; end if;
  if v_ticket.status in ('completed','cancelled') then
    raise exception 'Work logs cannot be added to a completed or cancelled repair.';
  end if;
  if not (
    public.has_permission(auth.uid(), 'repairs.write')
    or v_ticket.assigned_technician_id = auth.uid()
  ) then
    raise exception 'You are not assigned to this repair.';
  end if;
  new.technician_id := auth.uid();
  return new;
end;
$$;

drop trigger if exists guard_repair_work_log_insert_trigger on public.repair_work_logs;
create trigger guard_repair_work_log_insert_trigger
before insert on public.repair_work_logs
for each row execute function public.guard_repair_work_log_insert();

create or replace function public.audit_repair_work_log_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.log_audit_event(
    'repair.work_logged',
    'repair_ticket',
    new.ticket_id,
    jsonb_build_object('work_log_id', new.id, 'duration_minutes', new.duration_minutes)
  );
  return new;
end;
$$;

drop trigger if exists audit_repair_work_log_insert_trigger on public.repair_work_logs;
create trigger audit_repair_work_log_insert_trigger
after insert on public.repair_work_logs
for each row execute function public.audit_repair_work_log_insert();
