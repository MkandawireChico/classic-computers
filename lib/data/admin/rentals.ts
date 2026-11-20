import "server-only";
import { createClient } from "@/lib/supabase/server";

export interface AdminRentalListItem {
  id: string;
  status: string;
  start_date: string;
  end_date: string;
  quantity: number;
  created_at: string;
  customer_name: string | null;
  guest_name: string | null;
  product_name: string | null;
}

export interface RentalFilters {
  status?: string;
  page?: number;
  pageSize?: number;
}

export async function listAdminRentals(filters: RentalFilters) {
  const supabase = createClient();
  const page = filters.page && filters.page > 0 ? filters.page : 1;
  const pageSize = filters.pageSize && filters.pageSize > 0 ? filters.pageSize : 25;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = (supabase.from("rental_bookings") as any)
    .select(
      `
      id, status, start_date, end_date, quantity, created_at, guest_name,
      customers ( profiles ( full_name ) ),
      rental_products ( products ( name ) )
    `,
      { count: "exact" },
    )
    .order("created_at", { ascending: false });

  if (filters.status) query = query.eq("status", filters.status);

  const { data, error, count } = await query.range(from, to);
  if (error) {
    console.error("listAdminRentals failed:", error.message);
    return { items: [] as AdminRentalListItem[], total: 0, page, pageSize };
  }

  const items: AdminRentalListItem[] = (data ?? []).map((row: any) => ({
    id: row.id,
    status: row.status,
    start_date: row.start_date,
    end_date: row.end_date,
    quantity: row.quantity,
    created_at: row.created_at,
    customer_name: row.customers?.profiles?.full_name ?? null,
    guest_name: row.guest_name,
    product_name: row.rental_products?.products?.name ?? null,
  }));

  return { items, total: count ?? items.length, page, pageSize };
}

export interface AdminRentalDetail extends AdminRentalListItem {
  rental_product_id: string;
  product_id: string | null;
  total_charge: number | null;
  notes: string | null;
  internal_notes: string | null;
  guest_phone: string | null;
  guest_email: string | null;
  customer_id: string | null;
  statusHistory: Array<{ from_status: string | null; to_status: string; created_at: string; changed_by_name: string | null; note: string | null }>;
  paymentTransactions: Array<{ id: string; transaction_type: string; provider: string; amount: number; provider_reference: string | null; created_at: string }>;
  conditionReports: Array<{ id: string; event_type: string; condition: string; notes: string; created_at: string; recorded_by_name: string | null }>;
}

export async function getAdminRentalById(id: string): Promise<AdminRentalDetail | null> {
  const supabase = createClient();

  const { data: booking, error } = await (supabase.from("rental_bookings") as any)
    .select(`
      id, status, start_date, end_date, quantity, created_at, total_charge, notes, internal_notes,
      guest_name, guest_phone, guest_email, customer_id, rental_product_id,
      customers ( profiles ( full_name ) ),
      rental_products ( product_id, products ( name ) )
    `)
    .eq("id", id)
    .maybeSingle();
  if (error || !booking) return null;

  const { data: history } = await (supabase.from("rental_status_history") as any)
    .select("from_status, to_status, created_at, changed_by, note")
    .eq("booking_id", id)
    .order("created_at", { ascending: true });

  const [paymentResult, conditionResult] = await Promise.all([
    (supabase.from("rental_payment_transactions") as any)
      .select("id, transaction_type, provider, amount, provider_reference, created_at")
      .eq("booking_id", id)
      .order("created_at", { ascending: true }),
    (supabase.from("rental_condition_reports") as any)
      .select("id, event_type, condition, notes, created_at, recorded_by")
      .eq("booking_id", id)
      .order("created_at", { ascending: true }),
  ]);
  if (paymentResult.error || conditionResult.error) {
    console.error("getAdminRentalById ledgers failed:", paymentResult.error?.message, conditionResult.error?.message);
    throw new Error("Could not load rental payment and condition records. Apply the rental ledger migration before using this screen.");
  }
  const historyRows = history ?? [];
  const actorIds = Array.from(new Set(historyRows.map((entry: any) => entry.changed_by).filter(Boolean)));
  const { data: profiles } = actorIds.length
    ? await (supabase.from("profiles") as any).select("id, full_name").in("id", actorIds)
    : { data: [] };
  const reportActorIds = Array.from(new Set((conditionResult.data ?? []).map((entry: any) => entry.recorded_by).filter(Boolean)));
  const { data: reportProfiles } = reportActorIds.length
    ? await (supabase.from("profiles") as any).select("id, full_name").in("id", reportActorIds)
    : { data: [] };
  const reportActorNames = new Map((reportProfiles ?? []).map((profile: any) => [profile.id, profile.full_name]));
  const actorNames = new Map((profiles ?? []).map((profile: any) => [profile.id, profile.full_name]));

  return {
    id: booking.id,
    status: booking.status,
    start_date: booking.start_date,
    end_date: booking.end_date,
    quantity: booking.quantity,
    created_at: booking.created_at,
    total_charge: booking.total_charge ? Number(booking.total_charge) : null,
    notes: booking.notes,
    internal_notes: booking.internal_notes,
    guest_name: booking.guest_name,
    guest_phone: booking.guest_phone,
    guest_email: booking.guest_email,
    customer_id: booking.customer_id,
    customer_name: booking.customers?.profiles?.full_name ?? null,
    product_name: booking.rental_products?.products?.name ?? null,
    rental_product_id: booking.rental_product_id,
    product_id: booking.rental_products?.product_id ?? null,
    statusHistory: historyRows.map((entry: any) => ({
      from_status: entry.from_status,
      to_status: entry.to_status,
      created_at: entry.created_at,
      changed_by_name: entry.changed_by ? actorNames.get(entry.changed_by) ?? null : null,
      note: entry.note ?? null,
    })),
    paymentTransactions: (paymentResult.data ?? []).map((entry: any) => ({ ...entry, amount: Number(entry.amount) })),
    conditionReports: (conditionResult.data ?? []).map((entry: any) => ({
      ...entry,
      recorded_by_name: entry.recorded_by ? reportActorNames.get(entry.recorded_by) ?? "Staff member" : "System",
    })),
  };
}
