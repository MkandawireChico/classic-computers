-- 0002_enums.sql
-- All enum types, defined up front so later migrations just reference them.

create type student_status_enum as enum ('none', 'pending', 'approved', 'rejected', 'expired');

create type product_type_enum as enum (
  'laptop', 'desktop', 'macbook', 'phone', 'tablet', 'monitor',
  'printer', 'accessory', 'networking', 'other'
);

create type condition_enum as enum ('new', 'refurbished', 'used');

create type product_status_enum as enum ('draft', 'published', 'archived');

create type spec_data_type_enum as enum ('text', 'number', 'boolean', 'enum');

create type variant_status_enum as enum ('active', 'discontinued');

create type inventory_status_enum as enum (
  'in_stock', 'low_stock', 'out_of_stock', 'discontinued', 'coming_soon'
);

create type movement_type_enum as enum (
  'opening', 'sale', 'return', 'adjustment', 'rental_checkout',
  'rental_return', 'damage', 'lost', 'correction'
);

create type cart_status_enum as enum ('active', 'converted', 'abandoned');

create type payment_status_enum as enum ('unpaid', 'paid', 'refunded', 'partial');

create type order_status_enum as enum (
  'pending', 'confirmed', 'processing', 'ready_for_pickup',
  'out_for_delivery', 'completed', 'cancelled', 'refunded'
);

create type fulfillment_type_enum as enum ('pickup', 'delivery');

create type discount_type_enum as enum ('percentage', 'fixed');

create type discount_scope_enum as enum ('all', 'category', 'product', 'student', 'campaign');

create type review_status_enum as enum ('pending', 'approved', 'rejected', 'hidden');

create type verification_status_enum as enum ('pending', 'approved', 'rejected', 'expired');

create type referral_status_enum as enum ('pending', 'qualified', 'rewarded', 'rejected');

create type reward_status_enum as enum ('pending', 'issued');

create type rental_status_enum as enum (
  'requested', 'approved', 'ready', 'active', 'returned',
  'overdue', 'cancelled', 'damaged'
);

create type repair_status_enum as enum (
  'checked_in', 'diagnosing', 'quoted', 'awaiting_approval',
  'in_progress', 'ready_for_pickup', 'completed', 'cancelled'
);

create type enquiry_topic_enum as enum (
  'product', 'stock', 'pricing', 'rental', 'repair', 'corporate', 'other'
);

create type enquiry_status_enum as enum ('new', 'read', 'responded', 'closed');

create type corporate_status_enum as enum (
  'new', 'contacted', 'quoted', 'negotiating', 'approved', 'completed', 'cancelled'
);
