-- Payment status is a projection of the verified transaction ledger.
-- Prevent staff or application code from setting a contradictory status directly.

create or replace function public.enforce_order_payment_status_from_ledger()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_paid numeric(12,2);
  v_refunded numeric(12,2);
  v_net numeric(12,2);
  v_expected public.payment_status_enum;
  v_order_total numeric(12,2);
begin
  if tg_op = 'INSERT' then
    if new.payment_status <> 'unpaid'::public.payment_status_enum then
      raise exception 'New orders must begin unpaid. Record a verified transaction to change payment status';
    end if;
    return new;
  end if;

  if old.payment_status is not distinct from new.payment_status then
    return new;
  end if;

  select o.total into v_order_total
    from public.orders o
    where o.id = new.id;

  select
    coalesce(sum(t.amount) filter (where t.transaction_type = 'payment'), 0),
    coalesce(sum(t.amount) filter (where t.transaction_type = 'refund'), 0)
    into v_paid, v_refunded
    from public.order_payment_transactions t
    where t.order_id = new.id;

  v_net := v_paid - v_refunded;

  v_expected := case
    when v_refunded > 0 and v_net > 0 then 'partially_refunded'::public.payment_status_enum
    when v_net >= v_order_total then 'paid'::public.payment_status_enum
    when v_net > 0 then 'partial'::public.payment_status_enum
    when v_refunded > 0 then 'refunded'::public.payment_status_enum
    else 'unpaid'::public.payment_status_enum
  end;

  if new.payment_status is distinct from v_expected then
    raise exception 'Payment status is controlled by verified payment transactions';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_order_payment_status_from_ledger_trigger on public.orders;
create trigger enforce_order_payment_status_from_ledger_trigger
  before insert or update of payment_status on public.orders
  for each row execute function public.enforce_order_payment_status_from_ledger();

revoke all on function public.enforce_order_payment_status_from_ledger() from public, anon, authenticated;
revoke update (payment_status) on table public.orders from authenticated;

comment on function public.enforce_order_payment_status_from_ledger() is
  'Rejects direct payment-status changes unless the requested status matches the verified payment transaction ledger.';
