import "server-only";
import { createClient } from "@/lib/supabase/server";

export interface AdminInventoryRow {
  id: string;
  product_id: string;
  variant_id: string | null;
  product_name: string;
  variant_name: string | null;
  sku: string;
  quantity_on_hand: number;
  low_stock_threshold: number;
  status: string;
  updated_at: string;
}

export interface InventoryFilters {
  query?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

export async function listInventory(filters: InventoryFilters) {
  const supabase = createClient();
  const page = filters.page && filters.page > 0 ? filters.page : 1;
  const pageSize = filters.pageSize && filters.pageSize > 0 ? filters.pageSize : 25;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let matchingProductIds: string[] | null = null;
  const term = filters.query?.trim();
  if (term) {
    const [nameMatches, skuMatches, variantMatches] = await Promise.all([
      (supabase.from("products") as any).select("id").ilike("name", `%${term}%`),
      (supabase.from("products") as any).select("id").ilike("sku", `%${term}%`),
      (supabase.from("product_variants") as any).select("product_id").ilike("sku", `%${term}%`),
    ]);
    if (nameMatches.error || skuMatches.error || variantMatches.error) {
      console.error("listInventory search failed:", nameMatches.error?.message ?? skuMatches.error?.message ?? variantMatches.error?.message);
      return { items: [] as AdminInventoryRow[], total: 0, page, pageSize };
    }
    matchingProductIds = Array.from(new Set([
      ...(nameMatches.data ?? []).map((row: any) => row.id),
      ...(skuMatches.data ?? []).map((row: any) => row.id),
      ...(variantMatches.data ?? []).map((row: any) => row.product_id),
    ]));
    if (matchingProductIds.length === 0) {
      return { items: [] as AdminInventoryRow[], total: 0, page, pageSize };
    }
  }

  let query = (supabase.from("inventory") as any)
    .select(
      `
      id, product_id, variant_id, quantity_on_hand, low_stock_threshold, status, updated_at,
      products ( name, sku ),
      product_variants ( name, sku )
    `,
      { count: "exact" },
    )
    .order("updated_at", { ascending: false });

  if (filters.status) query = query.eq("status", filters.status);
  if (matchingProductIds) query = query.in("product_id", matchingProductIds);

  const { data, error, count } = await query.range(from, to);
  if (error) {
    console.error("listInventory failed:", error.message);
    return { items: [] as AdminInventoryRow[], total: 0, page, pageSize };
  }

  const items: AdminInventoryRow[] = (data ?? []).map((row: any) => ({
    id: row.id,
    product_id: row.product_id,
    variant_id: row.variant_id,
    product_name: row.products?.name ?? "Unknown product",
    variant_name: row.product_variants?.name ?? null,
    sku: row.product_variants?.sku ?? row.products?.sku ?? "",
    quantity_on_hand: row.quantity_on_hand,
    low_stock_threshold: row.low_stock_threshold,
    status: row.status,
    updated_at: row.updated_at,
  }));

  return { items, total: count ?? items.length, page, pageSize };
}

export interface MovementRow {
  id: string;
  movement_type: string;
  quantity_delta: number;
  reference_type: string | null;
  reference_id: string | null;
  note: string | null;
  created_at: string;
  actor_name: string | null;
}

export async function getInventoryDetail(inventoryId: string) {
  const supabase = createClient();
  const { data } = await (supabase.from("inventory") as any)
    .select(`
      id, product_id, variant_id, quantity_on_hand, low_stock_threshold, status,
      products ( name, sku ),
      product_variants ( name, sku )
    `)
    .eq("id", inventoryId)
    .maybeSingle();
  return data;
}

export async function getInventoryMovements(inventoryId: string, limit = 50): Promise<MovementRow[]> {
  const supabase = createClient();
  const { data } = await (supabase.from("inventory_movements") as any)
    .select("id, movement_type, quantity_delta, reference_type, reference_id, note, created_at, created_by")
    .eq("inventory_id", inventoryId)
    .order("created_at", { ascending: false })
    .limit(limit);

  const rows = data ?? [];
  const actorIds = Array.from(new Set(rows.map((row: any) => row.created_by).filter(Boolean)));
  const { data: profiles } = actorIds.length
    ? await (supabase.from("profiles") as any).select("id, full_name").in("id", actorIds)
    : { data: [] };
  const actorNames = new Map((profiles ?? []).map((profile: any) => [profile.id, profile.full_name]));

  return rows.map((row: any) => ({
    id: row.id,
    movement_type: row.movement_type,
    quantity_delta: row.quantity_delta,
    reference_type: row.reference_type,
    reference_id: row.reference_id,
    note: row.note,
    created_at: row.created_at,
    actor_name: row.created_by ? actorNames.get(row.created_by) ?? "Staff member" : "System",
  }));
}
