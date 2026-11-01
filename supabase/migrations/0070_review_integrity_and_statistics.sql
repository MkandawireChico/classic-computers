-- Enforce completed transaction ownership for every review and expose
-- category-specific statistics through the public review data boundary.

alter table public.reviews
  alter column product_id drop not null;

alter table public.reviews
  drop constraint if exists reviews_order_id_fkey,
  drop constraint if exists reviews_rental_booking_id_fkey,
  drop constraint if exists reviews_repair_ticket_id_fkey;

alter table public.reviews
  add constraint reviews_order_id_fkey
    foreign key (order_id) references public.orders(id) on delete restrict,
  add constraint reviews_rental_booking_id_fkey
    foreign key (rental_booking_id) references public.rental_bookings(id) on delete restrict,
  add constraint reviews_repair_ticket_id_fkey
    foreign key (repair_ticket_id) references public.repair_tickets(id) on delete restrict;

drop policy if exists "customer can update own reviews" on public.reviews;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'review-images',
  'review-images',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy "review image owner or moderator can read objects"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'review-images'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.has_permission(auth.uid(), 'reviews.moderate')
    )
  );

create policy "review image owner can delete objects"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'review-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

grant select, insert on table public.review_images to authenticated;
grant select on table public.review_images to anon;

create policy "approved review images readable by everyone"
  on public.review_images for select to anon, authenticated
  using (
    exists (
      select 1 from public.reviews r
      where r.id = review_id and r.status = 'approved'
    )
  );

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
        and rb.status in ('returned', 'completed')
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

drop trigger if exists verify_review_purchase_trigger on public.reviews;
create trigger verify_review_purchase_trigger
  before insert or update on public.reviews
  for each row execute function public.verify_review_purchase();

create or replace function public.prevent_duplicate_review()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  duplicate_exists boolean := false;
  duplicate_key text;
begin
  if new.customer_id is null then
    return new;
  end if;

  if new.review_type = 'product' then
    duplicate_key := new.customer_id::text || ':product:' || new.order_id::text || ':' || new.product_id::text;
    perform pg_advisory_xact_lock(hashtextextended(duplicate_key, 0));
    select exists (
      select 1 from public.reviews r
      where r.order_id = new.order_id
        and r.customer_id = new.customer_id
        and r.product_id = new.product_id
        and r.status <> 'rejected'
        and r.id is distinct from new.id
    ) into duplicate_exists;
  elsif new.review_type = 'rental' then
    duplicate_key := new.customer_id::text || ':rental:' || new.rental_booking_id::text;
    perform pg_advisory_xact_lock(hashtextextended(duplicate_key, 0));
    select exists (
      select 1 from public.reviews r
      where r.rental_booking_id = new.rental_booking_id
        and r.customer_id = new.customer_id
        and r.status <> 'rejected'
        and r.id is distinct from new.id
    ) into duplicate_exists;
  elsif new.review_type = 'repair' then
    duplicate_key := new.customer_id::text || ':repair:' || new.repair_ticket_id::text;
    perform pg_advisory_xact_lock(hashtextextended(duplicate_key, 0));
    select exists (
      select 1 from public.reviews r
      where r.repair_ticket_id = new.repair_ticket_id
        and r.customer_id = new.customer_id
        and r.status <> 'rejected'
        and r.id is distinct from new.id
    ) into duplicate_exists;
  end if;

  if duplicate_exists then
    raise exception 'You have already submitted a review for this transaction';
  end if;
  return new;
end;
$$;

drop trigger if exists prevent_duplicate_review_trigger on public.reviews;
create trigger prevent_duplicate_review_trigger
  before insert or update on public.reviews
  for each row execute function public.prevent_duplicate_review();

-- Existing moderation auditing tracks status transitions. Also capture
-- administrator response changes in the existing append-only audit log.
create or replace function public.audit_review_moderation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.status is distinct from new.status then
    perform public.log_audit_event('review.moderated', 'review', new.id, jsonb_build_object(
      'from', old.status,
      'to', new.status,
      'review_type', new.review_type,
      'order_id', new.order_id,
      'rental_booking_id', new.rental_booking_id,
      'repair_ticket_id', new.repair_ticket_id
    ));
  end if;

  if old.admin_response is distinct from new.admin_response then
    perform public.log_audit_event('review.responded', 'review', new.id, jsonb_build_object(
      'response_at', new.admin_response_at
    ));
  end if;
  return new;
end;
$$;

create or replace function public.get_public_review_stats(
  p_review_type public.review_type_enum default null,
  p_product_id uuid default null
)
returns table (
  review_type public.review_type_enum,
  review_count bigint,
  average_rating numeric,
  one_star bigint,
  two_star bigint,
  three_star bigint,
  four_star bigint,
  five_star bigint
)
language sql
stable
set search_path = public
as $$
  select
    r.review_type,
    count(*)::bigint,
    round(avg(r.rating)::numeric, 1),
    count(*) filter (where r.rating = 1)::bigint,
    count(*) filter (where r.rating = 2)::bigint,
    count(*) filter (where r.rating = 3)::bigint,
    count(*) filter (where r.rating = 4)::bigint,
    count(*) filter (where r.rating = 5)::bigint
  from public.reviews r
  where r.status = 'approved'
    and (p_review_type is null or r.review_type = p_review_type)
    and (p_product_id is null or r.product_id = p_product_id)
  group by r.review_type;
$$;

revoke all on function public.get_public_review_stats(public.review_type_enum, uuid) from public;
grant execute on function public.get_public_review_stats(public.review_type_enum, uuid) to anon, authenticated;

create index if not exists reviews_public_rating_sort_idx
  on public.reviews(status, review_type, rating desc, created_at desc);
