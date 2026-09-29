-- 0026_site_settings.sql
-- Single-row-per-key configuration store. is_public controls whether the
-- anon/storefront client can read a given key; everything else requires
-- settings.read.

create table site_settings (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  value jsonb not null,
  is_public boolean not null default false,
  updated_at timestamptz not null default now()
);

create trigger set_site_settings_updated_at before update on site_settings
  for each row execute function set_updated_at();

create or replace function public.audit_site_settings_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform log_audit_event('setting.updated', 'site_setting', new.id, jsonb_build_object('key', new.key));
  return new;
end;
$$;

create trigger audit_site_settings_trigger after update on site_settings
  for each row execute function audit_site_settings_change();

alter table site_settings enable row level security;

create policy "public settings readable by everyone" on site_settings
  for select to anon, authenticated using (is_public);
create policy "settings.read can read all settings" on site_settings
  for select to authenticated using (has_permission(auth.uid(), 'settings.read'));
create policy "settings.write manages settings" on site_settings
  for all to authenticated
  using (has_permission(auth.uid(), 'settings.write'))
  with check (has_permission(auth.uid(), 'settings.write'));

-- ------------------------------------------------------------------
-- Seed keys. This is real configuration structure, not fake data — most
-- values are left empty/false until you supply verified content.
-- Per your instruction #10, site_statistics is explicitly disabled and
-- the "500+ Products / 5+ Years / 1K+ Happy Clients" figures from the old
-- site are NOT carried over.
-- ------------------------------------------------------------------
insert into site_settings (key, value, is_public) values
  ('business_info', '{
     "name": "Classic Computers LLC",
     "address": "Shree Satyanarayan Building, Shop No. 4, Glyn Jones Road, Opposite First Capital Bank, Blantyre Town, Malawi",
     "phone": "+265 995 837 735",
     "phone_alt": "+265 880 287 483",
     "whatsapp": "+265 995 837 735",
     "email": "info@classiccomputers.mw"
   }'::jsonb, true),
  ('hours', '{"enabled": true, "schedule": "Mon-Sat 8:00-18:00, closed Sunday"}'::jsonb, true),
  ('social_links', '{}'::jsonb, true),
  ('payment_methods', '{"pay_at_shop": true, "bank_transfer": true, "mobile_money": true, "cash_on_delivery": true}'::jsonb, true),
  ('rental_settings', '{}'::jsonb, false),
  ('repair_settings', '{}'::jsonb, false),
  ('student_discount_settings', '{"require_verification": true}'::jsonb, false),
  ('referral_settings', '{}'::jsonb, false),
  ('low_stock_threshold_default', '3'::jsonb, false),
  ('site_statistics', '{"enabled": false, "products": null, "years": null, "happy_clients": null}'::jsonb, true);
