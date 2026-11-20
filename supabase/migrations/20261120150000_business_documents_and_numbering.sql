-- Document numbering and itemised quotation / invoice foundation.
-- Both public-facing sequences begin at 1001 and are independent.
create sequence if not exists public.quotation_number_seq start with 1001 increment by 1;
create sequence if not exists public.invoice_number_seq start with 1001 increment by 1;

create table if not exists public.business_documents (
  id uuid primary key default gen_random_uuid(),
  document_type text not null check (document_type in ('quotation','invoice')),
  document_number bigint not null,
  source_type text not null check (source_type in ('repair','order','rental','manual')),
  source_id uuid,
  customer_id uuid references public.customers(id) on delete set null,
  customer_name text not null,
  customer_email text,
  customer_phone text,
  billing_address text,
  currency text not null default 'MWK' check (currency = 'MWK'),
  status text not null default 'draft' check (status in ('draft','issued','accepted','rejected','partially_paid','paid','void')),
  subtotal numeric(14,2) not null default 0 check (subtotal >= 0),
  discount_amount numeric(14,2) not null default 0 check (discount_amount >= 0),
  discount_reason text,
  discount_authorized_by uuid references auth.users(id) on delete set null,
  vat_rate numeric(6,3) not null default 17.500 check (vat_rate >= 0 and vat_rate <= 100),
  ppda_rate numeric(6,3) not null default 1.000 check (ppda_rate >= 0 and ppda_rate <= 100),
  taxable_amount numeric(14,2) not null default 0 check (taxable_amount >= 0),
  vat_amount numeric(14,2) not null default 0 check (vat_amount >= 0),
  ppda_amount numeric(14,2) not null default 0 check (ppda_amount >= 0),
  grand_total numeric(14,2) not null default 0 check (grand_total >= 0),
  notes text,
  terms text,
  valid_until date,
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  issued_at timestamptz,
  accepted_at timestamptz,
  rejected_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (document_type, document_number),
  check (discount_amount <= subtotal),
  check (taxable_amount = subtotal - discount_amount),
  check (grand_total = taxable_amount + vat_amount + ppda_amount)
);

