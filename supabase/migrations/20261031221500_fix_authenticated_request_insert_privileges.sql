grant insert on table
  public.corporate_enquiries,
  public.repair_tickets,
  public.rental_bookings
to authenticated;

create or replace function public.set_ticket_number()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public, pg_temp
as $$
begin
  if new.ticket_number is null then
    new.ticket_number := public.generate_ticket_number();
  end if;
  return new;
end;
$$;
