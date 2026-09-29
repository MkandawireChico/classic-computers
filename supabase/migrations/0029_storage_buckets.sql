-- 0029_storage_buckets.sql
-- Three logically separate buckets. product-images is public read (product
-- photos need to be publicly viewable); the other two are private and only
-- ever reachable via a server-generated signed URL after an application-
-- level permission check.

insert into storage.buckets (id, name, public)
values
  ('product-images', 'product-images', true),
  ('repair-documents', 'repair-documents', false),
  ('student-documents', 'student-documents', false)
on conflict (id) do nothing;

-- product-images: public read, writes require products.write
create policy "product-images public read" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'product-images');

create policy "product-images write requires products.write" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'product-images' and has_permission(auth.uid(), 'products.write'));

create policy "product-images update requires products.write" on storage.objects
  for update to authenticated
  using (bucket_id = 'product-images' and has_permission(auth.uid(), 'products.write'))
  with check (bucket_id = 'product-images' and has_permission(auth.uid(), 'products.write'));

create policy "product-images delete requires products.write" on storage.objects
  for delete to authenticated
  using (bucket_id = 'product-images' and has_permission(auth.uid(), 'products.write'));

-- repair-documents: private. No anon/public policy at all. Authenticated
-- read is restricted to staff with repairs.read/write; end-customer access
-- (if ever needed) is brokered via a signed URL generated server-side,
-- never a direct storage policy for arbitrary customers.
create policy "repair-documents staff read" on storage.objects
  for select to authenticated
  using (bucket_id = 'repair-documents' and has_permission(auth.uid(), 'repairs.read'));

create policy "repair-documents staff write" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'repair-documents' and has_permission(auth.uid(), 'repairs.write'));

-- student-documents: private, students.verify only. The uploading
-- customer's own read access is intentionally NOT granted as a direct
-- storage policy (an anon/authenticated customer has no reliable way to be
-- scoped to "their own path" via RLS alone here) — their own document is
-- instead served via a signed URL the Server Action generates for them
-- after checking student_verifications.customer_id = auth.uid() in
-- Postgres, which IS enforced by RLS on that table (see 0020).
-- Upload path convention (enforced below): student-documents/{auth.uid()}/{file}.
create policy "student-documents staff read" on storage.objects
  for select to authenticated
  using (bucket_id = 'student-documents' and has_permission(auth.uid(), 'students.verify'));

create policy "student-documents write on own upload" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'student-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
