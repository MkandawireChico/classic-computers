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

  const supabase = createClient();
  // .update() on an existing row, never insert-or-overwrite-blind — the
  // key already exists (seeded in Phase 2), and the admin UI shows the
  // CURRENT value before editing (section 25: "do not overwrite existing
  // seeded information without reviewing the current values").
  const { error } = await (supabase.from("site_settings") as any).update({ value }).eq("key", key);
  if (error) return { success: false, error: "Could not update setting." };
  return { success: true };
}
