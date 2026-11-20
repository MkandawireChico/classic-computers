-- Verified order payment and refund transactions.
-- Each row represents funds confirmed by staff. Customer-submitted references
-- remain unverified checkout information and are not inserted into this ledger.

create table public.order_payment_transactions (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  transaction_type text not null check (transaction_type in ('payment', 'refund')),
  provider text not null check (length(trim(provider)) between 1 and 80),
  amount numeric not null check (
    amount > 0
    and amount = round(amount, 2)
    and amount <= 9999999999.99
  ),
  currency text not null default 'MWK' check (currency ~ '^[A-Z]{3}$'),
  provider_reference text check (
    provider_reference is null or char_length(provider_reference) <= 120
  ),
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

create policy "orders.write can record verified payment transactions"
  on public.order_payment_transactions
  for insert to authenticated
  with check (public.has_permission((select auth.uid()), 'orders.write'));

revoke all on table public.order_payment_transactions from anon, authenticated;
grant select, insert on table public.order_payment_transactions to authenticated;

-- This trigger validates each transaction while holding the order row lock.
-- The lock prevents concurrent staff entries from overpaying or over-refunding.
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

  select o.total, o.currency, o.order_status
    into v_order_total, v_order_currency, v_order_status
    from public.orders o
    where o.id = new.order_id
    for update;

  if not found then
    raise exception 'Order not found';
  end if;

  if new.transaction_type = 'payment' and v_order_status in ('cancelled', 'refunded') then
    raise exception 'A payment cannot be recorded against a cancelled or refunded order';
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

create trigger validate_order_payment_transaction_trigger
  before insert on public.order_payment_transactions
  for each row execute function public.validate_order_payment_transaction();

create trigger apply_order_payment_transaction_trigger
  after insert on public.order_payment_transactions
  for each row execute function public.apply_order_payment_transaction();

-- Trigger functions are not application RPC endpoints.
revoke all on function public.validate_order_payment_transaction() from public, anon, authenticated;
revoke all on function public.apply_order_payment_transaction() from public, anon, authenticated;

comment on table public.order_payment_transactions is
  'Append-only verified payments and refunds. Inserts require orders.write and are validated and reconciled by database triggers.';
),
  provider_reference text check (provider_reference is null or char_length(provider_reference) <= 120),
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

create policy "orders.write can record verified payment transactions"
  on public.order_payment_transactions
  for insert to authenticated
  with check (public.has_permission((select auth.uid()), 'orders.write'));

revoke all on table public.order_payment_transactions from anon, authenticated;
grant select, insert on table public.order_payment_transactions to authenticated;

-- This trigger validates each transaction while holding the order row lock.
-- The lock prevents concurrent staff entries from overpaying or over-refunding.
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

  select o.total, o.currency, o.order_status
    into v_order_total, v_order_currency, v_order_status
    from public.orders o
    where o.id = new.order_id
    for update;

  if not found then
    raise exception 'Order not found';
  end if;

  if new.transaction_type = 'payment' and v_order_status in ('cancelled', 'refunded') then
    raise exception 'A payment cannot be recorded against a cancelled or refunded order';
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

create trigger validate_order_payment_transaction_trigger
  before insert on public.order_payment_transactions
  for each row execute function public.validate_order_payment_transaction();

create trigger apply_order_payment_transaction_trigger
  after insert on public.order_payment_transactions
  for each row execute function public.apply_order_payment_transaction();

-- Trigger functions are not application RPC endpoints.
revoke all on function public.validate_order_payment_transaction() from public, anon, authenticated;
revoke all on function public.apply_order_payment_transaction() from public, anon, authenticated;

comment on table public.order_payment_transactions is
  'Append-only verified payments and refunds. Inserts require orders.write and are validated and reconciled by database triggers.';
