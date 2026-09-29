-- 0042_customer_order_notifications.sql
--
-- Found while building /account/notifications: the Phase 6 brief lists
-- "order events" as a category customers should receive notifications
-- for, matching repair/rental/student/referral (0036). But the only
-- notification an order ever produces is the role-targeted staff one
-- inside create_order() — no customer-facing notification exists for
-- order creation or for subsequent status changes (confirmed/processing/
-- ready_for_pickup/etc., set via the admin order-status action from
-- Phase 5). This adds that, following the exact same pattern as
-- notify_repair_status_change (0036): a separate trigger, not a
-- modification of the existing audit_order_status_trigger (0017) or
-- create_order() (0038) — both keep doing exactly what they did before.
-- Guests (customer_id is null) get no notification row, same reasoning
-- as every other Phase 6 notification trigger: there is no account to
-- attach one to.

create or replace function public.notify_customer_order_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.customer_id is not null and (tg_op = 'INSERT' or old.order_status is distinct from new.order_status) then
    insert into notifications (recipient_user_id, type, title, body, related_entity_type, related_entity_id)
    values (
      new.customer_id, 'order.status_changed',
      'Order ' || new.order_number || ': ' || replace(new.order_status::text, '_', ' '),
      'Your order status has been updated.',
      'order', new.id
    );
  end if;
  return new;
end;
$$;

create trigger notify_customer_order_status_trigger after insert or update on orders
  for each row execute function notify_customer_order_status();
