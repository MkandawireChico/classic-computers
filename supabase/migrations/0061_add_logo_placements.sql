-- Add custom logo placement options while preserving existing enum values
-- and site_media rows.

alter type public.site_media_placement_enum add value if not exists 'logo';
alter type public.site_media_placement_enum add value if not exists 'footer_logo';