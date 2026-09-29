import "server-only";
import { createClient } from "@/lib/supabase/server";
import { rentalBookingSchema } from "@/schemas/rental";

export type RentalBookingResult =
  | { success: true; trackingToken: string }
  | { success: false; error: string };

/**
 * Sums the quantity of every booking for this rental product that is
 * still "in play" (requested/approved/ready/active — i.e. not yet
 * returned/cancelled/damaged/lost) and whose date range overlaps the
 * requested one, then compares against the underlying product's
 * inventory. This is a check-then-insert, not a locking transaction like
 * create_order() — reasonable for a staff-mediated, low-frequency flow,
 * but NOT the same atomicity guarantee against a genuine race between two
 * simultaneous bookings. Documented as a known limitation in the Phase 6
 * report rather than silently presented as equivalent to checkout's
 * locking behavior.
 */
async function getAvailableQuantity(
  rentalProductId: string,
  startDate: string,
  endDate: string,
  excludeBookingId?: string,
): Promise<number> {
  const supabase = createClient();

  const { data: rentalProduct } = await (supabase.from("rental_products") as any)
    .select("product_id")
    .eq("id", rentalProductId)
    .maybeSingle();
  if (!rentalProduct) return 0;

  const { data: inventory } = await (supabase.from("inventory") as any)
    .select("quantity_on_hand")
    .eq("product_id", rentalProduct.product_id)
    .is("variant_id", null)
    .maybeSingle();
  const totalStock = inventory?.quantity_on_hand ?? 0;

  let overlapQuery = (supabase.from("rental_bookings") as any)
    .select("quantity")
    .eq("rental_product_id", rentalProductId)
    .in("status", ["requested", "approved", "ready", "active"])
    .lte("start_date", endDate)
    .gte("end_date", startDate);
  if (excludeBookingId) overlapQuery = overlapQuery.neq("id", excludeBookingId);

  const { data: overlapping } = await overlapQuery;
  const reserved = (overlapping ?? []).reduce((sum: number, b: any) => sum + b.quantity, 0);

  return Math.max(0, totalStock - reserved);
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
