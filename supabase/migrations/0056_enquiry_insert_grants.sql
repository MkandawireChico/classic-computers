-- Visitors may submit enquiries; the existing RLS policy still validates
-- row access, and admin reads/updates remain permission-gated.
grant insert on table public.enquiries to anon, authenticated;