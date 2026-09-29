-- 0024_enquiries.sql

create table enquiries (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete set null,
  name text not null,
  phone text,
  email text,
  topic enquiry_topic_enum not null,
  message text not null,
  status enquiry_status_enum not null default 'new',
  created_at timestamptz not null default now()
);

create table corporate_enquiries (
  id uuid primary key default gen_random_uuid(),
  organisation_name text not null,
  contact_person text not null,
  phone text not null,
  email text not null,
  products_required text,
  quantity int,
  budget numeric(12,2),
  delivery_location text,
  additional_requirements text,
  status corporate_status_enum not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_corporate_enquiries_updated_at before update on corporate_enquiries
  for each row execute function set_updated_at();

alter table enquiries enable row level security;
alter table corporate_enquiries enable row level security;

create policy "anyone can submit an enquiry" on enquiries
  for insert to anon, authenticated with check (true);
create policy "customer can read own enquiries" on enquiries
  for select to authenticated using (customer_id = auth.uid());
create policy "customers.read can read all enquiries" on enquiries
  for select to authenticated using (has_permission(auth.uid(), 'customers.read'));
create policy "customers.write can update enquiries" on enquiries
  for update to authenticated
  using (has_permission(auth.uid(), 'customers.write'))
  with check (has_permission(auth.uid(), 'customers.write'));

create policy "anyone can submit a corporate enquiry" on corporate_enquiries
  for insert to anon, authenticated with check (true);
create policy "customers.read can read corporate enquiries" on corporate_enquiries
  for select to authenticated using (has_permission(auth.uid(), 'customers.read'));
create policy "customers.write can update corporate enquiries" on corporate_enquiries
  for update to authenticated
  using (has_permission(auth.uid(), 'customers.write'))
  with check (has_permission(auth.uid(), 'customers.write'));
