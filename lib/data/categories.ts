import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { CategorySummary } from "@/types/catalog";

export function normalizeShopCategorySlug(slug: string): string {
  const normalized = slug.trim().toLowerCase();
  const aliases: Record<string, string> = {
    laptop: "laptop-computers",
    laptops: "laptop-computers",
  };
  return aliases[normalized] ?? normalized;
}

export const getCategories = cache(async function getCategories(): Promise<CategorySummary[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, parent_id, display_order")
    .order("display_order", { ascending: true });

  if (error) {
    console.error("getCategories failed:", error.message);
    return [];
  }
  return data ?? [];
});

export async function getCategoryBySlug(slug: string): Promise<CategorySummary | null> {
  const normalizedSlug = normalizeShopCategorySlug(slug);
  const supabase = createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, parent_id, display_order")
    .eq("slug", normalizedSlug)
    .maybeSingle();

  if (error) {
    console.error("getCategoryBySlug failed:", error.message);
    return null;
  }
  return data;
}
