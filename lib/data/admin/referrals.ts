import "server-only";
import { createClient } from "@/lib/supabase/server";
import { requirePermission, AuthorizationError } from "@/lib/auth/permissions";
import { z } from "zod";

export interface AdminReferral {
  id: string;
  status: string;
  reward_status: string;
  reward_amount: number | null;
  created_at: string;
  referrer_name: string | null;
  referred_name: string | null;
  referred_order_id: string | null;
}

export async function listAdminReferrals(status?: string): Promise<AdminReferral[]> {
  const supabase = createClient();
  let query = (supabase.from("referrals") as any)
    .select(`
      id, status, reward_status, reward_amount, created_at, referred_order_id,
      referrer:referrer_customer_id ( profiles ( full_name ) ),
      referred:referred_customer_id ( profiles ( full_name ) )
    `)
    .order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) {
    console.error("listAdminReferrals failed:", error.message);
    return [] as AdminReferral[];
  }
  return (data ?? []).map((row: any) => ({
    id: row.id,
    status: row.status,
    reward_status: row.reward_status,
    reward_amount: row.reward_amount ? Number(row.reward_amount) : null,
    created_at: row.created_at,
    referrer_name: row.referrer?.profiles?.full_name ?? null,
    referred_name: row.referred?.profiles?.full_name ?? null,
    referred_order_id: row.referred_order_id,
  }));
}

export type ServiceResult = { success: true } | { success: false; error: string };

const statusSchema = z.object({ id: z.string().uuid(), status: z.enum(["pending", "qualified", "rewarded", "rejected"]) });

export async function updateReferralStatus(input: unknown): Promise<ServiceResult> {
  try {
    await requirePermission("settings.write");
  } catch (e) {
    if (e instanceof AuthorizationError) return { success: false, error: "You don't have permission to manage referrals." };
    throw e;
  }
  const parsed = statusSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid status." };

  const supabase = createClient();
  const { error } = await (supabase.from("referrals") as any).update({ status: parsed.data.status }).eq("id", parsed.data.id);
  if (error) return { success: false, error: "Could not update referral." };
  return { success: true };
}
