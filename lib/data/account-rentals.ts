import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getPublicStorageUrl } from "@/lib/storage";

export interface MyRentalListItem {
  id: string;
  status: string;
  start_date: string;
  end_date: string;
  quantity: number;
  created_at: string;
  product_name: string | null;
}

export async function getMyRentals(): Promise<MyRentalListItem[]> {
  const supabase = createClient();
  const { data, error } = await (supabase.from("rental_bookings") as any)
    .select("id, status, start_date, end_date, quantity, created_at, rental_products ( products ( name ) )")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("getMyRentals failed:", error.message);
    throw new Error("Could not load your rental bookings. Please refresh the page and try again.");
  }
  return (data ?? []).map((row: any) => ({
    id: row.id,
    status: row.status,
    start_date: row.start_date,
    end_date: row.end_date,
    quantity: row.quantity,
    created_at: row.created_at,
    product_name: row.rental_products?.products?.name ?? null,
  }));
}

export interface MyRentalDetail extends MyRentalListItem {
  total_charge: number | null;
  notes: string | null;
  daily_rate: number | null;
  deposit_amount: number | null;
  statusHistory: Array<{ from_status: string | null; to_status: string; created_at: string }>;
  image_url: string | null;
}

export async function getMyRentalById(id: string): Promise<MyRentalDetail | null> {
  const supabase = createClient();

  const { data: booking, error } = await (supabase.from("rental_bookings") as any)
    .select(`
      id, status, start_date, end_date, quantity, total_charge, notes, created_at,
      rental_products ( daily_rate, deposit_amount, products ( name, product_images(storage_path, alt_text, is_primary, display_order, variant_id) ) )
    `)
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error("getMyRentalById failed:", error.message);
    throw new Error("Could not load this rental. Please refresh the page and try again.");
  }
  if (!booking) return null;

  const { data: history, error: historyError } = await (supabase.from("rental_status_history") as any)
    .select("from_status, to_status, created_at")
    .eq("booking_id", id)
    .order("created_at", { ascending: true });
  if (historyError) {
    console.error("getMyRentalById history failed:", historyError.message);
    throw new Error("Could not load the rental status history. Please refresh the page and try again.");
  }

  const productImages = booking.rental_products?.products?.product_images ?? [];
  const primaryImage = productImages.find((image: any) => image.is_primary && image.variant_id === null)
    ?? productImages.find((image: any) => image.variant_id === null)
    ?? productImages.find((image: any) => image.is_primary)
    ?? productImages[0];

  return {
    id: booking.id,
    status: booking.status,
    start_date: booking.start_date,
    end_date: booking.end_date,
    quantity: booking.quantity,
    created_at: booking.created_at,
    total_charge: booking.total_charge ? Number(booking.total_charge) : null,
    notes: booking.notes,
    daily_rate: booking.rental_products?.daily_rate ? Number(booking.rental_products.daily_rate) : null,
    deposit_amount: booking.rental_products?.deposit_amount ? Number(booking.rental_products.deposit_amount) : null,
    product_name: booking.rental_products?.products?.name ?? null,
    image_url: primaryImage ? getPublicStorageUrl("product-images", primaryImage.storage_path) : null,
    statusHistory: history ?? [],
  };
}
