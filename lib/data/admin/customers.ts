import "server-only";
import { requirePermission } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server-admin";

export type CustomerActivityFilter =
  | "all"
  | "purchases"
  | "active_orders"
  | "rentals"
  | "repairs"
  | "enquiries_no_purchases";

export interface AdminCustomerListItem {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  student_status: string;
  created_at: string;
  account_status: "active" | "unconfirmed" | "suspended";
  order_count: number;
  completed_order_count: number;
  active_order_count: number;
  rental_count: number;
  repair_count: number;
  enquiry_count: number;
  completed_purchase_value: number;
  last_activity: string | null;
}

export interface AdminCustomerListResult {
  items: AdminCustomerListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export async function listAdminCustomers({
  query,
  page = 1,
  pageSize = 25,
  registeredFrom,
  registeredTo,
  activity = "all",
}: {
  query?: string;
  page?: number;
  pageSize?: number;
  registeredFrom?: string;
  registeredTo?: string;
  activity?: CustomerActivityFilter;
} = {}): Promise<AdminCustomerListResult> {
  await requirePermission("customers.read");
  const supabase = createClient();
  const safePage = Number.isSafeInteger(page) && page > 0 ? Math.min(page, 4001) : 1;
  const safePageSize = Number.isInteger(pageSize) ? Math.min(Math.max(pageSize, 1), 100) : 25;
  const { data, error } = await (supabase.rpc as any)("admin_list_customers", {
    p_search: query?.trim() || null,
    p_registered_from: registeredFrom || null,
    p_registered_to: registeredTo || null,
    p_activity: activity,
    p_limit: safePageSize,
    p_offset: (safePage - 1) * safePageSize,
  });

  if (error) {
    console.error("listAdminCustomers failed:", error.message);
    throw new Error("Could not load customer records.");
  }

  const rows = data ?? [];
  return {
    items: rows.map((row: any): AdminCustomerListItem => ({
      id: row.id,
      full_name: row.full_name,
      email: row.email,
      phone: row.phone,
      student_status: row.student_status,
      created_at: row.created_at,
      account_status: row.account_status,
      order_count: Number(row.order_count),
      completed_order_count: Number(row.completed_order_count),
      active_order_count: Number(row.active_order_count),
      rental_count: Number(row.rental_count),
      repair_count: Number(row.repair_count),
      enquiry_count: Number(row.enquiry_count),
      completed_purchase_value: Number(row.completed_purchase_value),
      last_activity: row.last_activity,
    })),
    total: Number(rows[0]?.total_count ?? 0),
    page: safePage,
    pageSize: safePageSize,
  };
}

export interface AdminCustomerDetail {
  id: string;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  student_status: string;
  referral_code: string | null;
  created_at: string;
  account_status: "active" | "unconfirmed" | "suspended" | "deleted";
  addresses: Array<{ id: string; label: string | null; line1: string; city: string; is_default: boolean }>;
  orders: Array<{ id: string; order_number: string; created_at: string; order_status: string; total: number }>;
  rentals: Array<{ id: string; created_at: string; start_date: string; end_date: string; status: string; product_name: string | null }>;
  repairs: Array<{ id: string; ticket_number: string; device_type: string; brand: string | null; model: string | null; status: string; created_at: string }>;
  enquiries: Array<{ id: string; topic: string; status: string; created_at: string }>;
  wishlistCount: number;
}

export async function getAdminCustomerById(id: string): Promise<AdminCustomerDetail | null> {
  await requirePermission("customers.read");
  const admin = createAdminClient();
  const supabase = admin as any;
  const [authResult, customerResult, profileResult, addressesResult, ordersResult, rentalsResult, repairsResult, enquiriesResult, wishlistResult] = await Promise.all([
    admin.auth.admin.getUserById(id),
    supabase.from("customers").select("id, student_status, referral_code, created_at").eq("id", id).maybeSingle(),
    supabase.from("profiles").select("id, full_name, phone").eq("id", id).maybeSingle(),
    supabase.from("addresses").select("id, label, line1, city, is_default").eq("customer_id", id).order("created_at", { ascending: false }),
    supabase.from("orders").select("id, order_number, created_at, order_status, total").eq("customer_id", id).order("created_at", { ascending: false }),
    supabase.from("rental_bookings").select("id, created_at, start_date, end_date, status, rental_products(products(name))").eq("customer_id", id).order("created_at", { ascending: false }),
    supabase.from("repair_tickets").select("id, ticket_number, device_type, brand, model, status, created_at").eq("customer_id", id).order("created_at", { ascending: false }),
    supabase.from("enquiries").select("id, topic, status, created_at").eq("customer_id", id).order("created_at", { ascending: false }),
    supabase.from("wishlists").select("id").eq("customer_id", id).maybeSingle(),
  ]);

  if (authResult.error) {
    if (authResult.error.code === "user_not_found") return null;
    console.error("getAdminCustomerById auth lookup failed:", authResult.error.message);
    throw new Error("Could not load this customer's account.");
  }
  const authUser = authResult.data.user;
  if (!authUser) return null;

  const enquiryEmail = authUser.email?.replace(/[\\%_]/g, "\\$&");
  const [unlinkedEnquiriesResult, corporateEnquiriesResult] = enquiryEmail
    ? await Promise.all([
        supabase.from("enquiries")
          .select("id, topic, status, created_at")
          .is("customer_id", null)
          .ilike("email", enquiryEmail),
        supabase.from("corporate_enquiries")
          .select("id, status, created_at")
          .ilike("email", enquiryEmail),
      ])
    : [{ data: [], error: null }, { data: [], error: null }];
  const results = [
    customerResult,
    profileResult,
    addressesResult,
    ordersResult,
    rentalsResult,
    repairsResult,
    enquiriesResult,
    wishlistResult,
    unlinkedEnquiriesResult,
    corporateEnquiriesResult,
  ];
  const failedQuery = results.find((result) => result.error);
  if (failedQuery) {
    console.error("getAdminCustomerById failed:", failedQuery.error.message);
    throw new Error("Could not load this customer's activity.");
  }

  const customer = customerResult.data;
  const profile = profileResult.data;
  const wishlist = wishlistResult.data;
  let wishlistCount = 0;
  if (wishlist) {
    const { count, error } = await supabase.from("wishlist_items")
      .select("id", { count: "exact", head: true })
      .eq("wishlist_id", wishlist.id);
    if (error) {
      console.error("getAdminCustomerById wishlist count failed:", error.message);
      throw new Error("Could not load this customer's wishlist count.");
    }
    wishlistCount = count ?? 0;
  }

  const accountStatus = authUser.deleted_at
    ? "deleted"
    : authUser.banned_until && new Date(authUser.banned_until) > new Date()
      ? "suspended"
      : authUser.confirmed_at
        ? "active"
        : "unconfirmed";

  return {
    id: authUser.id,
    full_name: profile?.full_name ?? null,
    phone: profile?.phone ?? null,
    email: authUser.email ?? null,
    student_status: customer?.student_status ?? "none",
    referral_code: customer?.referral_code ?? null,
    created_at: authUser.created_at,
    account_status: accountStatus,
    addresses: addressesResult.data ?? [],
    orders: (ordersResult.data ?? []).map((order: any) => ({ ...order, total: Number(order.total) })),
    rentals: (rentalsResult.data ?? []).map((rental: any) => ({
      id: rental.id,
      created_at: rental.created_at,
      start_date: rental.start_date,
      end_date: rental.end_date,
      status: rental.status,
      product_name: rental.rental_products?.products?.name ?? null,
    })),
    repairs: repairsResult.data ?? [],
    enquiries: [
      ...(enquiriesResult.data ?? []),
      ...(unlinkedEnquiriesResult.data ?? []),
      ...(corporateEnquiriesResult.data ?? []).map((enquiry: { id: string; status: string; created_at: string }) => ({
        ...enquiry,
        topic: "corporate_enquiry",
      })),
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    wishlistCount,
  };
}
