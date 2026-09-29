-- Authenticated customers may submit their own verification requests.
-- Row-level security still restricts inserted rows to auth.uid().
grant insert on table public.student_verifications to authenticated;