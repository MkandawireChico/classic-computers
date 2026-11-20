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

export interface AdminRepairOverview {
  active: number;
  awaitingApproval: number;
  readyForPickup: number;
  unassigned: number;
  agedOver7Days: number;
  agedOver14Days: number;
  completedLast30Days: number;
  averageTurnaroundDays: number | null;
}

export async function getAdminRepairOverview(): Promise<AdminRepairOverview> {
  const supabase = createClient();
  const activeStatuses = ["checked_in", "diagnosing", "quoted", "awaiting_approval", "in_progress", "ready_for_pickup"];
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
  const count = async (configure: (query: any) => any) => {
    let query = (supabase.from("repair_tickets") as any).select("id", { count: "exact", head: true });
    query = configure(query);
    const { count: total, error } = await query;
    if (error) {
      console.error("getAdminRepairOverview failed:", error.message);
      return 0;
    }
    return total ?? 0;
  };

  const [active, awaitingApproval, readyForPickup, unassigned, agedOver7Days, agedOver14Days] = await Promise.all([
    count((query) => query.in("status", activeStatuses)),
    count((query) => query.eq("status", "awaiting_approval")),
    count((query) => query.eq("status", "ready_for_pickup")),
    count((query) => query.in("status", activeStatuses).is("assigned_technician_id", null)),
    count((query) => query.in("status", activeStatuses).lt("created_at", sevenDaysAgo)),
    count((query) => query.in("status", activeStatuses).lt("created_at", fourteenDaysAgo)),
  ]);

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data: completions, error: completionError } = await (supabase.from("repair_status_history" as any) as any)
    .select("ticket_id,created_at").eq("to_status", "completed").eq("is_baseline", false).gte("created_at", thirtyDaysAgo).order("created_at", { ascending: true });
  let completedLast30Days = 0;
  let averageTurnaroundDays: number | null = null;
  if (!completionError && completions?.length) {
    const firstCompletionByTicket = new Map<string, string>();
    for (const row of completions) if (!firstCompletionByTicket.has(row.ticket_id)) firstCompletionByTicket.set(row.ticket_id, row.created_at);
    const ticketIds = [...firstCompletionByTicket.keys()];
    const { data: tickets } = await (supabase.from("repair_tickets") as any).select("id,created_at").in("id", ticketIds);
    const createdAtById = new Map((tickets ?? []).map((ticket: any) => [ticket.id, new Date(ticket.created_at).getTime()]));
    const durations = [...firstCompletionByTicket.entries()].map(([ticketId, completedAt]) => {
      const start = createdAtById.get(ticketId);
      return typeof start === "number" ? (new Date(completedAt).getTime() - start) / 86400000 : null;
    }).filter((value: number | null): value is number => value !== null && value >= 0);
    completedLast30Days = durations.length;
    averageTurnaroundDays = durations.length
      ? Math.round((durations.reduce((sum: number, value: number) => sum + value, 0) / durations.length) * 10) / 10
      : null;
  } else if (completionError) {
    console.error("getAdminRepairOverview status history unavailable:", completionError.message);
  }
  return { active, awaitingApproval, readyForPickup, unassigned, agedOver7Days, agedOver14Days, completedLast30Days, averageTurnaroundDays };
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
  statusHistory: Array<{ id: string; from_status: string | null; to_status: string; changed_by_name: string | null; is_baseline: boolean; created_at: string }>;
  workLogs: Array<{ id: string; work_date: string; duration_minutes: number; work_performed: string; technician_name: string | null }>;
  partsCostTotal: number;
  loggedMinutes: number;
  internalLabourRate: number | null;
  latestQuotation: { document_number: number; status: string; taxable_amount: number; grand_total: number } | null;
  finalInvoice: { id: string; document_number: number; status: string; invoice_count: number; taxable_amount: number; grand_total: number; latest_taxable_amount: number; paid: number; refunded: number; outstanding: number } | null;
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

  const [{ data: updates }, { data: parts }, { data: workLogs }, { data: quotations }, { data: invoices }, { data: statusHistory, error: statusHistoryError }] = await Promise.all([
    (supabase.from("repair_updates") as any).select("id, note, is_internal, created_at").eq("ticket_id", id).order("created_at"),
    (supabase.from("repair_parts") as any).select("id, part_name, cost, quantity, product_id, variant_id, inventory_movement_id").eq("ticket_id", id),
    (supabase.from("repair_work_logs" as any) as any).select("id, technician_id, work_date, duration_minutes, work_performed").eq("ticket_id", id).order("work_date", { ascending: false }).order("created_at", { ascending: false }),
    (supabase.from("business_documents" as any) as any).select("document_number,status,taxable_amount,grand_total").eq("source_type", "repair").eq("source_id", id).eq("document_type", "quotation").order("created_at", { ascending: false }).limit(1),
    (supabase.from("business_documents" as any) as any).select("id,document_number,status,taxable_amount,grand_total").eq("source_type", "repair").eq("source_id", id).eq("document_type", "invoice").order("created_at", { ascending: false }),
    (supabase.from("repair_status_history" as any) as any).select("id,from_status,to_status,changed_by,is_baseline,created_at").eq("ticket_id", id).order("created_at", { ascending: false }),
  ]);
  if (statusHistoryError) console.error("Repair status history unavailable:", statusHistoryError.message);
  const { data: repairSettings } = await (supabase.from("site_settings") as any)
    .select("value").eq("key", "repair_settings").maybeSingle();
  const configuredRate = Number(repairSettings?.value?.internal_labour_rate_mwk_per_hour);
  const internalLabourRate = Number.isFinite(configuredRate) && configuredRate > 0 ? configuredRate : null;
  const technicianIds = [...new Set((workLogs ?? []).map((entry: any) => entry.technician_id).filter(Boolean))];
  const statusActorIds = [...new Set((statusHistory ?? []).map((entry: any) => entry.changed_by).filter(Boolean))];
  const profileIds = [...new Set([...technicianIds, ...statusActorIds])];
  const { data: technicianProfiles } = profileIds.length
    ? await (supabase.from("profiles") as any).select("id,full_name").in("id", profileIds)
    : { data: [] as any[] };
  const technicianNames = new Map((technicianProfiles ?? []).map((profile: any) => [profile.id, profile.full_name]));
  const normalizedParts = (parts ?? []).map((part: any) => ({ ...part, cost: Number(part.cost), quantity: Number(part.quantity) }));
  const normalizedWorkLogs = (workLogs ?? []).map((entry: any) => ({
    ...entry,
    duration_minutes: Number(entry.duration_minutes),
    technician_name: technicianNames.get(entry.technician_id) ?? null,
  }));
  const latest = quotations?.[0] ?? null;
  const invoiceRows = invoices ?? [];
  let finalInvoice = null;
  if (invoiceRows.length > 0) {
    const invoiceIds = invoiceRows.map((row: any) => row.id);
    const { data: transactions } = await (supabase.from("business_document_transactions" as any) as any)
      .select("document_id,transaction_type,amount").in("document_id", invoiceIds);
    const paid = (transactions ?? []).filter((row: any) => row.transaction_type === "payment").reduce((sum: number, row: any) => sum + Number(row.amount), 0);
    const refunded = (transactions ?? []).filter((row: any) => row.transaction_type === "refund").reduce((sum: number, row: any) => sum + Number(row.amount), 0);
    const taxableAmount = invoiceRows.reduce((sum: number, row: any) => sum + Number(row.taxable_amount), 0);
    const grandTotal = invoiceRows.reduce((sum: number, row: any) => sum + Number(row.grand_total), 0);
    const latestInvoice = invoiceRows[0];
    finalInvoice = {
      id: latestInvoice.id,
      document_number: Number(latestInvoice.document_number),
      status: latestInvoice.status,
      invoice_count: invoiceRows.length,
      taxable_amount: taxableAmount,
      grand_total: grandTotal,
      latest_taxable_amount: Number(latestInvoice.taxable_amount),
      paid,
      refunded,
      outstanding: Math.max(0, grandTotal - paid + refunded),
    };
  }

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
    statusHistory: (statusHistory ?? []).map((entry: any) => ({
      id: entry.id,
      from_status: entry.from_status,
      to_status: entry.to_status,
      changed_by_name: technicianNames.get(entry.changed_by) ?? null,
      is_baseline: Boolean(entry.is_baseline),
      created_at: entry.created_at,
    })),
    workLogs: normalizedWorkLogs,
    parts: normalizedParts,
    partsCostTotal: normalizedParts.reduce((total: number, part: any) => total + part.cost * part.quantity, 0),
    loggedMinutes: normalizedWorkLogs.reduce((total: number, entry: any) => total + entry.duration_minutes, 0),
    internalLabourRate,
    latestQuotation: latest ? {
      document_number: Number(latest.document_number),
      status: latest.status,
      taxable_amount: Number(latest.taxable_amount),
      grand_total: Number(latest.grand_total),
    } : null,
    finalInvoice,
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


