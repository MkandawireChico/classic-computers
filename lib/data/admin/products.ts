import "server-only";
import { createClient } from "@/lib/supabase/server";

export interface AdminProductListItem {
  id: string;
  sku: string;
  slug: string;
  name: string;
  status: string;
  is_featured: boolean;
  base_price: number;
  sale_price: number | null;
  brand_name: string | null;
  category_name: string | null;
  primary_image_path: string | null;
  updated_at: string;
}

export interface AdminProductFilters {
  query?: string;
  status?: string;
  categoryId?: string;
  page?: number;
  pageSize?: number;
}

export interface AdminProductListResult {
  items: AdminProductListItem[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Unlike the storefront's product queries, this deliberately does NOT
 * filter on status='published' — staff with products.read need to see
 * drafts and archived listings too. RLS (0008: "products.read can read
 * all products") is what actually authorizes that, not this function.
 */
export async function listAdminProducts(filters: AdminProductFilters): Promise<AdminProductListResult> {
  const supabase = createClient();
  const page = filters.page && filters.page > 0 ? filters.page : 1;
  const pageSize = filters.pageSize && filters.pageSize > 0 ? filters.pageSize : 25;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = (supabase.from("products") as any)
    .select(
      `
      id, sku, slug, name, status, is_featured, base_price, sale_price, updated_at,
      brand:brands ( name ),
      category:categories ( name ),
      product_images ( storage_path, is_primary, variant_id )
    `,
      { count: "exact" },
    )
    .order("updated_at", { ascending: false });

  if (filters.status) query = query.eq("status", filters.status);
  if (filters.categoryId) query = query.eq("category_id", filters.categoryId);
  if (filters.query && filters.query.trim()) {
    const term = filters.query.trim().replace(/[%_]/g, "");
    query = query.or(`name.ilike.%${term}%,sku.ilike.%${term}%`);
  }

  const { data, error, count } = await query.range(from, to);
  if (error) {
    console.error("listAdminProducts failed:", error.message);
    return { items: [], total: 0, page, pageSize };
  }

  const items: AdminProductListItem[] = (data ?? []).map((row: any) => {
    const productImages = (row.product_images ?? []).filter((i: any) => i.variant_id === null);
    const primary = productImages.find((i: any) => i.is_primary) ?? productImages[0] ?? null;
    return {
      id: row.id,
      sku: row.sku,
      slug: row.slug,
      name: row.name,
      status: row.status,
      is_featured: row.is_featured,
      base_price: Number(row.base_price),
      sale_price: row.sale_price === null ? null : Number(row.sale_price),
      brand_name: row.brand?.name ?? null,
      category_name: row.category?.name ?? null,
      primary_image_path: primary?.storage_path ?? null,
      updated_at: row.updated_at,
    };
  });

  return { items, total: count ?? items.length, page, pageSize };
}

export interface AdminProductDetail {
  id: string;
  sku: string;
  slug: string;
  name: string;
  brand_id: string | null;
  category_id: string;
  product_type: string;
  condition: string;
  description: string | null;
  base_price: number;
  sale_price: number | null;
  warranty_text: string | null;
  status: string;
  is_featured: boolean;
  seo_title: string | null;
  seo_description: string | null;
  variants: Array<{
    id: string;
    sku: string;
    name: string;
    price: number;
    sale_price: number | null;
    is_default: boolean;
    status: string;
    inventory: { id: string; quantity_on_hand: number; status: string } | null;
  }>;
  images: Array<{
    id: string;
    storage_path: string;
    alt_text: string | null;
    is_primary: boolean;
    display_order: number;
    variant_id: string | null;
  }>;
  specifications: Array<{
    id: string;
    spec_definition_id: string;
    variant_id: string | null;
    value: string;
    key: string;
    label: string;
  }>;
  inventory: { id: string; quantity_on_hand: number; status: string } | null;
}

export async function getAdminProductById(id: string): Promise<AdminProductDetail | null> {
  const supabase = createClient();

  const { data, error } = await (supabase
    .from("products") as any)
    .select(`
      id, sku, slug, name, brand_id, category_id, product_type, condition, description,
      base_price, sale_price, warranty_text, status, is_featured, seo_title, seo_description,
      product_variants ( id, sku, name, price, sale_price, is_default, status,
        inventory ( id, quantity_on_hand, status )
      ),
      product_images ( id, storage_path, alt_text, is_primary, display_order, variant_id ),
      product_specifications (
        id, spec_definition_id, variant_id, value,
        specification_definitions ( key, label )
      ),
      inventory ( id, quantity_on_hand, status, variant_id )
    `)
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;

  const row: any = data;
  const productLevelInventory = (row.inventory ?? []).find((i: any) => i.variant_id === null) ?? null;
  const variantInventoryById = new Map(
    (row.inventory ?? []).filter((i: any) => i.variant_id !== null).map((i: any) => [i.variant_id, i]),
  );

  return {
    id: row.id,
    sku: row.sku,
    slug: row.slug,
    name: row.name,
    brand_id: row.brand_id,
    category_id: row.category_id,
    product_type: row.product_type,
    condition: row.condition,
    description: row.description,
    base_price: Number(row.base_price),
    sale_price: row.sale_price === null ? null : Number(row.sale_price),
    warranty_text: row.warranty_text,
    status: row.status,
    is_featured: row.is_featured,
    seo_title: row.seo_title,
    seo_description: row.seo_description,
    variants: (row.product_variants ?? []).map((v: any) => ({
      id: v.id,
      sku: v.sku,
      name: v.name,
      price: Number(v.price),
      sale_price: v.sale_price === null ? null : Number(v.sale_price),
      is_default: v.is_default,
      status: v.status,
      inventory: variantInventoryById.get(v.id) ?? null,
    })),
    images: (row.product_images ?? []).sort((a: any, b: any) => a.display_order - b.display_order),
    specifications: (row.product_specifications ?? []).map((s: any) => ({
      id: s.id,
      spec_definition_id: s.spec_definition_id,
      variant_id: s.variant_id,
      value: s.value,
      key: s.specification_definitions?.key ?? "",
      label: s.specification_definitions?.label ?? "",
    })),
    inventory: productLevelInventory,
  };
}

export async function getSpecDefinitionsForType(productType: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from("specification_definitions")
    .select("id, key, label, data_type, unit, display_order")
    .eq("product_type", productType as any)
    .order("display_order");
  return data ?? [];
}
