create table public.customer_interest_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null check (event_name in (
    'page_view', 'product_view', 'product_gallery_opened',
    'search_performed', 'search_no_results', 'search_result_selected',
    'add_to_cart', 'remove_from_cart', 'add_to_wishlist', 'product_enquiry_submitted',
    'rental_page_viewed', 'rental_request_started', 'rental_request_submitted',
    'repair_page_viewed', 'repair_request_started', 'repair_request_submitted',
    'corporate_page_viewed', 'quotation_request_started', 'quotation_request_submitted',
    'checkout_started', 'payment_method_selected', 'order_placed', 'order_product_placed',
    'category_viewed', 'student_deals_viewed', 'contact_page_viewed',
    'whatsapp_clicked', 'telephone_clicked', 'email_clicked'
  )),
  event_category text not null check (event_category in (
    'navigation', 'product', 'search', 'cart', 'rental', 'repair',
    'corporate', 'checkout', 'conversion', 'contact'
  )),
  created_at timestamptz not null default now(),
  visitor_id uuid not null,
  customer_id uuid references public.customers(id) on delete set null,
  session_id uuid not null,
  page_path text not null check (length(page_path) <= 255 and page_path like '/%' and page_path !~ '[?#]'),
  product_id uuid references public.products(id) on delete set null,
  category_id uuid references public.categories(id) on delete set null,
  search_term text check (search_term is null or length(search_term) <= 100),
  device_category text not null check (device_category in ('mobile', 'tablet', 'desktop', 'unknown')),
  metadata jsonb not null default '{}'::jsonb check (
    jsonb_typeof(metadata) = 'object' and pg_column_size(metadata) <= 2048
  )
);

create index customer_interest_events_time_idx on public.customer_interest_events(created_at desc);
create index customer_interest_events_name_time_idx on public.customer_interest_events(event_name, created_at desc);
create index customer_interest_events_product_time_idx on public.customer_interest_events(product_id, created_at desc)
  where product_id is not null;
create index customer_interest_events_category_time_idx on public.customer_interest_events(category_id, created_at desc)
  where category_id is not null;
create index customer_interest_events_visitor_session_time_idx
  on public.customer_interest_events(visitor_id, session_id, created_at desc);
create index customer_interest_events_customer_time_idx
  on public.customer_interest_events(customer_id, created_at desc)
  where customer_id is not null;

alter table public.customer_interest_events enable row level security;
revoke all on public.customer_interest_events from public, anon, authenticated;

create or replace function public.record_customer_interest_event(
  p_event_name text,
  p_event_category text,
  p_visitor_id uuid,
  p_session_id uuid,
  p_page_path text,
  p_product_id uuid default null,
  p_category_id uuid default null,
  p_search_term text default null,
  p_device_category text default 'unknown',
  p_metadata jsonb default '{}'::jsonb
)
returns boolean
language plpgsql
security definer
set search_path = pg_catalog, public, auth, extensions
as $$
declare
  request_count integer;
  expected_category text;
  result_count_value numeric;
