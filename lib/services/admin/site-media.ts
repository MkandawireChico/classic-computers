import "server-only";
import { createClient } from "@/lib/supabase/server";
import { requirePermission, AuthorizationError } from "@/lib/auth/permissions";

export interface AdminSiteMediaItem {
  id: string;
  placement: string;
  storage_path: string;
  alt_text: string;
  title: string | null;
  display_order: number;
  is_active: boolean;
}

export async function listAllSiteMedia(): Promise<AdminSiteMediaItem[]> {
  const supabase = createClient();
  const { data, error } = await (supabase.from("site_media") as any)
    .select("id, placement, storage_path, alt_text, title, display_order, is_active")
    .order("placement")
    .order("display_order");
  if (error) {
    console.error("listAllSiteMedia failed:", error.message);
    return [];
  }
  return data ?? [];
}

export type ServiceResult<T = undefined> = { success: true; data: T } | { success: false; error: string };
function fail(error: string): ServiceResult<never> {
  return { success: false, error };
}
async function guard() {
  try {
    await requirePermission("settings.write");
    return null;
  } catch (e) {
    if (e instanceof AuthorizationError) return fail("You don't have permission to manage site media.");
    throw e;
  }
}

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 8 * 1024 * 1024;

export async function uploadSiteMedia(
  placement: string,
  file: File,
  altText: string,
  title: string,
): Promise<ServiceResult<{ id: string }>> {
  const guardResult = await guard();
  if (guardResult) return guardResult as ServiceResult<never>;

  if (!ALLOWED_TYPES.has(file.type)) return fail("Only JPEG, PNG, or WebP images are allowed.");
  if (file.size > MAX_BYTES) return fail("Image must be 8MB or smaller.");
  if (!altText.trim()) return fail("Alt text is required for site media (accessibility).");

  const supabase = createClient();
  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `${placement}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage.from("site-media").upload(path, file, {
    contentType: file.type,
  });
  if (uploadError) return fail("Could not upload image.");

  const { data, error } = await (supabase.from("site_media") as any)
    .insert({ placement, storage_path: path, alt_text: altText, title: title || null, is_active: true })
    .select("id")
    .single();

  if (error) {
    await supabase.storage.from("site-media").remove([path]);
    return fail("Could not save media metadata.");
  }
  return { success: true, data: { id: data.id } };
}

export async function toggleSiteMediaActive(id: string, isActive: boolean): Promise<ServiceResult> {
  const guardResult = await guard();
  if (guardResult) return guardResult as ServiceResult<never>;

  const supabase = createClient();
  const { error } = await (supabase.from("site_media") as any).update({ is_active: isActive }).eq("id", id);
  if (error) return fail("Could not update media.");
  return { success: true, data: undefined };
}

export async function deleteSiteMedia(id: string): Promise<ServiceResult> {
  const guardResult = await guard();
  if (guardResult) return guardResult as ServiceResult<never>;

  const supabase = createClient();
  const { data: media } = await (supabase.from("site_media") as any).select("storage_path").eq("id", id).maybeSingle();
  const { error } = await (supabase.from("site_media") as any).delete().eq("id", id);
  if (error) return fail("Could not delete media.");
  if (media?.storage_path) await supabase.storage.from("site-media").remove([media.storage_path]);
  return { success: true, data: undefined };
}
