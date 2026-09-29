-- 0021_referrals.sql

create table referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_customer_id uuid not null references customers(id) on delete cascade,
  referred_customer_id uuid references customers(id) on delete set null,
  referred_order_id uuid references orders(id) on delete set null,
  status referral_status_enum not null default 'pending',
  reward_amount numeric(12,2),
  reward_status reward_status_enum not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (referrer_customer_id <> referred_customer_id),
  unique (referrer_customer_id, referred_customer_id)
);

create trigger set_referrals_updated_at before update on referrals
  for each row execute function set_updated_at();

alter table referrals enable row level security;

create policy "referrer can read own referrals" on referrals
  for select to authenticated using (referrer_customer_id = auth.uid());
create policy "admin can manage referrals" on referrals
  for all to authenticated
  using (has_permission(auth.uid(), 'settings.write'))
  with check (has_permission(auth.uid(), 'settings.write'));
