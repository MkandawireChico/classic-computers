import "server-only";
import { createClient } from "@/lib/supabase/server";

export interface MyReferral {
  id: string;
  status: string;
  reward_status: string;
  reward_amount: number | null;
  created_at: string;
}

export interface MyReferralInfo {
  referralCode: string | null;
  referrals: MyReferral[];
}

export async function getMyReferralInfo(): Promise<MyReferralInfo> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { referralCode: null, referrals: [] };

  const { data: customer } = await (supabase.from("customers") as any).select("referral_code").eq("id", user.id).maybeSingle();

  const { data: referrals } = await (supabase.from("referrals") as any)
    .select("id, status, reward_status, reward_amount, created_at")
    .eq("referrer_customer_id", user.id)
    .order("created_at", { ascending: false });

  return {
    referralCode: customer?.referral_code ?? null,
    referrals: (referrals ?? []).map((r: any) => ({ ...r, reward_amount: r.reward_amount ? Number(r.reward_amount) : null })),
  };
}
