import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { SiteMediaItem } from "@/types/catalog";
import type { SiteMediaRow } from "@/types/supabase";

export const getSiteMedia = cache(async function getSiteMedia(
  placement: SiteMediaRow["placement"],
  limit = 1,
): Promise<SiteMediaItem[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("site_media")
    .select("id, storage_path, alt_text, title")
    .eq("placement", placement)
    .eq("is_active", true)
    .order("display_order", { ascending: true })
    .limit(limit);

  if (error) {
    console.error(`getSiteMedia(${placement}) failed:`, error.message);
    return [];
  }
  return data ?? [];
});
