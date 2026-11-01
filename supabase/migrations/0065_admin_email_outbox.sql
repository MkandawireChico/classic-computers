-- Durable, idempotent internal email notifications for customer requests.
-- Outbox rows are created in the same transaction as the request insert;
-- SMTP delivery happens later in server-only application code.

alter table public.enquiries add column submission_key uuid;
alter table public.corporate_enquiries add column submission_key uuid;
alter table public.rental_bookings add column submission_key uuid;
alter table public.repair_tickets add column submission_key uuid;
alter table public.student_verifications add column submission_key uuid;

create unique index enquiries_submission_key_idx
  on public.enquiries (submission_key) where submission_key is not null;
create unique index corporate_enquiries_submission_key_idx
  on public.corporate_enquiries (submission_key) where submission_key is not null;
create unique index rental_bookings_submission_key_idx
  on public.rental_bookings (submission_key) where submission_key is not null;
create unique index repair_tickets_submission_key_idx
  on public.repair_tickets (submission_key) where submission_key is not null;
create unique index student_verifications_submission_key_idx
  on public.student_verifications (submission_key) where submission_key is not null;

create table public.admin_email_outbox (
  id uuid primary key default gen_random_uuid(),
  request_type text not null check (request_type in (
    'general_enquiry', 'corporate_enquiry', 'rental_booking',
    'repair_ticket', 'student_verification', 'order_placed'
  )),
  request_id uuid not null,
  submission_key uuid,
  recipient text not null default 'admin@classiccomputers.mw',
  payload jsonb not null,
  status text not null default 'pending' check (status in ('pending', 'sending', 'sent', 'failed')),
  attempt_count integer not null default 0 check (attempt_count >= 0),
  created_at timestamptz not null default now(),
  last_attempt_at timestamptz,
  sent_at timestamptz,
  last_error text,
  unique (request_type, request_id),
  unique (request_type, submission_key)
);

create index admin_email_outbox_status_created_idx
  on public.admin_email_outbox (status, created_at desc);

alter table public.admin_email_outbox enable row level security;
revoke all on table public.admin_email_outbox from public, anon, authenticated;
grant select, insert, update on table public.admin_email_outbox to service_role;

-- Browser roles must not insert guest repairs/rentals directly. These
-- server-only grants are used after request validation in the service layer.
grant select, insert on table public.repair_tickets, public.rental_bookings to service_role;

create or replace function public.enqueue_admin_email_outbox()
returns trigger
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  row_data jsonb := to_jsonb(new);
  request_type_value text := tg_argv[0];
  request_id_value uuid;
  submission_key_value uuid;
  customer_id_value uuid;
  customer_name_value text;
  customer_email_value text;
  customer_phone_value text;
  rental_name_value text;
  rental_variant_value text;
  notification_payload jsonb;
