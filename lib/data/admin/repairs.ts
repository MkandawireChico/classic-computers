import "server-only";
import { createClient } from "@/lib/supabase/server";

export interface AdminRepairListItem {
  id: string;
  ticket_number: string;
  device_type: string;
  status: string;
  created_at: string;
  customer_name: string | null;
  guest_name: string | null;
  technician_email: string | null;
}

export interface RepairFilters {
  status?: string;
  technicianId?: string;
  query?: string;
  page?: number;
  pageSize?: number;
}

export async function listAdminRepairs(filters: RepairFilters) {
  const supabase = createClient();
  const page = filters.page && filters.page > 0 ? filters.page : 1;
  const pageSize = filters.pageSize && filters.pageSize > 0 ? filters.pageSize : 25;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = (supabase.from("repair_tickets") as any)
    .select(
      `
      id, ticket_number, device_type, status, created_at, guest_name, assigned_technician_id,
      customers ( profiles ( full_name ) )
    `,
      { count: "exact" },
    )
    .order("created_at", { ascending: false });

  if (filters.status) query = query.eq("status", filters.status);
  if (filters.technicianId) query = query.eq("assigned_technician_id", filters.technicianId);
  if (filters.query && filters.query.trim()) query = query.ilike("ticket_number", `%${filters.query.trim()}%`);

  const { data, error, count } = await query.range(from, to);
  if (error) {
    console.error("listAdminRepairs failed:", error.message);
    return { items: [] as AdminRepairListItem[], total: 0, page, pageSize };
  }

  const items: AdminRepairListItem[] = (data ?? []).map((row: any) => ({
    id: row.id,
    ticket_number: row.ticket_number,
    device_type: row.device_type,
    status: row.status,
    created_at: row.created_at,
    customer_name: row.customers?.profiles?.full_name ?? null,
    guest_name: row.guest_name,
    technician_email: null, // resolving assigned_technician_id -> email needs the admin client; deferred, see PHASE_6 report
  }));

  return { items, total: count ?? items.length, page, pageSize };
}

export interface AdminRepairDetail {
  id: string;
  ticket_number: string;
  status: string;
  device_type: string;
  brand: string | null;
  model: string | null;
  serial_number: string | null;
  problem_description: string;
  accessories_received: string | null;
  quote_amount: number | null;
  quote_approved_at: string | null;
  assigned_technician_id: string | null;
  customer_id: string | null;
  customer_name: string | null;
  guest_name: string | null;
  guest_phone: string | null;
  guest_email: string | null;
  created_at: string;
  updates: Array<{ id: string; note: string; is_internal: boolean; created_at: string }>;
  parts: Array<{
    id: string;
    part_name: string;
    cost: number;
    quantity: number;
    product_id: string | null;
    variant_id: string | null;
    inventory_movement_id: string | null;
  }>;
}

export async function getAdminRepairById(id: string): Promise<AdminRepairDetail | null> {
  const supabase = createClient();

  const { data: ticket, error } = await (supabase.from("repair_tickets") as any)
    .select(`
      id, ticket_number, status, device_type, brand, model, serial_number, problem_description,
      accessories_received, quote_amount, quote_approved_at, assigned_technician_id, customer_id,
      guest_name, guest_phone, guest_email, created_at,
      customers ( profiles ( full_name ) )
    `)
    .eq("id", id)
    .maybeSingle();
  if (error || !ticket) return null;

  const [{ data: updates }, { data: parts }] = await Promise.all([
    (supabase.from("repair_updates") as any).select("id, note, is_internal, created_at").eq("ticket_id", id).order("created_at"),
    (supabase.from("repair_parts") as any).select("id, part_name, cost, quantity, product_id, variant_id, inventory_movement_id").eq("ticket_id", id),
  ]);

  return {
    id: ticket.id,
    ticket_number: ticket.ticket_number,
    status: ticket.status,
    device_type: ticket.device_type,
    brand: ticket.brand,
    model: ticket.model,
    serial_number: ticket.serial_number,
    problem_description: ticket.problem_description,
    accessories_received: ticket.accessories_received,
    quote_amount: ticket.quote_amount ? Number(ticket.quote_amount) : null,
    quote_approved_at: ticket.quote_approved_at,
    assigned_technician_id: ticket.assigned_technician_id,
    customer_id: ticket.customer_id,
    customer_name: ticket.customers?.profiles?.full_name ?? null,
    guest_name: ticket.guest_name,
    guest_phone: ticket.guest_phone,
    guest_email: ticket.guest_email,
    created_at: ticket.created_at,
    updates: updates ?? [],
    parts: (parts ?? []).map((p: any) => ({ ...p, cost: Number(p.cost) })),
  };
}

export async function listTechnicians(): Promise<Array<{ id: string; name: string | null }>> {
  const supabase = createClient();
  const { data: roleRow } = await (supabase.from("roles") as any).select("id").eq("name", "technician").maybeSingle();
  if (!roleRow) return [];

  const { data: assignments } = await (supabase.from("user_roles") as any).select("user_id").eq("role_id", roleRow.id);
  const userIds = (assignments ?? []).map((a: any) => a.user_id);
  if (userIds.length === 0) return [];

  const { data: profiles } = await (supabase.from("profiles") as any).select("id, full_name").in("id", userIds);
  const nameById = new Map((profiles ?? []).map((p: any) => [p.id, p.full_name]));

  return userIds.map((id: string) => ({ id, name: nameById.get(id) ?? null }));
}