export interface AdminRepairTechnicianPerformance {
  id: string;
  name: string | null;
  activeTickets: number;
  completedLast30Days: number;
  loggedMinutesLast30Days: number;
}

export async function getAdminRepairTechnicianPerformance(): Promise<AdminRepairTechnicianPerformance[]> {
  const supabase = createClient();
  const technicians = await listTechnicians();
  if (technicians.length === 0) return [];

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const ids = technicians.map((technician) => technician.id);
  const [ticketResult, completionResult] = await Promise.all([
    (supabase.from("repair_tickets") as any)
      .select("id,assigned_technician_id,status")
      .in("assigned_technician_id", ids),
    (supabase.from("repair_status_history" as any) as any)
       .select("ticket_id,assigned_technician_id,created_at")
      .eq("to_status", "completed")
      .eq("is_baseline", false)
      .gte("created_at", since)
      .in("assigned_technician_id", ids)
      .order("created_at", { ascending: true }),
  ]);

  if (ticketResult.error) console.error("Technician repair assignments unavailable:", ticketResult.error.message);
  if (completionResult.error) console.error("Technician repair completions unavailable:", completionResult.error.message);

  const activeStatuses = new Set(["checked_in", "diagnosing", "quoted", "awaiting_approval", "in_progress", "ready_for_pickup"]);
  const activeByTechnician = new Map<string, number>();
  for (const ticket of ticketResult.data ?? []) {
    if (!ticket.assigned_technician_id) continue;
    if (activeStatuses.has(ticket.status)) {
      activeByTechnician.set(ticket.assigned_technician_id, (activeByTechnician.get(ticket.assigned_technician_id) ?? 0) + 1);
    }
  }

  const completedByTechnician = new Map<string, number>();
  const completedTicketIds = new Set<string>();
  for (const completion of completionResult.data ?? []) {
    if (completedTicketIds.has(completion.ticket_id)) continue;
    completedTicketIds.add(completion.ticket_id);
    const technicianId = completion.assigned_technician_id;
    if (technicianId) completedByTechnician.set(technicianId, (completedByTechnician.get(technicianId) ?? 0) + 1);
  }

  const minutesByTechnician = new Map<string, number>();
  let offset = 0;
  const pageSize = 1000;
  while (true) {
    const { data: logs, error } = await (supabase.from("repair_work_logs" as any) as any)
      .select("technician_id,duration_minutes")
      .in("technician_id", ids)
      .gte("created_at", since)
      .range(offset, offset + pageSize - 1);
    if (error) {
      console.error("Technician work logs unavailable:", error.message);
      break;
    }
    for (const log of logs ?? []) {
      minutesByTechnician.set(log.technician_id, (minutesByTechnician.get(log.technician_id) ?? 0) + Number(log.duration_minutes || 0));
    }
    if (!logs || logs.length < pageSize) break;
    offset += pageSize;
  }

  return technicians.map((technician) => ({
    ...technician,
    activeTickets: activeByTechnician.get(technician.id) ?? 0,
    completedLast30Days: completedByTechnician.get(technician.id) ?? 0,
    loggedMinutesLast30Days: minutesByTechnician.get(technician.id) ?? 0,
  })).sort((a, b) => b.activeTickets - a.activeTickets || b.loggedMinutesLast30Days - a.loggedMinutesLast30Days);
}

export interface RepairStockOption {
  inventory_id: string;
  product_id: string;
  variant_id: string | null;
  product_name: string;
  variant_name: string | null;
  sku: string;
  quantity_on_hand: number;
}

export async function listRepairStockOptions(): Promise<RepairStockOption[]> {
  const supabase = createClient();
  const { data, error } = await (supabase.from("inventory") as any)
    .select("id, product_id, variant_id, quantity_on_hand, products ( name, sku ), product_variants ( name, sku )")
    .gt("quantity_on_hand", 0)
    .order("updated_at", { ascending: false })
    .limit(300);
  if (error) {
    console.error("listRepairStockOptions failed:", error.message);
    return [];
  }
  return (data ?? []).map((row: any) => ({
    inventory_id: row.id,
    product_id: row.product_id,
    variant_id: row.variant_id,
    product_name: row.products?.name ?? "Stock item",
    variant_name: row.product_variants?.name ?? null,
    sku: row.product_variants?.sku ?? row.products?.sku ?? "",
    quantity_on_hand: row.quantity_on_hand,
  }));
}
