-- Fix the auth.users insert triggers that were blocking new customer signups.
-- This migration is timestamp-prefixed so Supabase CLI will apply it.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  customer_role_id uuid;
begin
  if new.id is null then
    return new;
  end if;

  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do update set full_name = excluded.full_name;

  insert into public.customers (id)
  values (new.id)
  on conflict (id) do nothing;

  select id into customer_role_id from public.roles where name = 'customer';
  if customer_role_id is not null then
    insert into public.user_roles (user_id, role_id)
    values (new.id, customer_role_id)
    on conflict (user_id, role_id) do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

insert into public.customers (id)
select p.id from public.profiles p
where not exists (select 1 from public.customers c where c.id = p.id)
on conflict (id) do nothing;

create or replace function public.handle_referral_signup()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_referral_code text;
  v_referrer_id uuid;
begin
  if new.id is null or new.raw_user_meta_data is null then
    return new;
  end if;

  v_referral_code := new.raw_user_meta_data ->> 'referral_code';
  if v_referral_code is null or trim(v_referral_code) = '' then
    return new;
  end if;

  select id into v_referrer_id
  from public.customers
  where referral_code = upper(trim(v_referral_code));

  if v_referrer_id is not null and v_referrer_id <> new.id then
    insert into public.referrals (referrer_customer_id, referred_customer_id, status)
    values (v_referrer_id, new.id, 'pending')
    on conflict (referrer_customer_id, referred_customer_id) do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists z_handle_referral_signup on auth.users;
create trigger z_handle_referral_signup
  after insert on auth.users
  for each row execute function public.handle_referral_signup();
