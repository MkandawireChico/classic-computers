update public.site_settings
set value = jsonb_set(value, '{phone_alt}', to_jsonb('+265 884 482 088'::text), true)
where key = 'business_info'
  and value ? 'phone_alt'
  and value ->> 'phone_alt' is distinct from '+265 884 482 088';
