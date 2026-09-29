-- 0005_helper_functions.sql
-- Shared functions used by RLS policies and application code throughout
-- the rest of the schema.

-- ------------------------------------------------------------------
-- has_permission(): the single source of truth for permission checks,
-- called both from RLS policies and from lib/auth/permissions.ts.
-- security definer so it can read role_permissions/permissions (which
-- ordinary users have no row-level access to write) while only ever
-- returning a boolean — it never exposes the underlying rows.
-- ------------------------------------------------------------------
create or replace function public.has_permission(uid uuid, permission_key text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.role_permissions rp on rp.role_id = ur.role_id
    join public.permissions p on p.id = rp.permission_id
    where ur.user_id = uid
      and p.key = permission_key
  );
$$;

revoke all on function public.has_permission(uuid, text) from public;
grant execute on function public.has_permission(uuid, text) to authenticated, anon;

-- ------------------------------------------------------------------
-- has_role(): coarse role check, used where "is this an admin" reads
-- more clearly in a policy than a specific permission key.
-- ------------------------------------------------------------------
create or replace function public.has_role(uid uuid, role_name text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = uid
      and r.name = role_name
  );
$$;

revoke all on function public.has_role(uuid, text) from public;
grant execute on function public.has_role(uuid, text) to authenticated, anon;

-- ------------------------------------------------------------------
-- set_updated_at(): generic trigger function, attached per-table to
-- every mutable table's updated_at column.
-- ------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ------------------------------------------------------------------
-- log_audit_event(): security definer insert into audit_logs, called
-- from per-table triggers added alongside those tables. Ordinary roles
-- never get direct INSERT on audit_logs (see 0028) — this function is
-- the only path in.
-- ------------------------------------------------------------------
create or replace function public.log_audit_event(
  p_action text,
  p_entity_type text,
  p_entity_id uuid,
  p_metadata jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.audit_logs (actor_id, action, entity_type, entity_id, metadata)
  values (auth.uid(), p_action, p_entity_type, p_entity_id, p_metadata);
end;
$$;

-- ------------------------------------------------------------------
-- Now that has_permission() exists, add the write policies for the
-- role/permission tables from 0003 (users.manage / roles.manage only).
-- ------------------------------------------------------------------
create policy "roles.manage can write roles" on roles
  for all to authenticated
  using (has_permission(auth.uid(), 'roles.manage'))
  with check (has_permission(auth.uid(), 'roles.manage'));

create policy "roles.manage can write permissions" on permissions
  for all to authenticated
  using (has_permission(auth.uid(), 'roles.manage'))
  with check (has_permission(auth.uid(), 'roles.manage'));

create policy "roles.manage can write role_permissions" on role_permissions
  for all to authenticated
  using (has_permission(auth.uid(), 'roles.manage'))
  with check (has_permission(auth.uid(), 'roles.manage'));

create policy "users.manage can write user_roles" on user_roles
  for all to authenticated
  using (has_permission(auth.uid(), 'users.manage'))
  with check (has_permission(auth.uid(), 'users.manage'));
