import "server-only";
import { createClient } from "@/lib/supabase/server";

export interface AdminGeneralEnquiry {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  topic: string;
  message: string;
  status: string;
  internal_notes: string | null;
  created_at: string;
  customer_id: string | null;
}

export async function listGeneralEnquiries(status?: string, page = 1, pageSize = 25) {
  const supabase = createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  let query = (supabase.from("enquiries") as any)
    .select("id, name, phone, email, topic, message, status, internal_notes, created_at, customer_id", { count: "exact" })
    .order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);
  const { data, error, count } = await query.range(from, to);
  if (error) {
    console.error("listGeneralEnquiries failed:", error.message);
    return { items: [] as AdminGeneralEnquiry[], total: 0, page, pageSize };
  }
  return { items: (data ?? []) as AdminGeneralEnquiry[], total: count ?? 0, page, pageSize };
}

export async function getGeneralEnquiryById(id: string): Promise<AdminGeneralEnquiry | null> {
  const supabase = createClient();
  const { data, error } = await (supabase.from("enquiries") as any)
    .select("id, name, phone, email, topic, message, status, internal_notes, created_at, customer_id")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return data;
}

export interface AdminCorporateEnquiry {
  id: string;
  organisation_name: string;
  contact_person: string;
  phone: string;
  email: string;
  products_required: string | null;
  quantity: number | null;
  budget: number | null;
  delivery_location: string | null;
  additional_requirements: string | null;
  status: string;
  internal_notes: string | null;
  created_at: string;
}

export async function listCorporateEnquiries(status?: string, page = 1, pageSize = 25) {
  const supabase = createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  let query = (supabase.from("corporate_enquiries") as any)
    .select(
      "id, organisation_name, contact_person, phone, email, products_required, quantity, budget, delivery_location, additional_requirements, status, internal_notes, created_at",
      { count: "exact" },
    )
    .order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);
  const { data, error, count } = await query.range(from, to);
  if (error) {
    console.error("listCorporateEnquiries failed:", error.message);
    return { items: [] as AdminCorporateEnquiry[], total: 0, page, pageSize };
  }
  return {
    items: (data ?? []).map((row: any) => ({ ...row, budget: row.budget ? Number(row.budget) : null })) as AdminCorporateEnquiry[],
    total: count ?? 0,
    page,
    pageSize,
  };
}

export async function getCorporateEnquiryById(id: string): Promise<AdminCorporateEnquiry | null> {
  const supabase = createClient();
  const { data, error } = await (supabase.from("corporate_enquiries") as any)
    .select(
      "id, organisation_name, contact_person, phone, email, products_required, quantity, budget, delivery_location, additional_requirements, status, internal_notes, created_at",
    )
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return { ...data, budget: data.budget ? Number(data.budget) : null };
}
