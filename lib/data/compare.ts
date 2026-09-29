import "server-only";
import { createClient } from "@/lib/supabase/server";

export interface CompareProduct {
  id: string;
  slug: string;
  name: string;
  brandName: string | null;
  price: number;
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
      id, slug, name, base_price, sale_price, product_type,
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
      const productLevelInventory = (row.inventory ?? []).find((i: any) => i.variant_id === null);

      return {
        id: row.id,
        slug: row.slug,
        name: row.name,
        brandName: row.brand?.name ?? null,
        price: Number(row.sale_price ?? row.base_price),
        productType: row.product_type,
        inventoryStatus: productLevelInventory?.status ?? null,
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
