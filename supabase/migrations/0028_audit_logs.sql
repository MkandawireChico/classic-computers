-- 0028_audit_logs.sql
-- Insert-only, and even that is only via log_audit_event() (security
-- definer, defined in 0005) — no role gets a direct INSERT grant here, so
-- the only way a row appears is through a trigger-invoked, server-side path.

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index audit_logs_entity_idx on audit_logs(entity_type, entity_id);
create index audit_logs_created_idx on audit_logs(created_at);

alter table audit_logs enable row level security;

create policy "audit_logs.read can read audit log" on audit_logs
  for select to authenticated using (has_permission(auth.uid(), 'audit_logs.read'));
-- No INSERT/UPDATE/DELETE policy for any role — writes only happen via the
-- log_audit_event() security definer function, which runs as the table
-- owner and bypasses RLS for that single, narrow, append-only insert path.
