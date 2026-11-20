-- Distinguish a partial refund from an unpaid order balance.
-- The new enum value is added in its own migration so later migrations can use it safely.
alter type public.payment_status_enum
  add value if not exists 'partially_refunded';
