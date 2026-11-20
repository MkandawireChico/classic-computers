import "server-only";
import { createClient } from "@/lib/supabase/server";
import { requirePermission, AuthorizationError } from "@/lib/auth/permissions";

export interface SiteSettingRow {
  id: string;
  key: string;
  value: Record<string, unknown>;
  is_public: boolean;
}

export async function listAllSettings(): Promise<SiteSettingRow[]> {
  const supabase = createClient();
  const { data, error } = await (supabase.from("site_settings") as any).select("id, key, value, is_public").order("key");
  if (error) {
    console.error("listAllSettings failed:", error.message);
    return [];
  }
  return data ?? [];
}

export type ServiceResult = { success: true } | { success: false; error: string };

export async function updateSetting(key: string, value: Record<string, unknown>): Promise<ServiceResult> {
  try {
    await requirePermission("settings.write");
  } catch (e) {
    if (e instanceof AuthorizationError) return { success: false, error: "You don't have permission to change settings." };
    throw e;
  }

  if (key === "repair_settings") {
    const rate = value.internal_labour_rate_mwk_per_hour;
    if (rate !== "" && (typeof rate !== "number" || !Number.isFinite(rate) || rate < 0 || rate > 1000000)) {
      return { success: false, error: "Enter a valid hourly internal labour cost between MWK 0 and MWK 1,000,000." };
    }
  }

  const supabase = createClient();
  // Preserve settings keys not represented by the current editor.
  const { data: existing, error: readError } = await (supabase.from("site_settings") as any)
    .select("value").eq("key", key).maybeSingle();
  if (readError || !existing) return { success: false, error: "Could not load the existing setting." };
  const mergedValue = { ...(existing.value ?? {}), ...value };
  const { error } = await (supabase.from("site_settings") as any).update({ value: mergedValue }).eq("key", key);
  if (error) return { success: false, error: "Could not update setting." };
  return { success: true };
}
