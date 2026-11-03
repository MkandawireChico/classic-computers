alter table public.admin_email_outbox
  alter column recipient set default 'sales@classiccomputers.mw';

update public.admin_email_outbox
set recipient = 'sales@classiccomputers.mw'
where status in ('pending', 'failed')
  and recipient is distinct from 'sales@classiccomputers.mw';
