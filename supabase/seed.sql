-- supabase/seed.sql
--
-- DEVELOPMENT-ONLY SEED DATA. This file is intentionally NOT a numbered
-- migration: the Supabase CLI only applies seed.sql when you run
-- `supabase db reset` against a LOCAL/dev database — it is never applied
-- by `supabase db push` or any production migration deploy. This keeps
-- fake test content structurally separate from production data, per your
-- instruction to clearly label and isolate development-only seed data.
--
-- Nothing in here is presented as real Classic Computers inventory,
-- customers, or reviews — nothing here should ever reach production.

insert into categories (name, slug, display_order) values
  ('Laptops', 'laptops', 1),
  ('Desktop Computers', 'desktops', 2),
  ('MacBooks', 'macbooks', 3),
  ('Phones', 'phones', 4),
  ('Tablets', 'tablets', 5),
  ('Monitors', 'monitors', 6),
  ('Printers & Scanners', 'printers', 7),
  ('Accessories', 'accessories', 8),
  ('Networking Equipment', 'networking', 9)
on conflict (slug) do nothing;

insert into brands (name, slug) values
  ('HP', 'hp'),
  ('Dell', 'dell'),
  ('Lenovo', 'lenovo'),
  ('Acer', 'acer'),
  ('Asus', 'asus'),
  ('Apple', 'apple')
on conflict (name) do nothing;

-- One clearly-fake development product so the catalogue/cart/checkout flow
-- has something to render against locally in Phase 3+. Not a real listing.
do $$
declare
  v_category_id uuid;
  v_brand_id uuid;
  v_product_id uuid;
begin
  select id into v_category_id from categories where slug = 'laptops';
  select id into v_brand_id from brands where slug = 'dell';

  insert into products (
    sku, slug, name, brand_id, category_id, product_type, condition,
    description, base_price, status
  ) values (
    'DEV-SKU-0001', 'dev-sample-laptop-do-not-publish',
    '[DEV SEED] Sample Laptop — not a real listing',
    v_brand_id, v_category_id, 'laptop', 'refurbished',
    'Development-only seed product for local testing. Never mark this published in production.',
    350000.00, 'draft'
  )
  returning id into v_product_id;

  insert into inventory (product_id, quantity_on_hand, low_stock_threshold)
  values (v_product_id, 5, 2);
end $$;
