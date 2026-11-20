"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function submitQuotationDecision(documentId: string, decision: "accepted" | "rejected", comment = "") {
  if (!/^[0-9a-f-]{36}$/i.test(documentId) || !["accepted", "rejected"].includes(decision) || comment.length > 1000) {
    return { success: false as const, error: "Invalid quotation decision." };
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false as const, error: "Sign in to respond to this quotation." };

  const { error } = await (supabase.from("business_document_decisions") as any).insert({
    document_id: documentId,
    customer_id: user.id,
    decision,
    comment: comment.trim() || null,
  });
  if (error) {
    console.error("submitQuotationDecision failed:", error.message);
    return { success: false as const, error: "Your response was not recorded. The quotation might already have a decision or have expired." };
  }

  revalidatePath("/account/quotations");
  revalidatePath(`/account/quotations/${documentId}`);
  return { success: true as const };
}
