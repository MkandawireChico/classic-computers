-- Record every payment-status transition separately from fulfilment history.
-- This is an audit trail for status changes, not a transaction ledger: it does
-- not claim to store partial amounts, provider confirmations or refund receipts.

create table public.order_payment_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  from_status public.payment_status_enum,
  to_status public.payment_status_enum not null,
  changed_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index order_payment_history_order_idx
  on public.order_payment_history(order_id, created_at);

alter table public.order_payment_history enable row level security;

create policy "customer can read own order payment history"
  on public.order_payment_history
  for select to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and o.customer_id = auth.uid()
    )
  );

create policy "orders.read can read all order payment history"
  on public.order_payment_history
  for select to authenticated
  using (public.has_permission(auth.uid(), 'orders.read'));

grant select on table public.order_payment_history to authenticated;

create or replace function public.audit_order_payment_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.payment_status is distinct from new.payment_status then
    insert into public.order_payment_history (
      order_id, from_status, to_status, changed_by
    ) values (
      new.id, old.payment_status, new.payment_status, auth.uid()
    );

    perform public.log_audit_event(
      'order.payment_status_changed',
      'order',
      new.id,
      jsonb_build_object(
        'order_number', new.order_number,
        'from', old.payment_status,
        'to', new.payment_status,
        'payment_method', new.payment_method,
        'order_total', new.total
      )
    );
  end if;
  return new;
end;
$$;

drop trigger if exists audit_order_payment_status_trigger on public.orders;
create trigger audit_order_payment_status_trigger
  after update of payment_status on public.orders
  for each row
  execute function public.audit_order_payment_status_change();

comment on table public.order_payment_history is
  'Append-only history of order payment-status changes. Does not represent individual payment transactions or partial amounts.';
