import "server-only";
import { createClient } from "@/lib/supabase/server";

export interface MyStudentVerification {
  id: string;
  status: string;
  full_name: string;
  institution: string;
  created_at: string;
  reviewed_at: string | null;
  expires_at: string | null;
}

export async function getMyStudentVerification(): Promise<MyStudentVerification | null> {
  const supabase = createClient();
  const { data, error } = await (supabase.from("student_verifications") as any)
    .select("id, status, full_name, institution, created_at, reviewed_at, expires_at")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) {
    console.error("getMyStudentVerification failed:", error.message);
    return null;
  }
  return data;
}