begin
  request_id_value := (row_data ->> 'id')::uuid;
  submission_key_value := nullif(row_data ->> 'submission_key', '')::uuid;
  customer_id_value := nullif(row_data ->> 'customer_id', '')::uuid;

  if customer_id_value is not null then
    select coalesce(p.full_name, u.raw_user_meta_data ->> 'full_name'), u.email, p.phone
      into customer_name_value, customer_email_value, customer_phone_value
      from auth.users u
      left join public.profiles p on p.id = u.id
      where u.id = customer_id_value;
  end if;

  case request_type_value
    when 'general_enquiry' then
      notification_payload := jsonb_build_object(
        'reference', left(request_id_value::text, 8), 'request_id', request_id_value,
        'name', row_data ->> 'name', 'email', row_data ->> 'email',
        'phone', row_data ->> 'phone', 'subject', row_data ->> 'topic',
        'message', row_data ->> 'message', 'submitted_at', row_data ->> 'created_at'
      );
    when 'corporate_enquiry' then
      notification_payload := jsonb_build_object(
        'reference', left(request_id_value::text, 8), 'request_id', request_id_value,
        'organisation_name', row_data ->> 'organisation_name',
        'contact_person', row_data ->> 'contact_person', 'email', row_data ->> 'email',
        'phone', row_data ->> 'phone', 'products_required', row_data ->> 'products_required',
        'quantity', row_data ->> 'quantity', 'budget', row_data ->> 'budget',
        'delivery_location', row_data ->> 'delivery_location',
        'additional_requirements', row_data ->> 'additional_requirements',
        'submitted_at', row_data ->> 'created_at'
      );
    when 'rental_booking' then
      select p.name, v.name
        into rental_name_value, rental_variant_value
        from public.rental_products rp
        join public.products p on p.id = rp.product_id
        left join public.product_variants v on v.id = rp.variant_id
        where rp.id = (row_data ->> 'rental_product_id')::uuid;
      notification_payload := jsonb_build_object(
        'reference', left(request_id_value::text, 8), 'request_id', request_id_value,
        'customer_name', coalesce(row_data ->> 'guest_name', customer_name_value),
        'email', coalesce(row_data ->> 'guest_email', customer_email_value),
        'phone', coalesce(row_data ->> 'guest_phone', customer_phone_value),
        'equipment', concat_ws(' ', rental_name_value, rental_variant_value),
        'quantity', row_data ->> 'quantity', 'start_date', row_data ->> 'start_date',
        'end_date', row_data ->> 'end_date', 'notes', row_data ->> 'notes',
        'submitted_at', row_data ->> 'created_at'
      );
    when 'repair_ticket' then
      notification_payload := jsonb_build_object(
        'reference', row_data ->> 'ticket_number', 'request_id', request_id_value,
        'customer_name', coalesce(row_data ->> 'guest_name', customer_name_value),
        'email', coalesce(row_data ->> 'guest_email', customer_email_value),
        'phone', coalesce(row_data ->> 'guest_phone', customer_phone_value),
        'device_type', row_data ->> 'device_type', 'brand', row_data ->> 'brand',
        'model', row_data ->> 'model', 'reported_fault', row_data ->> 'problem_description',
        'additional_information', row_data ->> 'accessories_received',
        'submitted_at', row_data ->> 'created_at'
      );
    when 'student_verification' then
      notification_payload := jsonb_build_object(
        'reference', left(request_id_value::text, 8), 'request_id', request_id_value,
        'student_name', row_data ->> 'full_name', 'student_email', row_data ->> 'email',
        'institution', row_data ->> 'institution', 'application_date', row_data ->> 'created_at'
      );
    when 'order_placed' then
      notification_payload := jsonb_build_object(
        'reference', row_data ->> 'order_number', 'request_id', request_id_value,
        'customer_name', coalesce(row_data ->> 'guest_name', customer_name_value),
        'email', coalesce(row_data ->> 'guest_email', customer_email_value),
        'phone', coalesce(row_data ->> 'guest_phone', customer_phone_value),
        'total', row_data ->> 'total', 'currency', row_data ->> 'currency',
        'payment_method', row_data ->> 'payment_method',
        'payment_status', row_data ->> 'payment_status',
        'fulfillment_type', row_data ->> 'fulfillment_type',
        'submitted_at', row_data ->> 'created_at'
      );
    else
      raise exception 'Unsupported admin email request type: %', request_type_value;
  end case;

  insert into public.admin_email_outbox (request_type, request_id, submission_key, payload)
  values (request_type_value, request_id_value, submission_key_value, notification_payload)
  on conflict do nothing;

  return new;
end;
$$;

create trigger enqueue_general_enquiry_email
  after insert on public.enquiries
  for each row execute function public.enqueue_admin_email_outbox('general_enquiry');
create trigger enqueue_corporate_enquiry_email
  after insert on public.corporate_enquiries
  for each row execute function public.enqueue_admin_email_outbox('corporate_enquiry');
create trigger enqueue_rental_booking_email
  after insert on public.rental_bookings
  for each row execute function public.enqueue_admin_email_outbox('rental_booking');
create trigger enqueue_repair_ticket_email
  after insert on public.repair_tickets
  for each row execute function public.enqueue_admin_email_outbox('repair_ticket');
create trigger enqueue_student_verification_email
  after insert on public.student_verifications
  for each row execute function public.enqueue_admin_email_outbox('student_verification');
create trigger enqueue_order_placed_email
  after insert on public.orders
  for each row execute function public.enqueue_admin_email_outbox('order_placed');
