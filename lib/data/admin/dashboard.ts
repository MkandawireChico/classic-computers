import "server-only";
import { createClient } from "@/lib/supabase/server";

export interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  ordersAwaitingAction: number; // confirmed + processing
  salesTotalMwk: number; // sum of `total` for completed orders
  lowStockCount: number;
  outOfStockCount: number;
  pendingEnquiries: number;
  pendingRepairs: number;
  activeRentals: number;
  pendingStudentVerifications: number;
}

export interface RecentOrder {
  id: string;
  order_number: string;
  created_at: string;
  order_status: string;
  total: number;
}

export interface RecentCustomer {
  id: string;
  full_name: string | null;
  created_at: string;
}

export interface RecentReview {
  id: string;
  rating: number;
  status: string;
  created_at: string;
  product_name: string | null;
}

export interface RecentMovement {
  id: string;
  movement_type: string;
  quantity_delta: number;
  created_at: string;
  product_name: string | null;
}

/**
 * Every count here uses `{ count: "exact", head: true }` — Postgres/
 * PostgREST returns just the row count, never the rows themselves, so
 * this never pulls a full table into memory just to display a number.
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = createClient();

  const [
    totalOrders,
    pendingOrders,
    confirmedOrders,
    processingOrders,
    lowStock,
    outOfStock,
    pendingEnquiries,
    pendingRepairs,
    activeRentals,
    pendingStudents,
    completedOrdersSum,
  ] = await Promise.all([
    (supabase.from("orders") as any).select("id", { count: "exact", head: true }),
    (supabase.from("orders") as any).select("id", { count: "exact", head: true }).eq("order_status", "pending"),
    (supabase.from("orders") as any).select("id", { count: "exact", head: true }).eq("order_status", "confirmed"),
    (supabase.from("orders") as any).select("id", { count: "exact", head: true }).eq("order_status", "processing"),
    (supabase.from("inventory") as any).select("id", { count: "exact", head: true }).eq("status", "low_stock"),
    (supabase.from("inventory") as any).select("id", { count: "exact", head: true }).eq("status", "out_of_stock"),
    (supabase.from("enquiries") as any).select("id", { count: "exact", head: true }).eq("status", "new"),
    (supabase.from("repair_tickets") as any)
      .select("id", { count: "exact", head: true })
      .not("status", "in", "(completed,cancelled)"),
    (supabase.from("rental_bookings") as any).select("id", { count: "exact", head: true }).eq("status", "active"),
    (supabase.from("student_verifications") as any)
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    (supabase.from("orders") as any).select("total").eq("order_status", "completed"),
  ]);

  const salesTotalMwk = ((completedOrdersSum.data ?? []) as any[]).reduce(
    (sum, row) => sum + Number(row.total),
    0,
  );

  return {
    totalOrders: totalOrders.count ?? 0,
    pendingOrders: pendingOrders.count ?? 0,
    ordersAwaitingAction: (confirmedOrders.count ?? 0) + (processingOrders.count ?? 0),
    salesTotalMwk,
    lowStockCount: lowStock.count ?? 0,
    outOfStockCount: outOfStock.count ?? 0,
    pendingEnquiries: pendingEnquiries.count ?? 0,
    pendingRepairs: pendingRepairs.count ?? 0,
    activeRentals: activeRentals.count ?? 0,
    pendingStudentVerifications: pendingStudents.count ?? 0,
  };
}

export async function getRecentOrders(limit = 5): Promise<RecentOrder[]> {
  const supabase = createClient();
  const { data } = await (supabase.from("orders") as any)
    .select("id, order_number, created_at, order_status, total")
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function getRecentCustomers(limit = 5): Promise<RecentCustomer[]> {
  const supabase = createClient();
  const { data } = await (supabase.from("customers") as any)
    .select("id, created_at, profiles ( full_name )")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []).map((row: any) => ({
    id: row.id,
    full_name: row.profiles?.full_name ?? null,
    created_at: row.created_at,
  }));
}

export async function getRecentReviews(limit = 5): Promise<RecentReview[]> {
  const supabase = createClient();
  const { data } = await (supabase.from("reviews") as any)
    .select("id, rating, status, created_at, products ( name )")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []).map((row: any) => ({
    id: row.id,
    rating: row.rating,
    status: row.status,
    created_at: row.created_at,
    product_name: row.products?.name ?? null,
  }));
}

export async function getRecentInventoryMovements(limit = 5): Promise<RecentMovement[]> {
  const supabase = createClient();
  const { data } = await (supabase.from("inventory_movements") as any)
    .select("id, movement_type, quantity_delta, created_at, inventory ( products ( name ) )")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []).map((row: any) => ({
    id: row.id,
    movement_type: row.movement_type,
    quantity_delta: row.quantity_delta,
    created_at: row.created_at,
    product_name: row.inventory?.products?.name ?? null,
  }));
}
