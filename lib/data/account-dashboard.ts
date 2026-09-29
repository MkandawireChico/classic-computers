import "server-only";
import { getCurrentUser } from "@/lib/auth/current-user";
import { createClient } from "@/lib/supabase/server";

export interface AccountDashboardSummary {
  recentOrders: Array<{ id: string; order_number: string; order_status: string; total: number }>;
  activeRepairs: Array<{ id: string; ticket_number: string; status: string }>;
  activeRentals: Array<{ id: string; status: string; product_name: string | null }>;
  studentStatus: string | null;
  recentEnquiries: Array<{ id: string; topic: string; status: string }>;
  referralCode: string | null;
  unreadNotificationCount: number;
}

const REPAIR_ACTIVE_STATUSES = ["checked_in", "diagnosing", "quoted", "awaiting_approval", "in_progress", "ready_for_pickup"];
const RENTAL_ACTIVE_STATUSES = ["requested", "approved", "ready", "active", "overdue"];

/**
 * Every query here is RLS-scoped to the current user (no anon path, no
 * cross-user filter needed) — this function exists only to keep the
 * dashboard page itself from turning into a wall of individual queries.
 * Deliberately small limits (3-5 rows) per section — this is a summary,
 * not an analytics page.
 */
export async function getAccountDashboardSummary(): Promise<AccountDashboardSummary> {
  const supabase = createClient();
  const user = await getCurrentUser();
  if (!user) {
    return {
      recentOrders: [],
      activeRepairs: [],
      activeRentals: [],
      studentStatus: null,
      recentEnquiries: [],
      referralCode: null,
      unreadNotificationCount: 0,
    };
  }

  const [orders, repairs, rentals, customer, enquiries, notifications] = await Promise.all([
    (supabase.from("orders") as any).select("id, order_number, order_status, total").order("created_at", { ascending: false }).limit(3),
    (supabase.from("repair_tickets") as any).select("id, ticket_number, status").in("status", REPAIR_ACTIVE_STATUSES).order("created_at", { ascending: false }).limit(5),
    (supabase.from("rental_bookings") as any)
      .select("id, status, rental_products ( products ( name ) )")
      .in("status", RENTAL_ACTIVE_STATUSES)
      .order("created_at", { ascending: false })
      .limit(5),
    (supabase.from("customers") as any).select("student_status, referral_code").eq("id", user.id).maybeSingle(),
    (supabase.from("enquiries") as any).select("id, topic, status").order("created_at", { ascending: false }).limit(3),
    (supabase.from("notifications") as any).select("id").eq("recipient_user_id", user.id).eq("is_read", false),
  ]);

  return {
    recentOrders: (orders.data ?? []).map((o: any) => ({ ...o, total: Number(o.total) })),
    activeRepairs: repairs.data ?? [],
    activeRentals: (rentals.data ?? []).map((r: any) => ({ id: r.id, status: r.status, product_name: r.rental_products?.products?.name ?? null })),
    studentStatus: customer.data?.student_status ?? null,
    recentEnquiries: enquiries.data ?? [],
    referralCode: customer.data?.referral_code ?? null,
    unreadNotificationCount: notifications.data?.length ?? 0,
  };
}
