-- Staff with students.verify may update verification decisions.
-- The existing RLS policy still limits which rows they can update.
grant update on table public.student_verifications to authenticated;