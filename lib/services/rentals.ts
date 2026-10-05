import "server-only";
import { createClient } from "@/lib/supabase/server";
import { rentalBookingSchema } from "@/schemas/rental";

export type RentalBookingResult =
  | { success: true; trackingToken: string }
  | { success: false; error: string };

/**
 * Calls the narrowly scoped database function that subtracts overlapping
 * pending bookings from current on-hand stock. Active rentals are already
 * removed from on-hand inventory by the rental checkout movement.
 */
async function getAvailableQuantity(
  rentalProductId: string,
  startDate: string,
  endDate: string,
): Promise<number> {
  const supabase = createClient();
  const { data, error } = await (supabase.rpc as any)("get_rental_available_quantity", {
    p_rental_product_id: rentalProductId,
    p_start_date: startDate,
    p_end_date: endDate,
  });
  if (error) {
    console.error("getAvailableQuantity failed:", error.message);
    return 0;
  }
  return Math.max(0, Number(data ?? 0));
}

export async function checkRentalAvailability(
  rentalProductId: string,
  startDate: string,
  endDate: string,
): Promise<number> {
  return getAvailableQuantity(rentalProductId, startDate, endDate);
}

export async function submitRentalBooking(input: unknown): Promise<RentalBookingResult> {
  const parsed = rentalBookingSchema.safeParse(input);
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

  const { data: rentalProduct } = await (supabase.from("rental_products") as any)
    .select("id, is_available")
    .eq("id", d.rentalProductId)
    .maybeSingle();
  if (!rentalProduct || !rentalProduct.is_available) {
    return { success: false, error: "This item is not currently available for rental." };
  }

  // Re-checked here server-side — never trust a client-side availability
  // display alone (the brief's explicit requirement).
  const available = await getAvailableQuantity(d.rentalProductId, d.startDate, d.endDate);
  if (available < d.quantity) {
    return { success: false, error: `Only ${available} unit(s) available for those dates.` };
  }

  const { data, error } = await (supabase.from("rental_bookings") as any)
    .insert({
      rental_product_id: d.rentalProductId,
      customer_id: user?.id ?? null,
      guest_name: user ? null : d.guestName,
      guest_phone: user ? null : d.guestPhone,
      guest_email: user ? null : d.guestEmail || null,
      start_date: d.startDate,
      end_date: d.endDate,
      quantity: d.quantity,
      notes: d.notes || null,
    })
    .select("tracking_token")
    .single();

  if (error) {
    console.error("submitRentalBooking failed:", error.message);
    return { success: false, error: "Could not submit your rental request. Please try again." };
  }

  return { success: true, trackingToken: data.tracking_token };
}
