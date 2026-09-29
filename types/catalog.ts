/**
 * Domain shapes returned by lib/data/*.ts. These are intentionally
 * hand-written rather than derived from types/supabase.ts, since that file
 * is still the Phase 1/2 placeholder (see its header comment) — once you
 * run `supabase gen types`, these can be narrowed to `Tables<'products'>`
 * etc. Until then, this is what the query functions actually select.
 */

export type ProductStatus = "draft" | "published" | "archived";
export type ProductCondition = "new" | "refurbished" | "used";
export type InventoryStatus = "in_stock" | "low_stock" | "out_of_stock" | "discontinued" | "coming_soon";

export interface ProductImage {
  id: string;
  storage_path: string;
  alt_text: string | null;
  display_order: number;
  is_primary: boolean;
  variant_id: string | null;
}

export interface ProductSpecification {
  key: string;
  label: string;
  value: string;
  unit: string | null;
  display_order: number;
}

export interface ProductVariant {
  id: string;
  sku: string;
  name: string;
  price: number;
  sale_price: number | null;
  is_default: boolean;
  status: "active" | "discontinued";
}

export interface ProductListItem {
  id: string;
  sku: string;
  slug: string;
  name: string;
  base_price: number;
  sale_price: number | null;
  condition: ProductCondition;
  is_featured: boolean;
  brand: { id: string; name: string; slug: string } | null;
  category: { id: string; name: string; slug: string } | null;
  primary_image: ProductImage | null;
  inventory_status: InventoryStatus | null;
}

export interface ProductDetail extends ProductListItem {
  description: string | null;
  warranty_text: string | null;
  seo_title: string | null;
  seo_description: string | null;
  images: ProductImage[];
  specifications: ProductSpecification[];
  variants: ProductVariant[];
  /** variant id -> that variant's own inventory status. Empty for
   * products with no variants — use `inventory_status` instead in that
   * case. Added in the Phase 4 correction pass (item 3): the purchase
   * panel and stock badge must key off the SELECTED variant's own stock,
   * never the product-level row, which often doesn't exist at all for a
   * product that has variants (each variant gets its own inventory row). */
  inventory_by_variant: Record<string, InventoryStatus>;
}

export interface CategorySummary {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  display_order: number;
}

export interface BrandSummary {
  id: string;
  name: string;
  slug: string;
}

export interface ApprovedReview {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  created_at: string;
  product: { name: string; slug: string } | null;
}

export interface SiteMediaItem {
  id: string;
  storage_path: string;
  alt_text: string;
  title: string | null;
}

export interface ShopFilters {
  categorySlug?: string;
  brandSlugs?: string[];
  minPrice?: number;
  maxPrice?: number;
  availableOnly?: boolean;
  query?: string;
  sort?: "featured" | "newest" | "price_asc" | "price_desc" | "name";
  page?: number;
  pageSize?: number;
}

export interface ShopResult {
  items: ProductListItem[];
  total: number;
  page: number;
  pageSize: number;
}
