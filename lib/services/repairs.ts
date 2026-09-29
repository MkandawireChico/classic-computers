import "server-only";
import { createClient } from "@/lib/supabase/server";
import { repairBookingSchema } from "@/schemas/repair";

export type RepairBookingResult =
  | { success: true; ticketNumber: string; trackingToken: string }
  | { success: false; error: string };

export async function submitRepairBooking(input: unknown): Promise<RepairBookingResult> {
  const parsed = repairBookingSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }
  const d = parsed.data;

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && (!d.guestName || !d.guestPhone)) {
    return { success: false, error: "Name and phone are required." };
  }

  const { data, error } = await (supabase.from("repair_tickets") as any)
    .insert({
      customer_id: user?.id ?? null,
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
    .select("ticket_number, tracking_token")
    .single();

  if (error) {
    console.error("submitRepairBooking failed:", error.message);
    return { success: false, error: "Could not submit your repair booking. Please try again." };
  }

  return { success: true, ticketNumber: data.ticket_number, trackingToken: data.tracking_token };
}