begin
  expected_category := case
    when p_event_name in ('product_view', 'product_gallery_opened', 'add_to_wishlist', 'product_enquiry_submitted') then 'product'
    when p_event_name in ('search_performed', 'search_no_results', 'search_result_selected') then 'search'
    when p_event_name in ('add_to_cart', 'remove_from_cart') then 'cart'
    when p_event_name in ('rental_page_viewed', 'rental_request_started', 'rental_request_submitted') then 'rental'
    when p_event_name in ('repair_page_viewed', 'repair_request_started', 'repair_request_submitted') then 'repair'
    when p_event_name in ('corporate_page_viewed', 'quotation_request_started', 'quotation_request_submitted') then 'corporate'
    when p_event_name in ('checkout_started', 'payment_method_selected') then 'checkout'
    when p_event_name in ('order_placed', 'order_product_placed') then 'conversion'
    when p_event_name in ('contact_page_viewed', 'whatsapp_clicked', 'telephone_clicked', 'email_clicked') then 'contact'
    else 'navigation'
  end;

  if p_event_name is null or p_event_category is null or p_event_name not in (
    'page_view', 'product_view', 'product_gallery_opened',
    'search_performed', 'search_no_results', 'search_result_selected',
    'add_to_cart', 'remove_from_cart', 'add_to_wishlist', 'product_enquiry_submitted',
    'rental_page_viewed', 'rental_request_started', 'rental_request_submitted',
    'repair_page_viewed', 'repair_request_started', 'repair_request_submitted',
    'corporate_page_viewed', 'quotation_request_started', 'quotation_request_submitted',
    'checkout_started', 'payment_method_selected', 'order_placed', 'order_product_placed',
    'category_viewed', 'student_deals_viewed', 'contact_page_viewed',
    'whatsapp_clicked', 'telephone_clicked', 'email_clicked'
  ) or p_event_category <> expected_category then
    raise exception 'Unsupported analytics event';
  end if;

  if p_visitor_id is null or p_session_id is null
    or p_page_path is null or length(p_page_path) > 255
    or p_page_path !~ '^/[^?#]*$'
    or p_device_category not in ('mobile', 'tablet', 'desktop', 'unknown')
    or p_search_term is not null and length(p_search_term) > 100
    or p_metadata is null or jsonb_typeof(p_metadata) <> 'object'
    or p_metadata - 'result_count' - 'payment_method' <> '{}'::jsonb
    or pg_column_size(p_metadata) > 2048 then
    raise exception 'Invalid analytics event data';
  end if;

  if p_search_term is not null and (
    p_search_term ~* '[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}'
    or p_search_term ~ '^\+?[\d\s().-]{7,}$'
  ) then
    raise exception 'Search term is not stored for privacy reasons';
  end if;

  if p_metadata ? 'result_count' then
    if jsonb_typeof(p_metadata -> 'result_count') <> 'number' then
      raise exception 'Invalid analytics result count';
    end if;
    result_count_value := (p_metadata ->> 'result_count')::numeric;
    if result_count_value < 0
      or result_count_value > 100000
      or result_count_value <> trunc(result_count_value) then
      raise exception 'Invalid analytics result count';
    end if;
  end if;

  if p_metadata ? 'payment_method' and (
    jsonb_typeof(p_metadata -> 'payment_method') <> 'string'
    or p_metadata ->> 'payment_method' not in ('pay_at_shop', 'bank_transfer', 'mobile_money', 'cash_on_delivery')
  ) then
    raise exception 'Invalid analytics payment method';
  end if;

  if p_event_name in ('product_view', 'product_gallery_opened', 'add_to_cart', 'remove_from_cart', 'add_to_wishlist', 'product_enquiry_submitted', 'order_product_placed')
    and p_product_id is null then
    raise exception 'Product analytics events require a product reference';
  end if;

  if p_event_name in ('search_performed', 'search_no_results') and
    (p_search_term is null or length(trim(p_search_term)) = 0) then
    raise exception 'Search analytics events require a search term';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_visitor_id::text, 0));
  select count(*) into request_count
  from public.customer_interest_events e
  where e.visitor_id = p_visitor_id
    and e.created_at >= now() - interval '1 minute';
  if request_count >= 90 then
    return false;
  end if;

  insert into public.customer_interest_events (
    event_name, event_category, visitor_id, customer_id, session_id,
    page_path, product_id, category_id, search_term, device_category, metadata
  ) values (
    p_event_name, p_event_category, p_visitor_id, auth.uid(), p_session_id,
    p_page_path, p_product_id, p_category_id, lower(nullif(trim(p_search_term), '')),
    p_device_category, coalesce(p_metadata, '{}'::jsonb)
  );
  return true;
end;
$$;

revoke all on function public.record_customer_interest_event(text, text, uuid, uuid, text, uuid, uuid, text, text, jsonb) from public;
grant execute on function public.record_customer_interest_event(text, text, uuid, uuid, text, uuid, uuid, text, text, jsonb) to anon, authenticated;

