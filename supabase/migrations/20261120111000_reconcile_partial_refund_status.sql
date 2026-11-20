-- Keep partial refunds distinct from balances still owed by the customer.
create or replace function public.validate_order_payment_transaction()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_order_total numeric(12,2);
  v_order_currency text;
  v_order_status public.order_status_enum;
  v_order_payment_status public.payment_status_enum;
  v_paid numeric(12,2);
  v_refunded numeric(12,2);
  v_net numeric(12,2);
begin
  if v_actor is null or not public.has_permission(v_actor, 'orders.write') then
    raise exception 'You do not have permission to record order payments';
  end if;

  if new.transaction_type not in ('payment', 'refund') then
    raise exception 'Transaction type must be payment or refund';
  end if;

  if new.provider is null or length(trim(new.provider)) = 0 then
    raise exception 'A payment provider is required';
  end if;

  if new.amount is null or new.amount <= 0 or round(new.amount, 2) <> new.amount then
    raise exception 'Amount must be greater than zero and have no more than two decimal places';
  end if;

  new.provider := trim(new.provider);
  new.currency := upper(trim(new.currency));
  new.provider_reference := nullif(trim(coalesce(new.provider_reference, '')), '');

  select o.total, o.currency, o.order_status, o.payment_status
    into v_order_total, v_order_currency, v_order_status, v_order_payment_status
    from public.orders o
    where o.id = new.order_id
    for update;

  if not found then
    raise exception 'Order not found';
  end if;

  if new.transaction_type = 'payment' and v_order_status = 'cancelled' then
    raise exception 'A payment cannot be recorded against a cancelled order';
  end if;

  if new.transaction_type = 'payment' and v_order_status = 'refunded' then
    if v_order_payment_status not in ('paid', 'partial', 'refunded')
      or exists (
        select 1 from public.order_payment_transactions t
        where t.order_id = new.order_id
      ) then
      raise exception 'Only a historical verified payment can be reconciled on a refunded order';
    end if;
  end if;

  if upper(v_order_currency) <> new.currency then
    raise exception 'Transaction currency does not match the order currency';
  end if;

  select
    coalesce(sum(t.amount) filter (where t.transaction_type = 'payment'), 0),
    coalesce(sum(t.amount) filter (where t.transaction_type = 'refund'), 0)
    into v_paid, v_refunded
    from public.order_payment_transactions t
    where t.order_id = new.order_id;

  v_net := v_paid - v_refunded;

  if new.transaction_type = 'payment' and v_refunded > 0 then
    raise exception 'Additional payments are not accepted after a refund has been recorded';
  end if;

  if new.transaction_type = 'payment' and v_net + new.amount > v_order_total then
    raise exception 'Payment exceeds the outstanding order balance';
  end if;

  if new.transaction_type = 'refund' and new.amount > v_net then
    raise exception 'Refund exceeds the verified amount received';
  end if;

  return new;
end;
$$;

create or replace function public.apply_order_payment_transaction()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order_total numeric(12,2);
  v_paid numeric(12,2);
  v_refunded numeric(12,2);
  v_net numeric(12,2);
begin
  select o.total into v_order_total
    from public.orders o
    where o.id = new.order_id;

  select
    coalesce(sum(t.amount) filter (where t.transaction_type = 'payment'), 0),
    coalesce(sum(t.amount) filter (where t.transaction_type = 'refund'), 0)
    into v_paid, v_refunded
    from public.order_payment_transactions t
    where t.order_id = new.order_id;

  v_net := v_paid - v_refunded;

  update public.orders
    set payment_status = case
      when v_refunded > 0 and v_net > 0 then 'partially_refunded'::public.payment_status_enum
      when v_net >= v_order_total then 'paid'::public.payment_status_enum
      when v_net > 0 then 'partial'::public.payment_status_enum
      when v_refunded > 0 then 'refunded'::public.payment_status_enum
      else 'unpaid'::public.payment_status_enum
    end
    where id = new.order_id;

  perform public.log_audit_event(
    case when new.transaction_type = 'payment' then 'order.payment_recorded' else 'order.refund_recorded' end,
    'order',
    new.order_id,
    jsonb_build_object(
      'transaction_id', new.id,
      'transaction_type', new.transaction_type,
      'provider', new.provider,
      'amount', new.amount,
      'currency', new.currency,
      'provider_reference', new.provider_reference
    )
  );

  return new;
end;
$$;
