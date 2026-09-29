import "server-only";
import { createClient } from "@/lib/supabase/server";

export interface MyEnquiry {
  id: string;
  topic: string;
  message: string;
  status: string;
  created_at: string;
}

export async function getMyEnquiries(): Promise<MyEnquiry[]> {
  const supabase = createClient();
  const { data, error } = await (supabase.from("enquiries") as any)
    .select("id, topic, message, status, created_at")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("getMyEnquiries failed:", error.message);
    return [];
  }
  return data ?? [];
}
