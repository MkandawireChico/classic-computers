-- 0020_student_verifications.sql
-- document_path points into the PRIVATE student-documents Storage bucket
-- (see 0029) — never a publicly resolvable URL.

create table student_verifications (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  full_name text not null,
  institution text not null,
  student_id_number text not null,
  phone text not null,
  email text not null,
  document_path text,
  status verification_status_enum not null default 'pending',
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index student_verifications_customer_idx on student_verifications(customer_id);

create trigger set_student_verifications_updated_at before update on student_verifications
  for each row execute function set_updated_at();

create or replace function public.audit_student_verification_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' and old.status is distinct from new.status then
    perform log_audit_event(
      case new.status
        when 'approved' then 'student.approved'
        when 'rejected' then 'student.rejected'
        else 'student.status_changed'
      end,
      'student_verification', new.id, jsonb_build_object('from', old.status, 'to', new.status)
    );
  end if;
  return new;
end;
$$;

create trigger audit_student_verifications_trigger after update on student_verifications
  for each row execute function audit_student_verification_change();

-- Also keep customers.student_status in sync so the rest of the app can
-- check eligibility without joining student_verifications every time.
create or replace function public.sync_customer_student_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update customers set student_status = new.status where id = new.customer_id;
  return new;
end;
$$;

create trigger sync_customer_student_status_trigger
  after insert or update of status on student_verifications
  for each row execute function sync_customer_student_status();

alter table student_verifications enable row level security;

create policy "customer can read own verification" on student_verifications
  for select to authenticated using (customer_id = auth.uid());
create policy "customer can submit own verification" on student_verifications
  for insert to authenticated with check (customer_id = auth.uid());
create policy "students.read can read verifications" on student_verifications
  for select to authenticated using (has_permission(auth.uid(), 'students.read'));
create policy "students.verify can update verifications" on student_verifications
  for update to authenticated
  using (has_permission(auth.uid(), 'students.verify'))
  with check (has_permission(auth.uid(), 'students.verify'));
