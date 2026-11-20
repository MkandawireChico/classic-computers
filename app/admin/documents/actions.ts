"use server";

import { revalidatePath } from "next/cache";
import { convertAcceptedQuotationToInvoice } from "@/lib/services/admin/business-documents";

export async function convertQuotationToInvoiceAction(quotationId: string) {
  const result = await convertAcceptedQuotationToInvoice({ quotationId });
  if (result.success) {
    revalidatePath(`/admin/documents/${quotationId}`);
    revalidatePath("/admin/documents");
  }
  return result;
}