create or replace function public.admin_list_customers(
  p_search text default null,
  p_registered_from date default null,
  p_registered_to date default null,
  p_activity text default 'all',
  p_limit integer default 25,
  p_offset integer default 0
)
returns table (
  id uuid,
  full_name text,
  email text,
  phone text,
  student_status text,
  created_at timestamptz,
  account_status text,
  order_count bigint,
  completed_order_count bigint,
  active_order_count bigint,
  rental_count bigint,
  repair_count bigint,
  enquiry_count bigint,
  completed_purchase_value numeric,
  last_activity timestamptz,
  total_count bigint
)
language plpgsql
stable
security definer
set search_path = public, auth
as $$
begin
  if not public.has_permission(auth.uid(), 'customers.read') then
    raise exception 'Missing permission: customers.read';
  end if;
  if p_activity is null or p_activity not in ('all', 'purchases', 'active_orders', 'rentals', 'repairs', 'enquiries_no_purchases') then
    raise exception 'Unsupported customer activity filter';
  end if;
  if p_registered_from is not null and p_registered_to is not null and p_registered_from > p_registered_to then
    raise exception 'Registration date range is invalid';
  end if;

  return query
  with customer_rows as (
    select
      u.id,
      p.full_name,
      u.email::text as email,
      p.phone,
      coalesce(c.student_status::text, 'none') as student_status,
      u.created_at,
      case
        when u.deleted_at is not null then 'deleted'
        when u.banned_until > now() then 'suspended'
        when u.confirmed_at is null then 'unconfirmed'
        else 'active'
      end as account_status,
      coalesce(o.order_count, 0)::bigint as order_count,
      coalesce(o.completed_order_count, 0)::bigint as completed_order_count,
      coalesce(o.active_order_count, 0)::bigint as active_order_count,
      coalesce(o.completed_purchase_value, 0)::numeric as completed_purchase_value,
      coalesce(r.rental_count, 0)::bigint as rental_count,
      coalesce(rt.repair_count, 0)::bigint as repair_count,
      coalesce(en.enquiry_count, 0)::bigint as enquiry_count,
      greatest(
        u.last_sign_in_at,
        o.last_order_at,
        r.last_rental_at,
        rt.last_repair_at,
        en.last_enquiry_at,
        ev.last_event_at
      ) as last_activity
    from auth.users u
    left join public.profiles p on p.id = u.id
    left join public.customers c on c.id = u.id
    left join lateral (
      select
        count(*) as order_count,
        count(*) filter (where ord.order_status = 'completed') as completed_order_count,
        count(*) filter (where ord.order_status not in ('completed', 'cancelled', 'refunded')) as active_order_count,
        coalesce(sum(ord.total) filter (where ord.order_status = 'completed'), 0) as completed_purchase_value,
        max(ord.created_at) as last_order_at
      from public.orders ord where ord.customer_id = u.id
    ) o on true
    left join lateral (
      select count(*) as rental_count, max(rb.created_at) as last_rental_at
      from public.rental_bookings rb where rb.customer_id = u.id
    ) r on true
    left join lateral (
      select count(*) as repair_count, max(ticket.created_at) as last_repair_at
      from public.repair_tickets ticket where ticket.customer_id = u.id
    ) rt on true
    left join lateral (
      select count(*) as enquiry_count, max(e.created_at) as last_enquiry_at
      from (
        select e.created_at
        from public.enquiries e
        where e.customer_id = u.id
          or (
            e.customer_id is null
            and u.email is not null
            and lower(trim(e.email)) = lower(trim(u.email::text))
          )
        union all
        select ce.created_at
        from public.corporate_enquiries ce
        where u.email is not null and lower(trim(ce.email)) = lower(trim(u.email::text))
      ) e
    ) en on true
    left join lateral (
      select max(interest.created_at) as last_event_at
      from public.customer_interest_events interest where interest.customer_id = u.id
    ) ev on true
    where u.deleted_at is null
      and (
        c.id is not null
        or exists (
          select 1 from public.user_roles ur
          join public.roles role on role.id = ur.role_id
          where ur.user_id = u.id and role.name = 'customer'
        )
      )
      and not exists (
        select 1 from public.user_roles ur
        join public.roles role on role.id = ur.role_id
        where ur.user_id = u.id and role.name <> 'customer'
      )
  ),
  filtered as (
    select cr.*
    from customer_rows cr
    where (p_search is null or trim(p_search) = '' or
      strpos(lower(coalesce(cr.full_name, '') || ' ' || coalesce(cr.email, '') || ' ' || coalesce(cr.phone, '')), lower(trim(p_search))) > 0)
      and (p_registered_from is null or (cr.created_at at time zone 'Africa/Blantyre')::date >= p_registered_from)
      and (p_registered_to is null or (cr.created_at at time zone 'Africa/Blantyre')::date <= p_registered_to)
      and case p_activity
        when 'purchases' then cr.completed_order_count > 0
        when 'active_orders' then cr.active_order_count > 0
        when 'rentals' then cr.rental_count > 0
        when 'repairs' then cr.repair_count > 0
        when 'enquiries_no_purchases' then cr.enquiry_count > 0 and cr.completed_order_count = 0
        else true
      end
  )
  select
    f.id, f.full_name, f.email, f.phone, f.student_status, f.created_at, f.account_status,
    f.order_count, f.completed_order_count, f.active_order_count, f.rental_count,
    f.repair_count, f.enquiry_count, f.completed_purchase_value, f.last_activity,
    count(*) over () as total_count
  from filtered f
  order by f.created_at desc, f.id
  limit greatest(1, least(coalesce(p_limit, 25), 100))
  offset least(greatest(coalesce(p_offset, 0), 0), 100000);
end;
$$;

revoke all on function public.admin_list_customers(text, date, date, text, integer, integer) from public, anon;
grant execute on function public.admin_list_customers(text, date, date, text, integer, integer) to authenticated;

