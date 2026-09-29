-- 0025_notifications.sql

create table notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_user_id uuid references auth.users(id) on delete cascade,
  recipient_role_id uuid references roles(id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  is_read boolean not null default false,
  related_entity_type text,
  related_entity_id uuid,
  created_at timestamptz not null default now(),
  check (recipient_user_id is not null or recipient_role_id is not null)
);
create index notifications_recipient_user_idx on notifications(recipient_user_id);

alter table notifications enable row level security;

create policy "user can read own notifications" on notifications
  for select to authenticated using (recipient_user_id = auth.uid());
create policy "user can mark own notifications read" on notifications
  for update to authenticated
  using (recipient_user_id = auth.uid())
  with check (recipient_user_id = auth.uid());
create policy "user can read role-targeted notifications" on notifications
  for select to authenticated using (
    recipient_role_id in (select role_id from user_roles where user_id = auth.uid())
  );
-- INSERT is performed by server-side code via the privileged client
-- (creating a notification is a system action triggered by e.g. an order
-- status change, not something any user does to themselves or others).
