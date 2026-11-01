alter table public.admin_email_outbox
  drop constraint if exists admin_email_outbox_request_type_check;

alter table public.admin_email_outbox
  add constraint admin_email_outbox_request_type_check
  check (request_type in (
    'general_enquiry',
    'corporate_enquiry',
    'rental_booking',
    'repair_ticket',
    'student_verification',
    'order_placed',
    'review_submitted'
  ));

create or replace function public.enqueue_admin_review_email()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.admin_email_outbox (
    request_type,
    request_id,
    payload
  )
  values (
    'review_submitted',
    new.id,
    jsonb_build_object(
      'reference', left(new.id::text, 8),
      'review_type', new.review_type,
      'rating', new.rating,
      'title', new.title,
      'comment', new.comment,
      'verified_purchase', new.verified_purchase,
      'submitted_at', new.created_at
    )
  )
  on conflict (request_type, request_id) do nothing;

  return new;
end;
$$;

create trigger enqueue_admin_review_email
  after insert on public.reviews
  for each row execute function public.enqueue_admin_review_email();
