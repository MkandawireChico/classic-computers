-- Verified invoice payment and refund ledger.
alter table public.business_documents drop constraint if exists business_documents_status_check;
alter table public.business_documents add constraint business_documents_status_check
  check (status in ('draft','issued','accepted','rejected','partially_paid','paid','partially_refunded','refunded','void'));

create table if not exists public.business_document_transactions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.business_documents(id) on delete restrict,
  transaction_type text not null check (transaction_type in ('payment','refund')),
  amount numeric(14,2) not null check (amount > 0),
  currency text not null default 'MWK' check (currency = 'MWK'),
  provider text not null,
  provider_reference text not null,
  provider_checked boolean not null default false,
  notes text,
  recorded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create unique index if not exists business_document_transactions_provider_ref
  on public.business_document_transactions(lower(provider), lower(provider_reference));
create index if not exists business_document_transactions_document_idx
  on public.business_document_transactions(document_id, created_at desc);

alter table public.business_document_transactions enable row level security;

create policy "Customers and staff read invoice transactions"
on public.business_document_transactions
for select to authenticated
using (
  exists (
    select 1 from public.business_documents d
    where d.id = document_id and (
      d.customer_id = auth.uid()
      or (d.source_type = 'repair' and public.has_permission(auth.uid(), 'repairs.read'))
      or (d.source_type = 'order' and public.has_permission(auth.uid(), 'orders.read'))
      or (d.source_type = 'rental' and public.has_permission(auth.uid(), 'rentals.read'))
      or (d.source_type = 'manual' and (
        public.has_permission(auth.uid(), 'orders.read')
        or public.has_permission(auth.uid(), 'repairs.read')
        or public.has_permission(auth.uid(), 'rentals.read')
      ))
    )
  )
);

create policy "Staff record invoice transactions"
on public.business_document_transactions
for insert to authenticated
with check (
  provider_checked = true
  and exists (
    select 1 from public.business_documents d
    where d.id = document_id
      and d.document_type = 'invoice'
      and (
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

create or replace function public.guard_business_document_transaction()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_document public.business_documents%rowtype;
  v_paid numeric(14,2);
  v_refunded numeric(14,2);
begin
  select * into v_document
  from public.business_documents
  where id = new.document_id
  for update;
  if not found or v_document.document_type <> 'invoice' then
    raise exception 'Transactions are only accepted for issued invoices.';
  end if;
  if v_document.status not in ('issued','partially_paid','paid','partially_refunded') then
    raise exception 'This invoice is not open for transactions.';
  end if;
  if new.provider_checked is not true then
    raise exception 'Confirm the provider account was checked before recording a transaction.';
  end if;
  if length(trim(new.provider)) < 2 or length(trim(new.provider_reference)) < 3 then
    raise exception 'Enter a valid provider and transaction reference.';
  end if;

  select coalesce(sum(amount),0) into v_paid
  from public.business_document_transactions
  where document_id = new.document_id and transaction_type = 'payment';
  select coalesce(sum(amount),0) into v_refunded
  from public.business_document_transactions
  where document_id = new.document_id and transaction_type = 'refund';

  if new.transaction_type = 'payment' then
    if v_refunded > 0 then raise exception 'Further payments are blocked after a refund. Reconcile this invoice first.'; end if;
    if new.amount > v_document.grand_total - v_paid then raise exception 'Payment exceeds the outstanding invoice balance.'; end if;
  else
    if new.amount > v_paid - v_refunded then raise exception 'Refund exceeds verified payments received.'; end if;
  end if;

  new.recorded_by := auth.uid();
  return new;
end;
$$;

create trigger guard_business_document_transaction_trigger
before insert on public.business_document_transactions
for each row execute function public.guard_business_document_transaction();

create or replace function public.refresh_business_document_payment_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_paid numeric(14,2);
  v_refunded numeric(14,2);
  v_total numeric(14,2);
  v_status text;
begin
  select grand_total into v_total from public.business_documents where id = new.document_id;
  select
    coalesce(sum(amount) filter (where transaction_type = 'payment'),0),
    coalesce(sum(amount) filter (where transaction_type = 'refund'),0)
  into v_paid, v_refunded
  from public.business_document_transactions where document_id = new.document_id;

  if v_refunded > 0 and v_paid = v_refunded then v_status := 'refunded';
  elsif v_refunded > 0 then v_status := 'partially_refunded';
  elsif v_paid >= v_total then v_status := 'paid';
  elsif v_paid > 0 then v_status := 'partially_paid';
  else v_status := 'issued';
  end if;

  update public.business_documents set status = v_status, updated_at = now()
  where id = new.document_id;
  return new;
end;
$$;

create trigger refresh_business_document_payment_status_trigger
after insert on public.business_document_transactions
for each row execute function public.refresh_business_document_payment_status();

grant select, insert on public.business_document_transactions to authenticated;
