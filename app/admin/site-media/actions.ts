"use server";

import { revalidatePath } from "next/cache";
import * as siteMediaService from "@/lib/services/admin/site-media";

export async function uploadSiteMediaAction(formData: FormData) {
  const placement = formData.get("placement")?.toString() ?? "other";
  const altText = formData.get("altText")?.toString() ?? "";
  const title = formData.get("title")?.toString() ?? "";
  const file = formData.get("file") as File | null;

  if (!file) return { success: false as const, error: "No file selected." };

  const result = await siteMediaService.uploadSiteMedia(placement, file, altText, title);
  if (result.success) {
    revalidatePath("/admin/site-media");
    revalidatePath("/", "layout");
  }
  return result;
}

export async function toggleSiteMediaActiveAction(id: string, isActive: boolean) {
  const result = await siteMediaService.toggleSiteMediaActive(id, isActive);
  if (result.success) {
    revalidatePath("/admin/site-media");
    revalidatePath("/", "layout");
  }
  return result;
}

export async function deleteSiteMediaAction(id: string) {
  const result = await siteMediaService.deleteSiteMedia(id);
  if (result.success) {
    revalidatePath("/admin/site-media");
    revalidatePath("/", "layout");
  }
  return result;
}
