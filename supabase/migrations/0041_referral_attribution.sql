-- 0041_referral_attribution.sql
--
-- referrals (0021) only has an admin-write RLS policy — an ordinary
-- customer has no INSERT path onto it at all, which is correct (nobody
-- should be able to fabricate their own referral rows). Attribution
-- therefore has to happen server-side, automatically, at signup — this
-- adds a second AFTER INSERT trigger on auth.users (alongside
-- on_auth_user_created from 0004; Postgres allows multiple triggers on
-- the same table/event, they just both fire) that reads a referral code
-- from the new user's signup metadata and creates the referral row if
-- one applies.
--
-- Depends on 0040 (the customers row now exists earlier in the same
-- trigger sequence, since trigger firing order for same-table/same-event
-- triggers is alphabetical by trigger name, and 'z_handle_referral_signup'
-- deliberately sorts after 'on_auth_user_created').

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
  v_referral_code := new.raw_user_meta_data ->> 'referral_code';
  if v_referral_code is null or trim(v_referral_code) = '' then
    return new;
  end if;

  select id into v_referrer_id from customers where referral_code = upper(trim(v_referral_code));

  -- Silently skip (not an error) if the code doesn't match anything —
  -- signup must never fail because of a bad referral code. The CHECK
  -- constraint on referrals (referrer <> referred) and the unique pair
  -- constraint still guard against self-referral/duplicates even though
  -- neither can realistically trigger here (new.id is always fresh).
  if v_referrer_id is not null and v_referrer_id <> new.id then
    insert into referrals (referrer_customer_id, referred_customer_id, status)
    values (v_referrer_id, new.id, 'pending')
    on conflict (referrer_customer_id, referred_customer_id) do nothing;
  end if;

  return new;
end;
$$;

create trigger z_handle_referral_signup
  after insert on auth.users
  for each row execute function handle_referral_signup();

--mment on trigger z_handle_referral_signup on auth.users is
 --Prefixed z_ so it sorts and fires after on_auth_user_created (0004), which must create the customers row first.';
