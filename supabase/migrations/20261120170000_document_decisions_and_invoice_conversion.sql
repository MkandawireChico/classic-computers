-- Customer decisions and invoice conversion for issued quotations.
alter table public.business_documents
  add column if not exists origin_document_id uuid references public.business_documents(id) on delete restrict;

create unique index if not exists business_documents_one_invoice_per_origin
  on public.business_documents(origin_document_id)
  where document_type = 'invoice' and origin_document_id is not null;

create table if not exists public.business_document_decisions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.business_documents(id) on delete restrict,
  customer_id uuid not null references public.customers(id) on delete restrict,
  decision text not null check (decision in ('accepted','rejected')),
  comment text,
  created_at timestamptz not null default now(),
  unique (document_id)
);

alter table public.business_document_decisions enable row level security;

drop policy if exists "Customers decide own issued quotations" on public.business_document_decisions;
create policy "Customers decide own issued quotations"
on public.business_document_decisions
for insert to authenticated
with check (
  customer_id = auth.uid()
  and exists (
    select 1 from public.business_documents d
    where d.id = document_id
      and d.customer_id = auth.uid()
      and d.document_type = 'quotation'
      and d.status = 'issued'
      and (d.valid_until is null or d.valid_until >= current_date)
  )
);

drop policy if exists "Customers and staff read document decisions" on public.business_document_decisions;
create policy "Customers and staff read document decisions"
on public.business_document_decisions
for select to authenticated
using (
  customer_id = auth.uid()
  or exists (
    select 1 from public.business_documents d
    where d.id = document_id and (
      (d.source_type = 'repair' and public.has_permission(auth.uid(), 'repairs.read'))
      or (d.source_type = 'order' and public.has_permission(auth.uid(), 'orders.read'))
      or (d.source_type = 'rental' and public.has_permission(auth.uid(), 'rentals.read'))
      or (d.source_type = 'manual' and (
        public.has_permission(auth.uid(), 'repairs.read')
        or public.has_permission(auth.uid(), 'orders.read')
        or public.has_permission(auth.uid(), 'rentals.read')
      ))
    )
  )
);

grant select, insert on public.business_document_decisions to authenticated;

create or replace function public.apply_business_document_decision()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.business_documents
  set status = new.decision,
      accepted_at = case when new.decision = 'accepted' then new.created_at else null end,
      rejected_at = case when new.decision = 'rejected' then new.created_at else null end,
      updated_at = now()
  where id = new.document_id
    and document_type = 'quotation'
    and status = 'issued';
  if not found then
    raise exception 'This quotation is no longer awaiting a decision.';
  end if;
  if new.decision = 'accepted' then
    update public.repair_tickets
    set quote_approved_at = new.created_at
    where id = (
      select source_id from public.business_documents
      where id = new.document_id and source_type = 'repair'
    );
  end if;
  return new;
end;
$$;

drop trigger if exists apply_business_document_decision_trigger on public.business_document_decisions;
create trigger apply_business_document_decision_trigger
after insert on public.business_document_decisions
for each row execute function public.apply_business_document_decision();
