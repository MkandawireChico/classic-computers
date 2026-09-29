-- Customer cart access is restricted to the customer's own cart by the
-- existing RLS policies in 0016; these grants enable Data API operations.
grant select, insert, update on table public.carts to authenticated;
grant select, insert, update, delete on table public.cart_items to authenticated;