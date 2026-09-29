import "server-only";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requirePermission, AuthorizationError } from "@/lib/auth/permissions";

export type ServiceResult = { success: true } | { success: false; error: string };

async function guard(): Promise<ServiceResult | null> {
  try {
    await requirePermission("customers.write");
    return null;
  } catch (e) {
    if (e instanceof AuthorizationError) return { success: false, error: "You don't have permission to manage enquiries." };
    throw e;
  }
}

const generalStatusSchema = z.object({ id: z.string().uuid(), status: z.enum(["new", "read", "responded", "closed"]) });
const corporateStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["new", "contacted", "quoted", "negotiating", "approved", "completed", "cancelled"]),
});
const notesSchema = z.object({ id: z.string().uuid(), notes: z.string().max(1000) });

export async function updateGeneralEnquiryStatus(input: unknown): Promise<ServiceResult> {
  const guardResult = await guard();
  if (guardResult) return guardResult;
  const parsed = generalStatusSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid status." };
  const supabase = createClient();
  const { error } = await (supabase.from("enquiries") as any).update({ status: parsed.data.status }).eq("id", parsed.data.id);
  if (error) return { success: false, error: "Could not update status." };
  return { success: true };
}

export async function updateGeneralEnquiryNotes(input: unknown): Promise<ServiceResult> {
  const guardResult = await guard();
  if (guardResult) return guardResult;
  const parsed = notesSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid notes." };
  const supabase = createClient();
  const { error } = await (supabase.from("enquiries") as any).update({ internal_notes: parsed.data.notes }).eq("id", parsed.data.id);
  if (error) return { success: false, error: "Could not update notes." };
  return { success: true };
}

export async function updateCorporateEnquiryStatus(input: unknown): Promise<ServiceResult> {
  const guardResult = await guard();
  if (guardResult) return guardResult;
  const parsed = corporateStatusSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid status." };
  const supabase = createClient();
  const { error } = await (supabase.from("corporate_enquiries") as any).update({ status: parsed.data.status }).eq("id", parsed.data.id);
  if (error) return { success: false, error: "Could not update status." };
  return { success: true };
}

export async function updateCorporateEnquiryNotes(input: unknown): Promise<ServiceResult> {
  const guardResult = await guard();
  if (guardResult) return guardResult;
  const parsed = notesSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid notes." };
  const supabase = createClient();
  const { error } = await (supabase.from("corporate_enquiries") as any).update({ internal_notes: parsed.data.notes }).eq("id", parsed.data.id);
  if (error) return { success: false, error: "Could not update notes." };
  return { success: true };
}
