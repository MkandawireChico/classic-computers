import "server-only";
import { createClient } from "@/lib/supabase/server";
import { requirePermission, AuthorizationError } from "@/lib/auth/permissions";
import { discountSchema, discountUpdateSchema } from "@/schemas/admin/discount";

export interface AdminDiscount {
  id: string;
  name: string;
  type: string;
  value: number;
  scope: string;
  min_quantity: number | null;
  min_order_total: number | null;
  max_discount_amount: number | null;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
}

export async function listDiscounts(): Promise<AdminDiscount[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("discounts")
    .select("id, name, type, value, scope, min_quantity, min_order_total, max_discount_amount, starts_at, ends_at, is_active")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("listDiscounts failed:", error.message);
    return [];
  }
  return (data ?? []) as AdminDiscount[];
}

export type ServiceResult = { success: true } | { success: false; error: string };

async function guard(): Promise<ServiceResult | null> {
  try {
    await requirePermission("settings.write");
    return null;
  } catch (e) {
    if (e instanceof AuthorizationError) return { success: false, error: "You don't have permission to manage discounts." };
    throw e;
  }
}

export async function createDiscount(input: unknown): Promise<ServiceResult> {
  const guardResult = await guard();
  if (guardResult) return guardResult;

  const parsed = discountSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid discount." };
  const d = parsed.data;

  const supabase = createClient();
  const { data, error } = await (supabase.from("discounts") as any)
    .insert({
      name: d.name,
      type: d.type,
      value: d.value,
      scope: d.scope,
      min_quantity: d.minQuantity || null,
      min_order_total: d.minOrderTotal || null,
      max_discount_amount: d.maxDiscountAmount || null,
      starts_at: d.startsAt || null,
      ends_at: d.endsAt || null,
      is_active: d.isActive ?? true,
    })
    .select("id")
    .single();
  if (error) return { success: false, error: "Could not create discount." };

  if (d.scope === "product" && d.productIds?.length) {
    await (supabase.from("discount_products") as any).insert(
      d.productIds.map((productId) => ({ discount_id: data.id, product_id: productId })),
    );
  }
  if (d.scope === "category" && d.categoryIds?.length) {
    await (supabase.from("discount_categories") as any).insert(
      d.categoryIds.map((categoryId) => ({ discount_id: data.id, category_id: categoryId })),
    );
  }

  return { success: true };
}

export async function updateDiscount(input: unknown): Promise<ServiceResult> {
  const guardResult = await guard();
  if (guardResult) return guardResult;

  const parsed = discountUpdateSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid discount." };
  const d = parsed.data;

  const supabase = createClient();
  const { error } = await (supabase.from("discounts") as any)
    .update({
      name: d.name,
      type: d.type,
      value: d.value,
      scope: d.scope,
      min_quantity: d.minQuantity || null,
      min_order_total: d.minOrderTotal || null,
      max_discount_amount: d.maxDiscountAmount || null,
      starts_at: d.startsAt || null,
      ends_at: d.endsAt || null,
      is_active: d.isActive ?? true,
    })
    .eq("id", d.id);
  if (error) return { success: false, error: "Could not update discount." };
  return { success: true };
}

export async function toggleDiscountActive(id: string, isActive: boolean): Promise<ServiceResult> {
  const guardResult = await guard();
  if (guardResult) return guardResult;

  const supabase = createClient();
  const { error } = await (supabase.from("discounts") as any).update({ is_active: isActive }).eq("id", id);
  if (error) return { success: false, error: "Could not update discount." };
  return { success: true };
}
