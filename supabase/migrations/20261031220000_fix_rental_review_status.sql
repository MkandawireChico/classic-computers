create or replace function public.verify_review_purchase()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  transaction_is_valid boolean := false;
begin
  if tg_op = 'UPDATE' then
    if new.customer_id is distinct from old.customer_id
      or new.review_type is distinct from old.review_type
      or new.product_id is distinct from old.product_id
      or new.order_id is distinct from old.order_id
      or new.rental_booking_id is distinct from old.rental_booking_id
      or new.repair_ticket_id is distinct from old.repair_ticket_id then
      raise exception 'Review transaction ownership and references are immutable';
    end if;
    new.verified_purchase := old.verified_purchase;
    return new;
  end if;

  if new.customer_id is null then
    raise exception 'A review must belong to an authenticated customer';
  end if;

  if new.review_type = 'product' then
    if new.order_id is null or new.product_id is null
      or new.rental_booking_id is not null or new.repair_ticket_id is not null then
      raise exception 'Invalid product review transaction';
    end if;

    select exists (
      select 1
      from public.orders o
      join public.order_items oi on oi.order_id = o.id
      where o.id = new.order_id
        and o.customer_id = new.customer_id
        and o.order_status = 'completed'
        and oi.product_id = new.product_id
    ) into transaction_is_valid;
  elsif new.review_type = 'rental' then
    if new.rental_booking_id is null or new.product_id is not null
      or new.order_id is not null or new.repair_ticket_id is not null then
      raise exception 'Invalid rental review transaction';
    end if;

    select exists (
      select 1 from public.rental_bookings rb
      where rb.id = new.rental_booking_id
        and rb.customer_id = new.customer_id
        and rb.status = 'returned'
    ) into transaction_is_valid;
  elsif new.review_type = 'repair' then
    if new.repair_ticket_id is null or new.product_id is not null
      or new.order_id is not null or new.rental_booking_id is not null then
      raise exception 'Invalid repair review transaction';
    end if;

    select exists (
      select 1 from public.repair_tickets rt
      where rt.id = new.repair_ticket_id
        and rt.customer_id = new.customer_id
        and rt.status = 'completed'
    ) into transaction_is_valid;
  end if;

  if not transaction_is_valid then
    raise exception 'Review transaction is not owned by this customer or is not complete';
  end if;

  new.verified_purchase := true;
  return new;
end;
$$;
