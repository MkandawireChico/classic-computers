"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatMoney } from "@/lib/format/money";
import { updateReferralStatusAction } from "@/app/admin/referrals/actions";
import type { AdminReferral } from "@/lib/data/admin/referrals";

const STATUSES = ["pending", "qualified", "rewarded", "rejected"];

export function ReferralRow({ referral }: { referral: AdminReferral }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function updateStatus(status: string) {
    startTransition(async () => {
      await updateReferralStatusAction({ id: referral.id, status });
      router.refresh();
    });
  }

  return (
    <div className="flex items-center justify-between border-b border-surface-border p-3 text-sm">
      <div>
        <p className="text-slate-900">
          <a href="#" className="text-brand-600 hover:underline">{referral.referrer_name ?? "Unknown"}</a>
          <span className="mx-2 text-sm text-slate-400">•</span>
          <span className="text-slate-700">{referral.referred_name ?? "Pending signup"}</span>
        </p>
        <p className="text-xs text-gray-400">
          {new Date(referral.created_at).toLocaleDateString("en-MW", { timeZone: "Africa/Blantyre" })}
          {referral.reward_amount ? ` · ${formatMoney(referral.reward_amount)} (${referral.reward_status})` : ""}
        </p>
      </div>
      <select value={referral.status} onChange={(e) => updateStatus(e.target.value)} disabled={isPending} className="rounded-card border border-surface-border px-2 py-1 text-xs">
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    </div>
  );
}
