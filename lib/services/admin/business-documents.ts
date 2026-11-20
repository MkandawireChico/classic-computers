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


const convertSchema = z.object({ quotationId: z.string().uuid() });

export async function convertAcceptedQuotationToInvoice(input: unknown): Promise<ServiceResult & { invoiceId?: string; invoiceNumber?: number }> {
  const parsed = convertSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid quotation reference." };

  const supabase = createClient();
  const { data: quotation, error: quoteError } = await (supabase.from("business_documents") as any)
    .select("*")
    .eq("id", parsed.data.quotationId)
    .maybeSingle();
  if (quoteError || !quotation) return { success: false, error: "Quotation not found." };
  if (quotation.document_type !== "quotation" || quotation.status !== "accepted") {
    return { success: false, error: "Only customer-accepted quotations can become invoices." };
  }

  const permission = quotation.source_type === "order" ? "orders.write"
    : quotation.source_type === "rental" ? "rentals.write" : "repairs.write";
  try {
    await requirePermission(permission);
  } catch (error) {
    if (error instanceof AuthorizationError) return { success: false, error: "You don't have permission to invoice this quotation." };
    throw error;
  }

  const { data: existing } = await (supabase.from("business_documents") as any)
    .select("id,document_number")
    .eq("origin_document_id", quotation.id)
    .eq("document_type", "invoice")
    .maybeSingle();
  if (existing) return { success: true, invoiceId: existing.id, invoiceNumber: Number(existing.document_number) };

  const { data: quoteItems, error: itemsError } = await (supabase.from("business_document_items") as any)
    .select("description,quantity,unit_price,line_total,product_id,variant_id,sort_order")
    .eq("document_id", quotation.id)
    .order("sort_order", { ascending: true });
  if (itemsError || !quoteItems?.length) return { success: false, error: "The quotation has no saved line items." };

  const { data: invoice, error: invoiceError } = await (supabase.from("business_documents") as any)
    .insert({
      document_type: "invoice",
      source_type: quotation.source_type,
      source_id: quotation.source_id,
      origin_document_id: quotation.id,
      customer_id: quotation.customer_id,
      customer_name: quotation.customer_name,
      customer_email: quotation.customer_email,
      customer_phone: quotation.customer_phone,
      billing_address: quotation.billing_address,
      currency: quotation.currency,
      status: "draft",
      subtotal: quotation.subtotal,
      discount_amount: quotation.discount_amount,
      discount_reason: quotation.discount_reason,
      taxable_amount: quotation.taxable_amount,
      vat_rate: quotation.vat_rate,
      vat_amount: quotation.vat_amount,
      ppda_rate: quotation.ppda_rate,
      ppda_amount: quotation.ppda_amount,
      grand_total: quotation.grand_total,
      notes: quotation.notes,
      terms: quotation.terms,
    })
    .select("id,document_number")
    .single();
  if (invoiceError || !invoice) {
    console.error("convertAcceptedQuotationToInvoice failed:", invoiceError?.message);
    return { success: false, error: "Could not create the invoice. Check the document migration is installed." };
  }

  const invoiceItems = quoteItems.map((item: any) => ({
    document_id: invoice.id,
    description: item.description,
    quantity: item.quantity,
    unit_price: item.unit_price,
    line_total: item.line_total,
    product_id: item.product_id,
    variant_id: item.variant_id,
    sort_order: item.sort_order,
  }));
  const { error: insertItemsError } = await (supabase.from("business_document_items") as any).insert(invoiceItems);
  if (insertItemsError) {
    console.error("Invoice item copy failed:", insertItemsError.message);
    return { success: false, error: "The invoice draft exists but its line items were not copied. Contact an administrator before retrying." };
  }

  const { error: issueError } = await (supabase.from("business_documents") as any)
    .update({ status: "issued", issued_at: new Date().toISOString() })
    .eq("id", invoice.id)
    .eq("status", "draft");
  if (issueError) return { success: false, error: "The invoice draft exists but could not be issued." };

  return { success: true, invoiceId: invoice.id, invoiceNumber: Number(invoice.document_number) };
}


const transactionSchema = z.object({
  documentId: z.string().uuid(),
  transactionType: z.enum(["payment", "refund"]),
  amount: z.coerce.number().positive().max(999999999),
  provider: z.string().trim().min(2).max(80),
  providerReference: z.string().trim().min(3).max(120),
  providerChecked: z.literal(true),
  notes: z.string().trim().max(500).optional().default(""),
});

export async function recordBusinessDocumentTransaction(input: unknown): Promise<ServiceResult> {
  const parsed = transactionSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Check the payment details and try again." };

  const supabase = createClient();
  const { data: document, error: documentError } = await (supabase.from("business_documents") as any)
    .select("id,document_type,source_type")
    .eq("id", parsed.data.documentId)
    .maybeSingle();
  if (documentError || !document || document.document_type !== "invoice") {
    return { success: false, error: "Invoice not found." };
  }

  const permission = document.source_type === "order" ? "orders.write"
    : document.source_type === "rental" ? "rentals.write" : "repairs.write";
  try {
    await requirePermission(permission);
  } catch (error) {
    if (error instanceof AuthorizationError) return { success: false, error: "You don't have permission to record transactions for this invoice." };
    throw error;
  }

  const { error } = await (supabase.from("business_document_transactions") as any).insert({
    document_id: parsed.data.documentId,
    transaction_type: parsed.data.transactionType,
    amount: parsed.data.amount,
    currency: "MWK",
    provider: parsed.data.provider,
    provider_reference: parsed.data.providerReference,
    provider_checked: parsed.data.providerChecked,
    notes: parsed.data.notes || null,
  });
  if (error) {
    console.error("recordBusinessDocumentTransaction failed:", error.message);
    return { success: false, error: error.message.includes("outstanding") || error.message.includes("Refund") || error.message.includes("blocked")
      ? error.message
      : "The transaction was not recorded. Check the reference and confirm the provider account." };
  }
  return { success: true };
}
