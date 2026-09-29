"use server";

import { revalidatePath } from "next/cache";
import * as enquiryService from "@/lib/services/admin/enquiries";

export async function updateGeneralEnquiryStatusAction(input: unknown) {
  const result = await enquiryService.updateGeneralEnquiryStatus(input);
  if (result.success) revalidatePath("/admin/enquiries");
  return result;
}
export async function updateGeneralEnquiryNotesAction(input: unknown) {
  const result = await enquiryService.updateGeneralEnquiryNotes(input);
  if (result.success) revalidatePath("/admin/enquiries");
  return result;
}
export async function updateCorporateEnquiryStatusAction(input: unknown) {
  const result = await enquiryService.updateCorporateEnquiryStatus(input);
  if (result.success) revalidatePath("/admin/enquiries");
  return result;
}
export async function updateCorporateEnquiryNotesAction(input: unknown) {
  const result = await enquiryService.updateCorporateEnquiryNotes(input);
  if (result.success) revalidatePath("/admin/enquiries");
  return result;
}
