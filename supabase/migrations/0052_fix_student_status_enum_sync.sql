-- Verification and customer status use separate PostgreSQL enum types.
-- Convert through text when syncing their shared status values.
create or replace function public.sync_customer_student_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.customers
  set student_status = new.status::text::public.student_status_enum
  where id = new.customer_id;
  return new;
end;
$$;