import "server-only";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { generalEnquirySchema, corporateEnquirySchema } from "@/schemas/enquiry";
import {
  deliverAdminEmailForRequest,
  findNotificationRequestId,
} from "@/lib/services/admin-email-outbox";

export type EnquiryResult = { success: true } | { success: false; error: string };
const submissionKeySchema = z.string().uuid();

export async function submitGeneralEnquiry(
  input: unknown,
  submissionKey: string,
): Promise<EnquiryResult> {
  const parsed = generalEnquirySchema.safeParse(input);
  if (!parsed.success)
    return { success: false, error: parsed.error.issues[0]?.message ?? "Please check the form." };
  const parsedKey = submissionKeySchema.safeParse(submissionKey);
  if (!parsedKey.success)
    return { success: false, error: "Please refresh the form and try again." };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await (supabase.from("enquiries") as any).insert({
    customer_id: user?.id ?? null,
    submission_key: parsedKey.data,
    name: parsed.data.name,
    phone: parsed.data.phone || null,
    email: parsed.data.email || null,
    topic: parsed.data.topic,
    message: parsed.data.message,
  });
  if (error) {
    console.error("General enquiry insert error:", error);
    if (error.code === "23505") {
      const requestId = await findNotificationRequestId("general_enquiry", parsedKey.data);
      if (requestId) {
        await deliverAdminEmailForRequest("general_enquiry", requestId);
        return { success: true };
      }
    }
    return {
      success: false,
      error: "We couldn't submit your enquiry. Please try again or contact us directly.",
    };
  }
  const requestId = await findNotificationRequestId("general_enquiry", parsedKey.data);
  if (requestId) await deliverAdminEmailForRequest("general_enquiry", requestId);
  return { success: true };
}

export async function submitCorporateEnquiry(
  input: unknown,
  submissionKey: string,
): Promise<EnquiryResult> {
  const parsed = corporateEnquirySchema.safeParse(input);
  if (!parsed.success)
    return { success: false, error: parsed.error.issues[0]?.message ?? "Please check the form." };
  const parsedKey = submissionKeySchema.safeParse(submissionKey);
  if (!parsedKey.success)
    return { success: false, error: "Please refresh the form and try again." };
  const d = parsed.data;

  const supabase = createClient();
  const { error } = await (supabase.from("corporate_enquiries") as any).insert({
    submission_key: parsedKey.data,
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
  if (error) {
    console.error("Corporate enquiry insert error:", error);
    if (error.code === "23505") {
      const requestId = await findNotificationRequestId("corporate_enquiry", parsedKey.data);
      if (requestId) {
        await deliverAdminEmailForRequest("corporate_enquiry", requestId);
        return { success: true };
      }
    }
    return { success: false, error: `Could not submit your enquiry: ${error.message}` };
  }
  const requestId = await findNotificationRequestId("corporate_enquiry", parsedKey.data);
  if (requestId) await deliverAdminEmailForRequest("corporate_enquiry", requestId);
  return { success: true };
}
