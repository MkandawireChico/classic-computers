-- 0034_admin_notifications_and_audit.sql
--
-- Phase 5 foundation fixes, found while wiring up the admin notification
-- bell and audit trail — both are gaps in the existing (0025, 0003, 0019)
-- migrations, not new business rules. New migration only; 0001-0033
-- untouched.

-- ------------------------------------------------------------------
-- Gap 1: notifications (0025) has a SELECT policy for role-targeted
-- notifications but no UPDATE policy for them — only user-targeted ones
-- can be marked read. Since every order.created notification from
-- create_order() is role-targeted (recipient_role_id, not
-- recipient_user_id), no staff member could actually mark an order
-- notification as read under the existing policies.
-- ------------------------------------------------------------------
create policy "user can mark role-targeted notifications read" on notifications
  for update to authenticated
  using (recipient_role_id in (select role_id from user_roles where user_id = auth.uid()))
  with check (recipient_role_id in (select role_id from user_roles where user_id = auth.uid()));

-- ------------------------------------------------------------------
-- Gap 2: role assignment/removal (user_roles, 0003) had no audit trail.
-- Phase 5's admin "Staff & Roles" screen needs this per the brief's
-- explicit "role changes" audit requirement (section 21).
-- ------------------------------------------------------------------
create or replace function public.audit_user_roles_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role_name text;
  v_target_user uuid;
begin
  v_target_user := coalesce(new.user_id, old.user_id);
  select name into v_role_name from roles where id = coalesce(new.role_id, old.role_id);

  if tg_op = 'INSERT' then
    perform log_audit_event('user_role.assigned', 'user', v_target_user, jsonb_build_object('role', v_role_name));
    return new;
  elsif tg_op = 'DELETE' then
    perform log_audit_event('user_role.removed', 'user', v_target_user, jsonb_build_object('role', v_role_name));
    return old;
  end if;
  return null;
end;
$$;

create trigger audit_user_roles_trigger after insert or delete on user_roles
  for each row execute function audit_user_roles_change();

-- ------------------------------------------------------------------
-- Gap 3: review moderation (reviews, 0019) had no audit trail. Phase 5's
-- brief explicitly requires "review moderation" to be audited (section 21)
-- and says moderation must not bypass audit logging.
-- ------------------------------------------------------------------
create or replace function public.audit_review_moderation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.status is distinct from new.status then
    perform log_audit_event('review.moderated', 'review', new.id, jsonb_build_object(
      'from', old.status, 'to', new.status, 'product_id', new.product_id
    ));
  end if;
  return new;
end;
$$;

create trigger audit_reviews_trigger after update on reviews
  for each row execute function audit_review_moderation();

-- ------------------------------------------------------------------
-- Gap 4: manual/staff-initiated inventory changes (adjustment, damage,
-- lost, correction, opening, return, rental_*) are already fully
-- captured in inventory_movements (the ledger itself IS the detailed
-- audit trail for stock — Phase 2 design). This trigger additionally
-- mirrors non-sale movements into audit_logs too, so "inventory
-- adjustments" shows up in the single cross-entity admin audit log
-- (section 21 of the brief) without duplicating the ledger's own detail.
-- Sale movements are intentionally excluded here — those are already
-- covered by the order.created audit event from create_order() itself,
-- and mirroring every sale line individually would just be noise.
-- ------------------------------------------------------------------
create or replace function public.audit_inventory_adjustment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.movement_type not in ('sale') then
    perform log_audit_event('inventory.movement', 'inventory_movement', new.id, jsonb_build_object(
      'movement_type', new.movement_type, 'quantity_delta', new.quantity_delta,
      'inventory_id', new.inventory_id
    ));
  end if;
  return new;
end;
$$;

create trigger audit_inventory_movements_trigger after insert on inventory_movements
  for each row execute function audit_inventory_adjustment();
