import "server-only";
import { createClient } from "@/lib/supabase/server";

export interface ActiveStudentDiscount {
  id: string;
  name: string;
  type: "percentage" | "fixed";
  value: number;
  min_quantity: number | null;
  min_order_total: number | null;
  max_discount_amount: number | null;
  starts_at: string | null;
  ends_at: string | null;
}

export async function getActiveStudentDiscounts(): Promise<{
  offers: ActiveStudentDiscount[];
  unavailable: boolean;
}> {
  const supabase = createClient();
  const now = new Date().toISOString();
  const { data, error } = await (supabase.from("discounts") as any)
    .select("id, name, type, value, min_quantity, min_order_total, max_discount_amount, starts_at, ends_at")
    .eq("scope", "student")
    .eq("is_active", true)
    .or(`starts_at.is.null,starts_at.lte.${now}`)
    .or(`ends_at.is.null,ends_at.gte.${now}`)
    .order("starts_at", { ascending: false, nullsFirst: true });

  if (error) {
    console.error("getActiveStudentDiscounts failed:", error.message);
    return { offers: [], unavailable: true };
  }

  return {
    offers: (data ?? []).map((offer: any) => ({
      ...offer,
      value: Number(offer.value),
      min_order_total: offer.min_order_total === null ? null : Number(offer.min_order_total),
      max_discount_amount: offer.max_discount_amount === null ? null : Number(offer.max_discount_amount),
    })) as ActiveStudentDiscount[],
    unavailable: false,
  };
}