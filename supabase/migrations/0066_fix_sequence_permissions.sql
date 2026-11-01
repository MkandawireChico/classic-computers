-- Grant usage on sequences to service_role for guest submissions
grant usage, select on sequence public.repair_ticket_number_seq to service_role;

-- Grant insert on request tables to service_role for guest submissions
grant select, insert on table public.enquiries to service_role;
grant select, insert on table public.corporate_enquiries to service_role;
grant select, insert on table public.student_verifications to service_role;
