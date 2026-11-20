-- Verified order payment and refund transactions.
-- Each row represents funds confirmed by staff. Customer-submitted references
-- remain unverified checkout information and are not inserted into this ledger.

create table public.order_payment_transactions (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  transaction_type text not null check (transaction_type in ('payment', 'refund')),
  provider text not null check (length(trim(provider)) > 0),
  amount numeric(12,2) not null check (amount > 0),
  currency text not null default 'MWK' check (char_length(currency) = 3),
  provider_reference text,
  created_at timestamptz not null default now()
);

create index order_payment_transactions_order_idx
  on public.order_payment_transactions(order_id, created_at);

create unique index order_payment_transactions_reference_uidx
  on public.order_payment_transactions (lower(provider), provider_reference)
  where provider_reference is not null and length(trim(provider_reference)) > 0;

alter table public.order_payment_transactions enable row level security;

create policy "customer can read own verified payment transactions"
  on public.order_payment_transactions
  for select to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and o.customer_id = (select auth.uid())
    )
  );

create policy "orders.read can read verified payment transactions"
  on public.order_payment_transactions
  for select to authenticated
  using (public.has_permission((select auth.uid()), 'orders.read'));

revoke all on table public.order_payment_transactions from anon, authenticated;
grant select on table public.order_payment_transactions to authenticated;

create or replace function public.record_order_payment_transaction(
  p_order_id uuid,
  p_transaction_type text,
  p_provider text,
  p_amount numeric,
  p_currency text default 'MWK',
  p_provider_reference text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_order_total numeric(12,2);
  v_order_currency text;
  v_order_status public.order_status_enum;
  v_paid numeric(12,2);
  v_refunded numeric(12,2);
  v_net numeric(12,2);
  v_transaction_id uuid;
  v_type text := lower(trim(p_transaction_type));
  v_provider text := trim(p_provider);
  v_currency text := upper(trim(p_currency));
  v_reference text := nullif(trim(coalesce(p_provider_reference, '')), '');
begin
  if v_actor is null then
    raise exception 'Authentication required';
  end if;

  if not public.has_permission(v_actor, 'orders.write') then
    raise exception 'You do not have permission to record order payments';
  end if;

  if v_type not in ('payment', 'refund') then
    raise exception 'Transaction type must be payment or refund';
  end if;

  if v_provider = '' or char_length(v_currency) <> 3 then
    raise exception 'A provider and valid currency are required';
  end if;

  if p_amount is null or p_amount <= 0 or round(p_amount, 2) <> p_amount then
    raise exception 'Amount must be greater than zero and have no more than two decimal places';
  end if;

  select o.total, o.currency, o.order_status
    into v_order_total, v_order_currency, v_order_status
    from public.orders o
    where o.id = p_order_id
    for update;

  if not found then
    raise exception 'Order not found';
  end if;

  if v_type = 'payment' and v_order_status in ('cancelled', 'refunded') then
    raise exception 'A payment cannot be recorded against a cancelled or refunded order';
  end if;

  if upper(v_order_currency) <> v_currency then
    raise exception 'Transaction currency does not match the order currency';
  end if;

  select
    coalesce(sum(t.amount) filter (where t.transaction_type = 'payment'), 0),
    coalesce(sum(t.amount) filter (where t.transaction_type = 'refund'), 0)
    into v_paid, v_refunded
    from public.order_payment_transactions t
    where t.order_id = p_order_id;

  v_net := v_paid - v_refunded;

  if v_type = 'payment' and v_net + p_amount > v_order_total then
    raise exception 'Payment exceeds the outstanding order balance';
  end if;

  if v_type = 'refund' and p_amount > v_net then
    raise exception 'Refund exceeds the verified amount received';
  end if;

  insert into public.order_payment_transactions (
    order_id, transaction_type, provider, amount, currency, provider_reference
  ) values (
    p_order_id, v_type, v_provider, p_amount, v_currency, v_reference
  )
  returning id into v_transaction_id;

  if v_type = 'payment' then
    v_net := v_net + p_amount;
  else
    v_net := v_net - p_amount;
  end if;

  update public.orders
    set payment_status = case
      when v_net >= v_order_total then 'paid'::public.payment_status_enum
      when v_net > 0 then 'partial'::public.payment_status_enum
      when v_type = 'refund' then 'refunded'::public.payment_status_enum
      else 'unpaid'::public.payment_status_enum
    end
    where id = p_order_id;

  perform public.log_audit_event(
    case when v_type = 'payment' then 'order.payment_recorded' else 'order.refund_recorded' end,
    'order',
    p_order_id,
    jsonb_build_object(
      'transaction_id', v_transaction_id,
      'transaction_type', v_type,
      'provider', v_provider,
      'amount', p_amount,
      'currency', v_currency,
      'provider_reference', v_reference
    )
  );

  return v_transaction_id;
end;
$$;

revoke all on function public.record_order_payment_transaction(uuid, text, text, numeric, text, text)
  from public, anon, authenticated;
grant execute on function public.record_order_payment_transaction(uuid, text, text, numeric, text, text)
  to authenticated;

comment on table public.order_payment_transactions is
  'Append-only verified payments and refunds. Rows are created only through record_order_payment_transaction after staff verification.';
