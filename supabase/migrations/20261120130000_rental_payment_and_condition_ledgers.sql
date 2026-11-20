-- Rental payment ledger and equipment condition records.
-- Staff record verified funds only. Condition reports are append-only records
-- captured before handover, return, damage or loss status transitions.

create table public.rental_payment_transactions (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.rental_bookings(id) on delete restrict,
  transaction_type text not null check (transaction_type in ('payment', 'refund')),
  provider text not null check (length(trim(provider)) between 1 and 80),
  amount numeric(12,2) not null check (amount > 0 and amount = round(amount, 2)),
  currency text not null default 'MWK' check (currency = 'MWK'),
  provider_reference text check (provider_reference is null or char_length(provider_reference) <= 120),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index rental_payment_transactions_booking_idx
  on public.rental_payment_transactions(booking_id, created_at);
create unique index rental_payment_transactions_reference_uidx
  on public.rental_payment_transactions(lower(provider), provider_reference)
  where provider_reference is not null and length(trim(provider_reference)) > 0;

alter table public.rental_payment_transactions enable row level security;
create policy "customer can read own rental payment transactions"
  on public.rental_payment_transactions for select to authenticated
  using (exists (select 1 from public.rental_bookings b where b.id = booking_id and b.customer_id = (select auth.uid())));
create policy "rentals.read can read rental payment transactions"
  on public.rental_payment_transactions for select to authenticated
  using (public.has_permission((select auth.uid()), 'rentals.read'));
create policy "rentals.write can record rental payment transactions"
  on public.rental_payment_transactions for insert to authenticated
  with check (public.has_permission((select auth.uid()), 'rentals.write'));
revoke all on table public.rental_payment_transactions from anon, authenticated;
grant select, insert on table public.rental_payment_transactions to authenticated;

create or replace function public.validate_rental_payment_transaction()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare
  v_charge numeric(12,2);
  v_status public.rental_status_enum;
  v_paid numeric(12,2);
  v_refunded numeric(12,2);
begin
  if auth.uid() is null or not public.has_permission(auth.uid(), 'rentals.write') then
    raise exception 'You do not have permission to record rental payments';
  end if;
  new.provider := trim(new.provider);
  new.provider_reference := nullif(trim(coalesce(new.provider_reference, '')), '');
  select b.total_charge, b.status into v_charge, v_status
    from public.rental_bookings b where b.id = new.booking_id for update;
  if not found then raise exception 'Rental booking not found'; end if;
  if v_charge is null then raise exception 'Set the agreed rental charge before recording payments'; end if;
  if new.transaction_type = 'payment' and v_status = 'cancelled' then
    raise exception 'Payments cannot be recorded against cancelled rentals';
  end if;
  select
    coalesce(sum(t.amount) filter (where t.transaction_type = 'payment'), 0),
    coalesce(sum(t.amount) filter (where t.transaction_type = 'refund'), 0)
    into v_paid, v_refunded
    from public.rental_payment_transactions t where t.booking_id = new.booking_id;
  if new.transaction_type = 'payment' then
    if v_refunded > 0 then raise exception 'Additional payments are blocked after a refund'; end if;
    if v_paid + new.amount > v_charge then raise exception 'Payment exceeds the outstanding rental balance'; end if;
  elsif new.amount > v_paid - v_refunded then
    raise exception 'Refund exceeds verified rental payments';
  end if;
  new.created_by := auth.uid();
  return new;
end;
$$;

create or replace function public.audit_rental_payment_transaction()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  perform public.log_audit_event(
    case when new.transaction_type = 'payment' then 'rental.payment_recorded' else 'rental.refund_recorded' end,
    'rental_booking', new.booking_id,
    jsonb_build_object('transaction_id', new.id, 'provider', new.provider, 'amount', new.amount,
      'currency', new.currency, 'provider_reference', new.provider_reference)
  );
  return new;
end;
$$;

create trigger validate_rental_payment_transaction_trigger
  before insert on public.rental_payment_transactions
  for each row execute function public.validate_rental_payment_transaction();
create trigger audit_rental_payment_transaction_trigger
  after insert on public.rental_payment_transactions
  for each row execute function public.audit_rental_payment_transaction();
revoke all on function public.validate_rental_payment_transaction() from public, anon, authenticated;
revoke all on function public.audit_rental_payment_transaction() from public, anon, authenticated;

create table public.rental_condition_reports (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.rental_bookings(id) on delete restrict,
  event_type text not null check (event_type in ('checkout', 'return', 'damage', 'loss')),
  condition text not null check (condition in ('excellent', 'good', 'fair', 'damaged', 'missing')),
  notes text not null check (length(trim(notes)) between 3 and 1500),
  recorded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index rental_condition_reports_booking_idx
  on public.rental_condition_reports(booking_id, created_at);
create unique index rental_condition_reports_event_uidx
  on public.rental_condition_reports(booking_id, event_type);
alter table public.rental_condition_reports enable row level security;
create policy "customer can read own rental condition reports"
  on public.rental_condition_reports for select to authenticated
  using (exists (select 1 from public.rental_bookings b where b.id = booking_id and b.customer_id = (select auth.uid())));
create policy "rentals.read can read rental condition reports"
  on public.rental_condition_reports for select to authenticated
  using (public.has_permission((select auth.uid()), 'rentals.read'));
create policy "rentals.write can record rental condition reports"
  on public.rental_condition_reports for insert to authenticated
  with check (public.has_permission((select auth.uid()), 'rentals.write'));
revoke all on table public.rental_condition_reports from anon, authenticated;
grant select, insert on table public.rental_condition_reports to authenticated;

create or replace function public.validate_rental_condition_report()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  if auth.uid() is null or not public.has_permission(auth.uid(), 'rentals.write') then
    raise exception 'You do not have permission to record equipment condition';
  end if;
  if not exists (select 1 from public.rental_bookings b where b.id = new.booking_id) then
    raise exception 'Rental booking not found';
  end if;
  new.notes := trim(new.notes);
  new.recorded_by := auth.uid();
  return new;
end;
$$;
create trigger validate_rental_condition_report_trigger
  before insert on public.rental_condition_reports
  for each row execute function public.validate_rental_condition_report();
revoke all on function public.validate_rental_condition_report() from public, anon, authenticated;

comment on table public.rental_payment_transactions is
  'Append-only ledger of staff-verified rental payments and refunds. Amounts are validated against the agreed charge under a booking row lock.';
comment on table public.rental_condition_reports is
  'Append-only staff condition records captured at rental checkout, return, damage or loss.';
