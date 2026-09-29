import { getMyReferralInfo } from "@/lib/data/account-referrals";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/format/money";

export default async function AccountReferralsPage() {
  const { referralCode, referrals } = await getMyReferralInfo();

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-gray-900">Referrals</h1>

      {referralCode ? (
        <div className="mb-6 rounded-card border border-surface-border p-4">
          <p className="text-xs font-medium uppercase text-gray-500">Your referral code</p>
          <p className="mt-1 font-mono text-lg text-gray-900">{referralCode}</p>
          <p className="mt-1 text-xs text-gray-500">
            Share this code — people who use it when signing up will be linked to your account
            here.
          </p>
        </div>
      ) : null}

      {referrals.length === 0 ? (
        <p className="empty-state">No referrals yet.</p>
      ) : (
        <div className="divide-y divide-surface-border rounded-card border border-surface-border">
          {referrals.map((r) => (
            <div key={r.id} className="flex items-center justify-between p-3 text-sm">
              <span className="text-gray-600">
                {new Date(r.created_at).toLocaleDateString("en-MW", { timeZone: "Africa/Blantyre" })}
              </span>
              <Badge variant="info">{r.status}</Badge>
              {r.reward_amount ? (
                <span className="text-gray-900">
                  {formatMoney(r.reward_amount)} ({r.reward_status})
                </span>
              ) : (
                <span className="text-xs text-gray-400">No reward configured</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
