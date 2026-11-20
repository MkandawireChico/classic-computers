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


import { recordBusinessDocumentTransaction } from "@/lib/services/admin/business-documents";

export async function recordBusinessDocumentTransactionAction(input: unknown) {
  const result = await recordBusinessDocumentTransaction(input);
  if (result.success && typeof input === "object" && input && "documentId" in input) {
    revalidatePath(`/admin/documents/${(input as any).documentId}`);
    revalidatePath("/admin/documents");
  }
  return result;
}
