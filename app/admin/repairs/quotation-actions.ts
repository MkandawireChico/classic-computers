"use server";

import { revalidatePath } from "next/cache";
import { createRepairQuotation } from "@/lib/services/admin/business-documents";

export async function createRepairQuotationAction(input: unknown) {
  const result = await createRepairQuotation(input);
  if (result.success && typeof input === "object" && input && "ticketId" in input) {
    revalidatePath(`/admin/repairs/${(input as any).ticketId}`);
    revalidatePath("/admin/documents");
  }
  return result;
}
