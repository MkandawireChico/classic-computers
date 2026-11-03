import "server-only";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server-admin";
import { repairBookingSchema } from "@/schemas/repair";
import { deliverAdminEmailForRequest, findNotificationRequestId } from "@/lib/services/admin-email-outbox";

export type RepairBookingResult =
  | { success: true; ticketNumber: string; trackingToken: string; requestId: string }
  | { success: false; error: string };
const submissionKeySchema = z.string().uuid();

export async function submitRepairBooking(input: unknown, submissionKey: string): Promise<RepairBookingResult> {
  const parsed = repairBookingSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }
  const parsedKey = submissionKeySchema.safeParse(submissionKey);
  if (!parsedKey.success) return { success: false, error: "Please refresh the form and try again." };
  const d = parsed.data;

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && (!d.guestName || !d.guestPhone)) {
    return { success: false, error: "Name and phone are required." };
  }

  const writer = user ? supabase : createAdminClient();
  const { data, error } = await (writer.from("repair_tickets") as any)
    .insert({
      customer_id: user?.id ?? null,
      submission_key: parsedKey.data,
      guest_name: user ? null : d.guestName,
      guest_phone: user ? null : d.guestPhone,
      guest_email: user ? null : d.guestEmail || null,
      device_type: d.deviceType,
      brand: d.brand || null,
      model: d.model || null,
      serial_number: d.serialNumber || null,
      problem_description: d.problemDescription,
      accessories_received: d.accessoriesReceived || null,
    })
    .select("id, ticket_number, tracking_token")
    .single();

  if (error) {
    if (error.code === "23505") {
      const requestId = await findNotificationRequestId("repair_ticket", parsedKey.data);
      if (requestId) {
        const admin = createAdminClient();
        const { data: existing } = await (admin.from("repair_tickets") as any)
          .select("id, ticket_number, tracking_token")
          .eq("id", requestId)
          .maybeSingle();
        if (existing) {
          await deliverAdminEmailForRequest("repair_ticket", requestId);
          return { success: true, requestId, ticketNumber: existing.ticket_number, trackingToken: existing.tracking_token };
        }
      }
    }
    console.error("submitRepairBooking failed:", error.message);
    return { success: false, error: "Could not submit your repair booking. Please try again." };
  }

  await deliverAdminEmailForRequest("repair_ticket", data.id);
  return { success: true, requestId: data.id, ticketNumber: data.ticket_number, trackingToken: data.tracking_token };
}
