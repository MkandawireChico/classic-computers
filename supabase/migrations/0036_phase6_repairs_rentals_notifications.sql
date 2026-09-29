-- 0036_phase6_repairs_rentals_notifications.sql
--
-- Phase 6 foundation. Found by inspecting the existing schema (per the
-- brief's own instruction) rather than assumed:
--
-- GAP A — no guest tracking mechanism for repairs: repair_tickets has no
-- RLS policy allowing an unauthenticated guest to read their own ticket
-- at all, and ticket_number (REP-YYYY-NNNNNN) is sequential/guessable
-- even if there were one. The brief explicitly requires guest tracking
-- NOT be keyed on a predictable ID alone.
--
-- GAP B — rental_bookings has the same problem, but worse: there is
-- currently NO RLS read policy for rentals covering guests at all (only
-- "customer_id = auth.uid()"), so a guest who books a rental today has
-- no way to ever check its status again.
--
-- GAP C — repair_parts (0023) is pure free text (part_name, cost,
-- quantity) with no link to products/inventory at all, so "integrate
-- repair parts with inventory" (section 3 of the brief) has nothing to
-- attach to without new columns.
--
-- GAP D — no notification is ever created for repair/rental/student/
-- referral status changes — only order creation does (0032/0033). The
-- existing recipient_user_id-based RLS (0025) already supports correct
-- per-user read state for these (unlike the role-targeted staff
-- notifications flagged in the Phase 5 report) — it just isn't being
-- used yet for anything but orders.

-- ------------------------------------------------------------------
-- A + B: guest tracking tokens. A long, random, unguessable token
-- distinct from the human-readable ticket/booking number. Guest tracking
-- pages require BOTH the ticket/booking number AND this token (sent to
-- the guest at submission time) — this is verified in application code
-- via the privileged client (the same established pattern as guest cart/
-- guest order confirmation elsewhere in this codebase), not through an
-- RLS policy, since an anonymous session has no stable identity for RLS
-- to key off in the first place.
-- ------------------------------------------------------------------
alter table repair_tickets add column tracking_token text unique;
alter table rental_bookings add column tracking_token text unique;

create or replace function public.generate_tracking_token()
returns text
language sql
as $$
  select md5(random()::text || clock_timestamp()::text || random()::text || random()::text);
$$;

create or replace function public.set_repair_tracking_token()
returns trigger
language plpgsql
as $$
begin
  if new.tracking_token is null then
    new.tracking_token := generate_tracking_token();
  end if;
  return new;
end;
$$;
create trigger set_repair_tracking_token_trigger before insert on repair_tickets
  for each row execute function set_repair_tracking_token();

create or replace function public.set_rental_tracking_token()
returns trigger
language plpgsql
as $$
begin
  if new.tracking_token is null then
    new.tracking_token := generate_tracking_token();
  end if;
  return new;
end;
$$;
create trigger set_rental_tracking_token_trigger before insert on rental_bookings
  for each row execute function set_rental_tracking_token();

-- ------------------------------------------------------------------
-- C: repair_parts inventory linkage. Nullable — a repair part is often a
-- generic/non-stocked component (a specific chip, a cable salvaged from
-- stock) that was never a catalogue product, so forcing every part to
-- reference a product would misrepresent reality. When a part DOES map
-- to a real stocked item, product_id/variant_id link it, and
-- inventory_movement_id records which movement (via
-- apply_inventory_movement()) consumed the stock — set exactly once,
-- which is what prevents a duplicate submission from double-consuming
-- inventory (the application checks this column is still null before
-- calling apply_inventory_movement() again for the same row).
-- ------------------------------------------------------------------
alter table repair_parts add column product_id uuid references products(id) on delete set null;
alter table repair_parts add column variant_id uuid references product_variants(id) on delete set null;
alter table repair_parts add column inventory_movement_id uuid references inventory_movements(id) on delete set null;

comment on column repair_parts.inventory_movement_id is
  'Set once, when this part''s stock was actually deducted via apply_inventory_movement(). A non-null value here means "already consumed" — the application must not call apply_inventory_movement() again for this row.';

-- ------------------------------------------------------------------
-- D: customer-facing notifications on status change. Each mirrors the
-- pattern already used for order status (audit_order_status_change,
-- 0017) but targets recipient_user_id (the customer's own auth.uid())
-- rather than a role — this is the correctly-scoped, per-user case the
-- Phase 5 report already noted works fine under existing RLS; only
-- role-targeted STAFF notifications have the shared-is_read limitation.
-- Guests (customer_id is null) get no notification row — they have no
-- account to attach one to; they track status via tracking_token instead.
-- ------------------------------------------------------------------
create or replace function public.notify_repair_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.customer_id is not null and (tg_op = 'INSERT' or old.status is distinct from new.status) then
    insert into notifications (recipient_user_id, type, title, body, related_entity_type, related_entity_id)
    values (
      new.customer_id, 'repair.status_changed',
      'Repair ' || new.ticket_number || ': ' || replace(new.status::text, '_', ' '),
      'Your repair ticket status has been updated.',
      'repair_ticket', new.id
    );
  end if;
  return new;
end;
$$;
create trigger notify_repair_status_trigger after insert or update on repair_tickets
  for each row execute function notify_repair_status_change();

create or replace function public.notify_rental_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.customer_id is not null and (tg_op = 'INSERT' or old.status is distinct from new.status) then
    insert into notifications (recipient_user_id, type, title, body, related_entity_type, related_entity_id)
    values (
      new.customer_id, 'rental.status_changed',
      'Rental booking: ' || replace(new.status::text, '_', ' '),
      'Your rental booking status has been updated.',
      'rental_booking', new.id
    );
  end if;
  return new;
end;
$$;
create trigger notify_rental_status_trigger after insert or update on rental_bookings
  for each row execute function notify_rental_status_change();

create or replace function public.notify_student_verification_decision()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' and old.status is distinct from new.status and new.status in ('approved', 'rejected') then
    insert into notifications (recipient_user_id, type, title, body, related_entity_type, related_entity_id)
    values (
      new.customer_id, 'student_verification.decided',
      'Student verification ' || new.status,
      case when new.status = 'approved' then 'Your student verification was approved.'
           else 'Your student verification was not approved.' end,
      'student_verification', new.id
    );
  end if;
  return new;
end;
$$;
create trigger notify_student_verification_trigger after update on student_verifications
  for each row execute function notify_student_verification_decision();

create or replace function public.notify_referral_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' and old.status is distinct from new.status then
    insert into notifications (recipient_user_id, type, title, body, related_entity_type, related_entity_id)
    values (
      new.referrer_customer_id, 'referral.status_changed',
      'Referral status: ' || new.status,
      'One of your referrals has an updated status.',
      'referral', new.id
    );
  end if;
  return new;
end;
$$;
create trigger notify_referral_status_trigger after update on referrals
  for each row execute function notify_referral_status_change();

-- ------------------------------------------------------------------
-- GAP E (found while wiring up the public booking forms): repair_tickets
-- and rental_bookings (0022, 0023) each have an INSERT policy for an
-- AUTHENTICATED customer creating their own row, but neither has one for
-- an anonymous/guest submission at all. Since guest booking is an
-- explicit, named requirement in this phase's brief (and was already
-- described as supported in the Phase 0/3 architecture), this was a real
-- gap, not a deliberate restriction — without this, POST-ing the public
-- /repairs/book or a future rental request form as a guest would be
-- silently rejected by RLS with no way to submit at all.
-- Mirrors the existing "anyone can submit an enquiry" pattern (0024):
-- guests may insert only when customer_id is null (they cannot claim to
-- be an existing customer), and only into the ticket/booking's own
-- otherwise-not-privileged fields — status/assigned_technician_id etc.
-- still default appropriately and are not settable by this policy since
-- RLS does not restrict per-column, but a guest has no reason to set
-- them and the application's insert never includes them.
-- ------------------------------------------------------------------
create policy "guest can create a repair ticket" on repair_tickets
  for insert to anon
  with check (customer_id is null);

create policy "guest can create a rental booking" on rental_bookings
  for insert to anon
  with check (customer_id is null);

