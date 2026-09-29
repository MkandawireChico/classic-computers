import "server-only";
import { createClient } from "@/lib/supabase/server";
import { generalEnquirySchema, corporateEnquirySchema } from "@/schemas/enquiry";

export type EnquiryResult = { success: true } | { success: false; error: string };

export async function submitGeneralEnquiry(input: unknown): Promise<EnquiryResult> {
  const parsed = generalEnquirySchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Please check the form." };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await (supabase.from("enquiries") as any).insert({
    customer_id: user?.id ?? null,
    name: parsed.data.name,
    phone: parsed.data.phone || null,
    email: parsed.data.email || null,
    topic: parsed.data.topic,
    message: parsed.data.message,
  });
  if (error) return { success: false, error: "Could not submit your enquiry. Please try again." };
  return { success: true };
}

export async function submitCorporateEnquiry(input: unknown): Promise<EnquiryResult> {
  const parsed = corporateEnquirySchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Please check the form." };
  const d = parsed.data;

  const supabase = createClient();
  const { error } = await (supabase.from("corporate_enquiries") as any).insert({
    organisation_name: d.organisationName,
    contact_person: d.contactPerson,
    phone: d.phone,
    email: d.email,
    products_required: d.productsRequired || null,
    quantity: d.quantity || null,
    budget: d.budget || null,
    delivery_location: d.deliveryLocation || null,
    additional_requirements: d.additionalRequirements || null,
  });
  if (error) return { success: false, error: "Could not submit your enquiry. Please try again." };
  return { success: true };
}
