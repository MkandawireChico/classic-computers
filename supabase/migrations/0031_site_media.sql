-- 0031_site_media.sql
-- Non-product website imagery (homepage hero, promotional banners, store
-- photographs, service imagery). Deliberately separate from product_images
-- (0012) — product photography and site/marketing photography have
-- different lifecycles and are managed from different admin screens.
--
-- Files live in the new `site-media` Storage bucket (public read, since
-- this is all publicly-displayed marketing imagery); metadata lives here.

create type site_media_placement_enum as enum (
  'homepage_hero',
  'homepage_banner',
  'store_photo',
  'rental_promo',
  'corporate_promo',
  'other'
);

create table site_media (
  id uuid primary key default gen_random_uuid(),
  placement site_media_placement_enum not null,
  storage_path text not null,
  alt_text text not null,
  title text,
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index site_media_placement_idx on site_media(placement, is_active, display_order);

create trigger set_site_media_updated_at before update on site_media
  for each row execute function set_updated_at();

alter table site_media enable row level security;

-- Public/anon can read only active media — draft/disabled homepage imagery
-- an admin is still preparing should never be visible on the live site.
create policy "active site media readable by everyone" on site_media
  for select to anon, authenticated using (is_active);
create policy "settings.write can read all site media" on site_media
  for select to authenticated using (has_permission(auth.uid(), 'settings.write'));
create policy "settings.write manages site media" on site_media
  for insert to authenticated with check (has_permission(auth.uid(), 'settings.write'));
create policy "settings.write updates site media" on site_media
  for update to authenticated
  using (has_permission(auth.uid(), 'settings.write'))
  with check (has_permission(auth.uid(), 'settings.write'));
create policy "settings.write deletes site media" on site_media
  for delete to authenticated using (has_permission(auth.uid(), 'settings.write'));

-- Storage bucket: public read (marketing imagery is meant to be seen),
-- writes gated on settings.write (the same permission that governs the
-- site_media table itself, so DB row and Storage object stay under one
-- consistent permission).
insert into storage.buckets (id, name, public)
values ('site-media', 'site-media', true)
on conflict (id) do nothing;

create policy "site-media public read" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'site-media');

create policy "site-media write requires settings.write" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'site-media' and has_permission(auth.uid(), 'settings.write'));

create policy "site-media update requires settings.write" on storage.objects
  for update to authenticated
  using (bucket_id = 'site-media' and has_permission(auth.uid(), 'settings.write'))
  with check (bucket_id = 'site-media' and has_permission(auth.uid(), 'settings.write'));

create policy "site-media delete requires settings.write" on storage.objects
  for delete to authenticated
  using (bucket_id = 'site-media' and has_permission(auth.uid(), 'settings.write'));

-- No seed row for homepage_hero: per your instruction, the real shop
-- photograph was not accessible in this environment (nothing was found in
-- the upload directory this phase). The homepage renders a clearly-labeled
-- placeholder until a real row with placement='homepage_hero' is added —
-- see PHASE_3_REPORT.md.
