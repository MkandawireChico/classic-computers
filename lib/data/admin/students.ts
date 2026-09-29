import "server-only";
import { createClient } from "@/lib/supabase/server";

export interface AdminStudentVerification {
  id: string;
  status: string;
  full_name: string;
  institution: string;
  student_id_number: string;
  phone: string;
  email: string;
  document_path: string | null;
  created_at: string;
  reviewed_at: string | null;
  customer_id: string;
}

export async function listAdminStudentVerifications(status?: string, page = 1, pageSize = 25) {
  const supabase = createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = (supabase.from("student_verifications") as any)
    .select("id, status, full_name, institution, student_id_number, phone, email, document_path, created_at, reviewed_at, customer_id", {
      count: "exact",
    })
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);

  const { data, error, count } = await query.range(from, to);
  if (error) {
    console.error("listAdminStudentVerifications failed:", error.message);
    return { items: [] as AdminStudentVerification[], total: 0, page, pageSize };
  }
  return { items: (data ?? []) as AdminStudentVerification[], total: count ?? 0, page, pageSize };
}

export async function getAdminStudentVerificationById(id: string): Promise<AdminStudentVerification | null> {
  const supabase = createClient();
  const { data, error } = await (supabase.from("student_verifications") as any)
    .select("id, status, full_name, institution, student_id_number, phone, email, document_path, created_at, reviewed_at, customer_id")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return data;
}

/**
 * A short-lived signed URL for the private document — generated under the
 * REQUESTING STAFF MEMBER'S OWN session (not the service-role client).
 * The student-documents bucket's SELECT policy (0029) already gates this
 * on has_permission(auth.uid(), 'students.verify'), so Supabase Storage
 * itself rejects the request if the caller doesn't hold that permission.
 */
export async function getStudentDocumentSignedUrl(path: string): Promise<string | null> {
  const supabase = createClient();
  const { data, error } = await supabase.storage.from("student-documents").createSignedUrl(path, 300);
  if (error || !data) {
    console.error("getStudentDocumentSignedUrl failed:", error?.message);
    return null;
  }
  return data.signedUrl;
}
