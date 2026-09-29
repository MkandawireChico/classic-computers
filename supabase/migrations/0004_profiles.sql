-- 0004_profiles.sql
-- One profile row per auth.users row, created automatically on signup.

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  avatar_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "user can read own profile" on profiles
  for select to authenticated using (id = auth.uid());

create policy "user can update own profile" on profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- Auto-provision a profile (and the default 'customer' role) whenever a new
-- auth.users row is created. security definer because the trigger runs as
-- the table owner, not the new user, and needs to insert into user_roles
-- which the new user has no direct write access to.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  customer_role_id uuid;
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');

  select id into customer_role_id from public.roles where name = 'customer';
  if customer_role_id is not null then
    insert into public.user_roles (user_id, role_id)
    values (new.id, customer_role_id)
    on conflict do nothing;
  end if;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
