import "server-only";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requirePermission, AuthorizationError } from "@/lib/auth/permissions";
import { calculateDocumentPricing } from "@/lib/documents/pricing";
import type { ServiceResult } from "@/lib/services/admin/repairs";

const lineSchema = z.object({
  description: z.string().trim().min(2).max(240),
  quantity: z.coerce.number().positive().max(100000),
  unitPrice: z.coerce.number().min(0).max(999999999),
});
const quotationSchema = z.object({
  ticketId: z.string().uuid(),
  lines: z.array(lineSchema).min(1).max(30),
  discountAmount: z.coerce.number().min(0).default(0),
  discountReason: z.string().trim().max(300).optional().default(""),
  notes: z.string().trim().max(2000).optional().default(""),
  validUntil: z.string().date().optional(),
});

export async function createRepairQuotation(input: unknown): Promise<ServiceResult & { documentId?: string; documentNumber?: number }> {
  const parsed = quotationSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Check the quotation details and try again." };

  try {
    await requirePermission("repairs.write");
  } catch (error) {
    if (error instanceof AuthorizationError) return { success: false, error: "You don't have permission to issue repair quotations." };
    throw error;
  }

  const d = parsed.data;
  if (d.discountAmount > 0 && d.discountReason.length < 3) {
    return { success: false, error: "A reason is required for every discount." };
  }

  let pricing;
  try {
    pricing = calculateDocumentPricing({
      lines: d.lines,
      discountAmount: d.discountAmount,
      vatRate: 17.5,
      ppdaRate: 1,
    });
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Invalid quotation values." };
  }

  const supabase = createClient();
  const { data: ticket, error: ticketError } = await (supabase.from("repair_tickets") as any)
    .select("id,ticket_number,customer_id,guest_name,guest_phone,guest_email,device_type,brand,model,status,customers ( profiles ( full_name ) )")
    .eq("id", d.ticketId)
    .maybeSingle();
  if (ticketError || !ticket) return { success: false, error: "Repair ticket not found." };
  if (["completed", "cancelled"].includes(ticket.status)) {
    return { success: false, error: "A quotation cannot be issued for a completed or cancelled repair." };
  }

  const { data: document, error: documentError } = await ((supabase.from("business_documents") as any) as any)
    .insert({
      document_type: "quotation",
      source_type: "repair",
      source_id: ticket.id,
      customer_id: ticket.customer_id,
      customer_name: ticket.guest_name || ticket.customers?.profiles?.full_name || "Customer",
      customer_email: ticket.guest_email,
      customer_phone: ticket.guest_phone,
      status: "draft",
      subtotal: pricing.subtotal,
      discount_amount: pricing.discountAmount,
      discount_reason: d.discountAmount > 0 ? d.discountReason : null,
      taxable_amount: pricing.taxableAmount,
      vat_rate: pricing.vatRate,
      vat_amount: pricing.vatAmount,
      ppda_rate: pricing.ppdaRate,
      ppda_amount: pricing.ppdaAmount,
      grand_total: pricing.grandTotal,
      notes: d.notes || null,
      valid_until: d.validUntil || null,
    })
    .select("id,document_number")
    .single();

  if (documentError || !document) {
    console.error("createRepairQuotation document insert failed:", documentError?.message);
    return { success: false, error: "Could not create the quotation. Check the document migration is installed." };
  }

  const items = d.lines.map((line, index) => ({
    document_id: document.id,
    description: line.description,
    quantity: line.quantity,
    unit_price: line.unitPrice,
    line_total: Math.round(line.quantity * line.unitPrice * 100) / 100,
    sort_order: index,
  }));
  const { error: itemError } = await ((supabase.from("business_document_items") as any) as any).insert(items);
  if (itemError) {
    console.error("createRepairQuotation item insert failed:", itemError.message);
    return { success: false, error: "The quotation was saved as a draft, but its line items could not be saved. Contact an administrator before retrying." };
  }

  const { error: issueError } = await (supabase.from("business_documents") as any)
    .update({ status: "issued", issued_at: new Date().toISOString() })
    .eq("id", document.id)
    .eq("status", "draft");
  if (issueError) {
    return { success: false, error: "The quotation was saved as a draft but could not be issued." };
  }

  await (supabase.from("repair_tickets") as any)
    .update({ quote_amount: pricing.grandTotal })
    .eq("id", ticket.id);

  return { success: true, documentId: document.id, documentNumber: Number(document.document_number) };
}
