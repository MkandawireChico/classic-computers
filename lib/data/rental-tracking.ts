import "server-only";
import { createAdminClient } from "@/lib/supabase/server-admin";
import { createClient } from "@/lib/supabase/server";
import { rentalTrackingSchema } from "@/schemas/rental";

export interface TrackedRental {
  status: string;
  startDate: string;
  endDate: string;
  quantity: number;
  totalCharge: number | null;
  notes: string | null;
  productName: string | null;
}

/**
 * Same pattern as guest repair tracking: rental_bookings has no anon
 * SELECT policy at all (by design — an anonymous session has no stable
 * identity for RLS to key off), so this uses the privileged client and
 * the tracking_token match IS the access check, not a formality on top
 * of one.
 */
export async function trackRentalAsGuest(input: unknown): Promise<TrackedRental | { error: string }> {
  const parsed = rentalTrackingSchema.safeParse(input);
  if (!parsed.success) return { error: "Enter your tracking code." };

  const admin = createAdminClient();
  const { data: booking, error } = await (admin.from("rental_bookings") as any)
    .select(`
      status, start_date, end_date, quantity, total_charge, notes,
      rental_products ( products ( name ) )
    `)
    .eq("tracking_token", parsed.data.trackingToken.trim())
    .maybeSingle();

  if (error || !booking) return { error: "No matching rental found. Check your tracking code." };

  return {
    status: booking.status,
    startDate: booking.start_date,
    endDate: booking.end_date,
    quantity: booking.quantity,
    totalCharge: booking.total_charge ? Number(booking.total_charge) : null,
    notes: booking.notes,
    productName: booking.rental_products?.products?.name ?? null,
  };
}

export interface RentableProduct {
  rentalProductId: string;
  productId: string;
  productName: string;
  productSlug: string;
  dailyRate: number | null;
  weeklyRate: number | null;
  monthlyRate: number | null;
  depositAmount: number | null;
  imagePath: string | null;
}

/** Public listing — real rentable products only, never hard-coded. RLS
 * (0022) already restricts this to is_available = true for anon/
 * authenticated readers; the .eq() here is defense in depth. */
export async function getRentableProducts(): Promise<RentableProduct[]> {
  const supabase = createClient();
  const { data, error } = await (supabase.from("rental_products") as any)
    .select(`
      id, daily_rate, weekly_rate, monthly_rate, deposit_amount,
      products ( id, name, slug, product_images ( storage_path, is_primary, variant_id ) )
    `)
    .eq("is_available", true);

  if (error || !data) {
    if (error) console.error("getRentableProducts failed:", error.message);
    return [];
  }

  return (data as any[])
    .filter((row) => row.products)
    .map((row) => {
      const images = (row.products.product_images ?? []).filter((i: any) => i.variant_id === null);
      const primary = images.find((i: any) => i.is_primary) ?? images[0] ?? null;
      return {
        rentalProductId: row.id,
        productId: row.products.id,
        productName: row.products.name,
        productSlug: row.products.slug,
        dailyRate: row.daily_rate ? Number(row.daily_rate) : null,
        weeklyRate: row.weekly_rate ? Number(row.weekly_rate) : null,
        monthlyRate: row.monthly_rate ? Number(row.monthly_rate) : null,
        depositAmount: row.deposit_amount ? Number(row.deposit_amount) : null,
        imagePath: primary?.storage_path ?? null,
      };
    });
}
