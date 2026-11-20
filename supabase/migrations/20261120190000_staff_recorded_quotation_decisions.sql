-- Allow staff to record customer decisions received by phone or in person.
alter table public.business_document_decisions
  alter column customer_id drop not null,
  add column if not exists decision_channel text not null default 'customer_portal'
    check (decision_channel in ('customer_portal','staff_recorded')),
  add column if not exists recorded_by uuid references auth.users(id) on delete set null;

drop policy if exists "Customers decide own issued quotations" on public.business_document_decisions;
create policy "Customers decide own issued quotations"
on public.business_document_decisions
for insert to authenticated
with check (
  decision_channel = 'customer_portal'
  and customer_id = auth.uid()
  and exists (
    select 1 from public.business_documents d
    where d.id = document_id
      and d.customer_id = auth.uid()
      and d.document_type = 'quotation'
      and d.status = 'issued'
      and (d.valid_until is null or d.valid_until >= current_date)
  )
);

create policy "Staff record customer quotation decisions"
on public.business_document_decisions
for insert to authenticated
with check (
  decision_channel = 'staff_recorded'
  and recorded_by = auth.uid()
  and exists (
    select 1 from public.business_documents d
    where d.id = document_id
      and d.document_type = 'quotation'
      and d.status = 'issued'
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