create table if not exists public.business_document_items (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.business_documents(id) on delete restrict,
  description text not null,
  quantity numeric(12,2) not null default 1 check (quantity > 0),
  unit_price numeric(14,2) not null check (unit_price >= 0),
  line_total numeric(14,2) not null check (line_total >= 0),
  product_id uuid references public.products(id) on delete set null,
  variant_id uuid references public.product_variants(id) on delete set null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists business_documents_source_idx on public.business_documents(source_type, source_id);
create index if not exists business_documents_customer_idx on public.business_documents(customer_id, created_at desc);
create index if not exists business_document_items_document_idx on public.business_document_items(document_id, sort_order);

create or replace function public.assign_business_document_number()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.document_number is null or new.document_number = 0 then
    if new.document_type = 'quotation' then
      new.document_number := nextval('public.quotation_number_seq');
    else
      new.document_number := nextval('public.invoice_number_seq');
    end if;
  end if;
  if tg_op = 'UPDATE' and old.status <> 'draft' then
    raise exception 'Issued documents are locked. Create a revision instead.';
  end if;
  if new.discount_amount > 0 then
    if new.discount_reason is null or length(trim(new.discount_reason)) < 3 then
      raise exception 'A reason is required for an authorised discount.';
    end if;
    new.discount_authorized_by := auth.uid();
  else
    new.discount_authorized_by := null;
  end if;
  if new.created_by is null then new.created_by := auth.uid(); end if;
  if new.status = 'issued' then
    select coalesce(sum(line_total), 0) into new.subtotal
    from public.business_document_items where document_id = new.id;
  end if;
  if new.discount_amount > new.subtotal then raise exception 'Discount exceeds the selling subtotal.'; end if;
  new.taxable_amount := round(new.subtotal - new.discount_amount, 2);
  new.vat_amount := round(new.taxable_amount * new.vat_rate / 100, 2);
  new.ppda_amount := round(new.taxable_amount * new.ppda_rate / 100, 2);
  new.grand_total := new.taxable_amount + new.vat_amount + new.ppda_amount;
  new.updated_at := now();
  return new;
end;
$$;

create trigger assign_business_document_number_trigger
before insert or update on public.business_documents
for each row execute function public.assign_business_document_number();

create or replace function public.guard_business_document_item_write()
returns trigger
language plpgsql
set search_path = public
as $
declare
  v_document public.business_documents%rowtype;
begin
  select * into v_document
  from public.business_documents
  where id = coalesce(new.document_id, old.document_id)
  for update;
  if not found then raise exception 'Document not found.'; end if;
  if v_document.status <> 'draft' then
    raise exception 'Issued documents are locked. Create a revision instead.';
  end if;
  if tg_op = 'DELETE' then return old; end if;
  new.line_total := round(new.quantity * new.unit_price, 2);
  return new;
end;
$;

create trigger guard_business_document_item_write_trigger
before insert or update or delete on public.business_document_items
for each row execute function public.guard_business_document_item_write();

alter table public.business_documents enable row level security;
alter table public.business_document_items enable row level security;

drop policy if exists "Staff can read business documents" on public.business_documents;
create policy "Staff can read business documents" on public.business_documents
for select to authenticated
using (
  public.has_permission(auth.uid(), 'orders.read')
  or public.has_permission(auth.uid(), 'repairs.read')
  or public.has_permission(auth.uid(), 'rentals.read')
  or customer_id = auth.uid()
);

drop policy if exists "Staff can create business documents" on public.business_documents;
create policy "Staff can create business documents" on public.business_documents
for insert to authenticated
with check (
  (source_type = 'repair' and public.has_permission(auth.uid(), 'repairs.write'))
  or (source_type = 'order' and public.has_permission(auth.uid(), 'orders.write'))
  or (source_type = 'rental' and public.has_permission(auth.uid(), 'rentals.write'))
  or (source_type = 'manual' and (
    public.has_permission(auth.uid(), 'orders.write')
    or public.has_permission(auth.uid(), 'repairs.write')
    or public.has_permission(auth.uid(), 'rentals.write')
  ))
);

drop policy if exists "Staff can update draft business documents" on public.business_documents;
create policy "Staff can update draft business documents" on public.business_documents
for update to authenticated
using (
  status = 'draft' and (
    (source_type = 'repair' and public.has_permission(auth.uid(), 'repairs.write'))
    or (source_type = 'order' and public.has_permission(auth.uid(), 'orders.write'))
    or (source_type = 'rental' and public.has_permission(auth.uid(), 'rentals.write'))
    or (source_type = 'manual' and (
      public.has_permission(auth.uid(), 'orders.write')
      or public.has_permission(auth.uid(), 'repairs.write')
      or public.has_permission(auth.uid(), 'rentals.write')
    ))
  )
)
with check (
  status in ('draft','issued') and (
    (source_type = 'repair' and public.has_permission(auth.uid(), 'repairs.write'))
    or (source_type = 'order' and public.has_permission(auth.uid(), 'orders.write'))
    or (source_type = 'rental' and public.has_permission(auth.uid(), 'rentals.write'))
    or (source_type = 'manual' and (
      public.has_permission(auth.uid(), 'orders.write')
      or public.has_permission(auth.uid(), 'repairs.write')
      or public.has_permission(auth.uid(), 'rentals.write')
    ))
  )
);

drop policy if exists "Staff can read business document items" on public.business_document_items;
create policy "Staff can read business document items" on public.business_document_items
for select to authenticated
using (
  exists (
    select 1 from public.business_documents d
    where d.id = document_id and (
      public.has_permission(auth.uid(), 'orders.read')
      or public.has_permission(auth.uid(), 'repairs.read')
      or public.has_permission(auth.uid(), 'rentals.read')
      or d.customer_id = auth.uid()
    )
  )
);

drop policy if exists "Staff can manage draft business document items" on public.business_document_items;
create policy "Staff can manage draft business document items" on public.business_document_items
for all to authenticated
using (
  exists (
    select 1 from public.business_documents d
    where d.id = document_id and d.status = 'draft' and (
      (d.source_type = 'repair' and public.has_permission(auth.uid(), 'repairs.write'))
      or (d.source_type = 'order' and public.has_permission(auth.uid(), 'orders.write'))
      or (d.source_type = 'rental' and public.has_permission(auth.uid(), 'rentals.write'))
      or (d.source_type = 'manual' and (
        public.has_permission(auth.uid(), 'orders.write')
        or public.has_permission(auth.uid(), 'repairs.write')
        or public.has_permission(auth.uid(), 'rentals.write')
      ))
    )
  )
)
with check (
  exists (
    select 1 from public.business_documents d
    where d.id = document_id and d.status = 'draft' and (
      (d.source_type = 'repair' and public.has_permission(auth.uid(), 'repairs.write'))
      or (d.source_type = 'order' and public.has_permission(auth.uid(), 'orders.write'))
      or (d.source_type = 'rental' and public.has_permission(auth.uid(), 'rentals.write'))
      or (d.source_type = 'manual' and (
        public.has_permission(auth.uid(), 'orders.write')
        or public.has_permission(auth.uid(), 'repairs.write')
        or public.has_permission(auth.uid(), 'rentals.write')
      ))
    )
  )
);

grant select, insert, update on public.business_documents to authenticated;
grant select, insert, update, delete on public.business_document_items to authenticated;
