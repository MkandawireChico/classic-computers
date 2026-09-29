-- 0037_rental_status_lost.sql
--
-- Found while designing the admin rental status-transition map: the
-- brief explicitly requires staff to be able to "record lost equipment"
-- for a rental, but rental_status_enum (0002) only has
-- requested/approved/ready/active/returned/overdue/cancelled/damaged —
-- no 'lost' value exists to represent that outcome distinctly from
-- 'damaged'. Adding it rather than overloading 'damaged' to mean two
-- different things.
--
-- This migration does nothing but add the enum value, in its own file
-- with no other statement — ALTER TYPE ... ADD VALUE cannot be used in
-- the same transaction as any statement that reads or writes the new
-- value, so later Phase 6 migrations that reference 'lost' must not be
-- combined into this file.

alter type rental_status_enum add value 'lost';
