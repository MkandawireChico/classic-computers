"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getMyPermissions } from "@/lib/auth/permissions";
import { convertAcceptedQuotationToInvoice, createBusinessQuotation, recordBusinessDocumentTransaction } from "@/lib/services/admin/business-documents";

export async function convertQuotationToInvoiceAction(quotationId: string) {
  const result = await convertAcceptedQuotationToInvoice({ quotationId });
  if (result.success) {
    revalidatePath(`/admin/documents/${quotationId}`);
    revalidatePath("/admin/documents");
  }
  return result;
}



export async function recordBusinessDocumentTransactionAction(input: unknown) {
  const result = await recordBusinessDocumentTransaction(input);
  if (result.success && typeof input === "object" && input && "documentId" in input) {
    revalidatePath(`/admin/documents/${(input as any).documentId}`);
    revalidatePath("/admin/documents");
  }
  return result;
}


export async function recordStaffQuotationDecision(documentId: string, decision: "accepted" | "rejected", comment: string) {
  if (!/^[0-9a-f-]{36}$/i.test(documentId) || !["accepted", "rejected"].includes(decision) || comment.trim().length < 3 || comment.length > 1000) {
    return { success: false as const, error: "Record the customer's decision and how approval was received." };
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false as const, error: "Sign in to record the decision." };

  const { data: document } = await (supabase.from("business_documents") as any)
    .select("id,document_type,source_type,status,customer_id")
    .eq("id", documentId)
    .maybeSingle();
  if (!document || document.document_type !== "quotation" || document.status !== "issued") {
    return { success: false as const, error: "This quotation is not awaiting a decision." };
  }

  const permissions = await getMyPermissions();
  const allowed = document.source_type === "order" ? permissions.has("orders.write")
    : document.source_type === "rental" ? permissions.has("rentals.write")
    : document.source_type === "repair" ? permissions.has("repairs.write")
    : ["orders.write", "repairs.write", "rentals.write"].some((key) => permissions.has(key));
  if (!allowed) return { success: false as const, error: "You don't have permission to record this decision." };

  const { error } = await (supabase.from("business_document_decisions") as any).insert({
    document_id: document.id,
    customer_id: document.customer_id,
    decision,
    decision_channel: "staff_recorded",
    recorded_by: user.id,
    comment: comment.trim(),
  });
  if (error) return { success: false as const, error: "The decision was not saved. Check whether a response already exists." };
  revalidatePath(`/admin/documents/${documentId}`);
  revalidatePath("/admin/documents");
  return { success: true as const };
}


export async function createBusinessQuotationAction(input: unknown) {
  const result = await createBusinessQuotation(input);
  if (result.success) {
    revalidatePath("/admin/documents");
  }
  return result;
}
