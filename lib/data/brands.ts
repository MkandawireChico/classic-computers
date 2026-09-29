import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { BrandSummary } from "@/types/catalog";

export const getBrands = cache(async function getBrands(): Promise<BrandSummary[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("brands").select("id, name, slug").order("name");

  if (error) {
    console.error("getBrands failed:", error.message);
    return [];
  }
  return data ?? [];
});