create or replace function public.get_admin_customer_interest_analytics(
  p_from timestamptz,
  p_to timestamptz
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  if not public.has_permission(auth.uid(), 'reports.read') then
    raise exception 'Missing permission: reports.read';
  end if;
  if p_from is null or p_to is null or p_to <= p_from or p_to - p_from > interval '180 days' then
    raise exception 'Analytics range must be between 0 and 180 days';
  end if;

  with events as materialized (
    select e.*
    from public.customer_interest_events e
    where e.created_at >= p_from and e.created_at < p_to
  ),
  product_interest as (
    select
      e.product_id,
      count(*) filter (where e.event_name = 'product_view')::bigint as views,
      count(*) filter (where e.event_name = 'add_to_cart')::bigint as carts,
      count(*) filter (where e.event_name = 'add_to_wishlist')::bigint as wishlists,
      count(*) filter (where e.event_name in ('product_enquiry_submitted', 'whatsapp_clicked', 'telephone_clicked', 'email_clicked'))::bigint as contacts,
      count(*) filter (where e.event_name = 'order_product_placed')::bigint as orders
    from events e
    where e.product_id is not null
    group by e.product_id
  ),
  searches as (
    select e.search_term,
      count(*) filter (where e.event_name = 'search_performed')::bigint as searches,
      count(*) filter (where e.event_name = 'search_no_results')::bigint as no_results
    from events e
    where e.event_name in ('search_performed', 'search_no_results') and e.search_term is not null
    group by e.search_term
  ),
  category_interest as (
    select e.category_id, count(*)::bigint as views
    from events e
    where e.event_name in ('category_viewed', 'product_view') and e.category_id is not null
    group by e.category_id
  ),
  visitor_sessions as (
    select visitor_id, count(distinct session_id) as session_count
    from events group by visitor_id
  )
  select jsonb_build_object(
    'totalEvents', (select count(*) from events),
    'uniqueVisitors', (select count(distinct visitor_id) from events),
    'returningVisitors', (select count(*) from visitor_sessions where session_count > 1),
    'pageViews', (select count(*) from events where event_name in (
      'page_view', 'rental_page_viewed', 'repair_page_viewed', 'corporate_page_viewed',
      'student_deals_viewed', 'contact_page_viewed', 'checkout_started'
    )),
    'productViews', (select count(*) from events where event_name = 'product_view'),
    'searches', (select count(*) from events where event_name = 'search_performed'),
    'noResultSearches', (select count(*) from events where event_name = 'search_no_results'),
    'cartAdds', (select count(*) from events where event_name = 'add_to_cart'),
    'wishlistAdds', (select count(*) from events where event_name = 'add_to_wishlist'),
    'rentalRequests', (select count(*) from events where event_name = 'rental_request_submitted'),
    'repairRequests', (select count(*) from events where event_name = 'repair_request_submitted'),
    'corporateRequests', (select count(*) from events where event_name = 'quotation_request_submitted'),
    'checkoutStarts', (select count(*) from events where event_name = 'checkout_started'),
    'ordersPlaced', (select count(*) from events where event_name = 'order_placed'),
    'visitorConversionPercent', case
      when (select count(distinct visitor_id) from events) = 0 then null
      else round(
        100.0 * (select count(distinct visitor_id) from events where event_name = 'order_placed')
        / (select count(distinct visitor_id) from events), 1
      )
    end,
    'topProducts', coalesce((
      select jsonb_agg(to_jsonb(top_product))
      from (
        select p.id, p.name, pi.views, pi.carts, pi.wishlists, pi.contacts, pi.orders
        from product_interest pi join public.products p on p.id = pi.product_id
        order by pi.views desc, pi.carts desc limit 10
      ) top_product
    ), '[]'::jsonb),
    'topSearches', coalesce((
      select jsonb_agg(to_jsonb(top_search))
      from (select search_term, searches, no_results from searches order by searches desc limit 10) top_search
    ), '[]'::jsonb),
    'topCategories', coalesce((
      select jsonb_agg(to_jsonb(top_category))
      from (
        select c.id, c.name, ci.views from category_interest ci
        join public.categories c on c.id = ci.category_id
        order by ci.views desc limit 10
      ) top_category
    ), '[]'::jsonb)
  ) into result;

  return result;
end;
$$;

revoke all on function public.get_admin_customer_interest_analytics(timestamptz, timestamptz) from public, anon;
grant execute on function public.get_admin_customer_interest_analytics(timestamptz, timestamptz) to authenticated;

create or replace function public.purge_customer_interest_events()
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  removed_count bigint;
begin
  delete from public.customer_interest_events
  where created_at < now() - interval '180 days';
  get diagnostics removed_count = row_count;
  return removed_count;
end;
$$;

revoke all on function public.purge_customer_interest_events() from public, anon, authenticated;
grant execute on function public.purge_customer_interest_events() to service_role;
