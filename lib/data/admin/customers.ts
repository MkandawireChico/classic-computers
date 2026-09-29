import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server-admin";

export interface AdminCustomerListItem {
  id: string;
  full_name: string | null;
  phone: string | null;
  student_status: string;
  created_at: string;
  order_count: number;
  total_spent: number;
}

export async function listAdminCustomers(query?: string, page = 1, pageSize = 25) {
  const supabase = createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const q = (supabase.from("customers") as any)
    .select(
      `
      id, student_status, created_at,
      profiles ( full_name, phone )
    `,
      { count: "exact" },
    )
    .order("created_at", { ascending: false });

  const { data, error, count } = await q.range(from, to);
  if (error) {
    console.error("listAdminCustomers failed:", error.message);
    return { items: [] as AdminCustomerListItem[], total: 0, page, pageSize };
  }

  let items: AdminCustomerListItem[] = (data ?? []).map((row: any) => ({
    id: row.id,
    full_name: row.profiles?.full_name ?? null,
    phone: row.profiles?.phone ?? null,
    student_status: row.student_status,
    created_at: row.created_at,
    order_count: 0,
    total_spent: 0,
  }));

  if (query && query.trim()) {
    const term = query.trim().toLowerCase();
    items = items.filter((c) => (c.full_name ?? "").toLowerCase().includes(term) || (c.phone ?? "").includes(term));
  }

  // Order counts/spend fetched separately per visible page only — avoids
  // pulling every order for every customer just to show a summary number.
  const ids = items.map((i) => i.id);
  if (ids.length > 0) {
    const { data: orders } = await (supabase.from("orders") as any)
      .select("customer_id, total")
      .in("customer_id", ids);
    const byCustomer = new Map<string, { count: number; total: number }>();
    for (const o of orders ?? []) {
      const entry = byCustomer.get(o.customer_id) ?? { count: 0, total: 0 };
      entry.count += 1;
      entry.total += Number(o.total);
      byCustomer.set(o.customer_id, entry);
    }
    items = items.map((i) => ({
      ...i,
      order_count: byCustomer.get(i.id)?.count ?? 0,
      total_spent: byCustomer.get(i.id)?.total ?? 0,
    }));
  }

  return { items, total: count ?? items.length, page, pageSize };
}

export interface AdminCustomerDetail {
  id: string;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  student_status: string;
  referral_code: string;
  created_at: string;
  addresses: Array<{ id: string; label: string | null; line1: string; city: string; is_default: boolean }>;
  orders: Array<{ id: string; order_number: string; created_at: string; order_status: string; total: number }>;
  wishlistCount: number;
}

export async function getAdminCustomerById(id: string): Promise<AdminCustomerDetail | null> {
  const supabase = createClient();

  const { data: customer, error } = await (supabase
    .from("customers") as any)
    .select("id, student_status, referral_code, created_at, profiles ( full_name, phone )")
    .eq("id", id)
    .maybeSingle();
  if (error || !customer) return null;

  const [{ data: addresses }, { data: orders }, { data: wishlist }] = await Promise.all([
    (supabase.from("addresses") as any).select("id, label, line1, city, is_default").eq("customer_id", id),
    (supabase.from("orders") as any)
      .select("id, order_number, created_at, order_status, total")
      .eq("customer_id", id)
      .order("created_at", { ascending: false }),
    (supabase.from("wishlists") as any).select("id").eq("customer_id", id).maybeSingle(),
  ]);

  let wishlistCount = 0;
  if (wishlist) {
    const { count } = await (supabase.from("wishlist_items") as any)
      .select("id", { count: "exact", head: true })
      .eq("wishlist_id", wishlist.id);
    wishlistCount = count ?? 0;
  }

  let email: string | null = null;
  try {
    const admin = createAdminClient();
    const { data: authUser } = await admin.auth.admin.getUserById(id);
    email = authUser?.user?.email ?? null;
  } catch (e) {
    console.error("getAdminCustomerById: could not fetch email:", e);
  }

  return {
    id: customer.id,
    full_name: customer.profiles?.full_name ?? null,
    phone: customer.profiles?.phone ?? null,
    email,
    student_status: customer.student_status,
    referral_code: customer.referral_code,
    created_at: customer.created_at,
    addresses: addresses ?? [],
    orders: (orders ?? []).map((o: any) => ({ ...o, total: Number(o.total) })),
    wishlistCount,
  };
}
