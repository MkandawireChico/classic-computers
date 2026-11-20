-- Ensure quoted variants belong to the selected parent product.
create or replace function public.guard_business_document_item_write()
returns trigger
language plpgsql
set search_path = public
as $$
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
  if new.variant_id is not null and not exists (
    select 1 from public.product_variants
    where id = new.variant_id and product_id = new.product_id
  ) then
    raise exception 'The selected variant does not belong to the selected product.';
  end if;
  new.line_total := round(new.quantity * new.unit_price, 2);
  return new;
end;
$$;
