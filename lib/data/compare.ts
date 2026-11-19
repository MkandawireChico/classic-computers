import "server-only";
import { createClient } from "@/lib/supabase/server";

export interface CompareProduct {
  id: string;
  slug: string;
  name: string;
  brandName: string | null;
  price: number;
  condition: string;
  imageUrl: string | null;
  imageAlt: string;
  productType: string;
  inventoryStatus: string | null;
  specs: Record<string, string>; // key -> "value unit"
}

export async function getCompareProducts(productIds: string[]): Promise<CompareProduct[]> {
  if (productIds.length === 0) return [];
  const supabase = createClient();

  const { data, error } = await (supabase
    .from("products") as any)
    .select(`
      id, slug, name, base_price, sale_price, product_type, condition,
      product_images ( storage_path, alt_text, display_order, is_primary, variant_id ),
      brand:brands ( name ),
      inventory:storefront_inventory_status ( status, variant_id ),
      product_specifications (
        value, variant_id,
        specification_definitions ( key, label, unit, display_order )
      )
    `)
    .in("id", productIds)
    .eq("status", "published");

  if (error || !data) {
    console.error("getCompareProducts failed:", error?.message);
    return [];
  }

  // Preserve the order the caller requested (most-recently-added last).
  const byId = new Map((data as any[]).map((row) => [row.id, row]));

  return productIds
    .map((id) => byId.get(id))
    .filter(Boolean)
    .map((row: any) => {
      const specs: Record<string, string> = {};
      for (const spec of row.product_specifications ?? []) {
        if (spec.variant_id !== null) continue;
        const def = spec.specification_definitions;
        if (!def) continue;
        specs[def.label] = `${spec.value}${def.unit ? ` ${def.unit}` : ""}`;
      }
      const inventoryRows = row.inventory ?? [];
      const productLevelInventory = inventoryRows.find((i: any) => i.variant_id === null);
      let inventoryStatus = productLevelInventory?.status ?? null;
      if (!inventoryStatus && inventoryRows.length > 0) {
        if (inventoryRows.some((item: any) => item.status === "in_stock")) inventoryStatus = "in_stock";
        else if (inventoryRows.some((item: any) => item.status === "low_stock")) inventoryStatus = "low_stock";
        else if (inventoryRows.some((item: any) => item.status === "coming_soon")) inventoryStatus = "coming_soon";
        else inventoryStatus = inventoryRows[0].status;
      }
      const images = (row.product_images ?? [])
        .filter((image: any) => image.variant_id === null)
        .sort((a: any, b: any) => a.display_order - b.display_order);
      const primaryImage = images.find((image: any) => image.is_primary) ?? images[0] ?? null;
      const imageUrl = primaryImage?.storage_path
        ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${primaryImage.storage_path}`
        : null;

      return {
        id: row.id,
        slug: row.slug,
        name: row.name,
        brandName: row.brand?.name ?? null,
        price: Number(row.sale_price !== null && Number(row.sale_price) < Number(row.base_price) ? row.sale_price : row.base_price),
        condition: row.condition,
        imageUrl,
        imageAlt: primaryImage?.alt_text ?? row.name,
        productType: row.product_type,
        inventoryStatus,
        specs,
      };
    });
}

/** The union of spec labels across the given products, in definition
 * display order where possible — this is what becomes the comparison
 * table's row headers, built from real data only (never a hard-coded
 * per-category field list). */
export function collectSpecLabels(products: CompareProduct[]): string[] {
  const labels = new Set<string>();
  for (const product of products) {
    for (const label of Object.keys(product.specs)) {
      labels.add(label);
    }
  }
  return Array.from(labels);
}
