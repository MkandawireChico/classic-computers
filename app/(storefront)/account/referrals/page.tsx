import { AccountPageHeader } from "@/components/storefront/account-page-header";
import { getMyReferralInfo } from "@/lib/data/account-referrals";
import { Badge } from "@/components/ui/badge";
import { CopyPaymentValue } from "@/components/storefront/copy-payment-value";
import { formatMoney } from "@/lib/format/money";

export default async function AccountReferralsPage() {
  const { referralCode, referrals } = await getMyReferralInfo();

  return (
    <div className="space-y-6">
      <AccountPageHeader eyebrow="Benefits · Referrals" title="Referrals" description="Share your referral code. Referrals and any configured rewards appear here." />

      {referralCode ? (
        <div className="flex flex-col gap-4 rounded-xl border border-brand-200 bg-brand-50/70 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-brand-900">Your referral code</p>
            <p className="mt-2 font-mono text-2xl font-extrabold text-slate-950">{referralCode}</p>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-700">Share this code with friends. Referrals that use it when signing up are listed below.</p>
          </div>
          <CopyPaymentValue value={referralCode} label="referral code" />
        </div>
      ) : null}

      {referrals.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-7 text-center shadow-sm sm:p-10">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-4 text-slate-300">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <h3 className="text-lg font-semibold text-slate-900">No referrals yet</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">Your referral activity will appear here when someone signs up using your code.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">Referral History</h2>
          {referrals.map((r) => (
            <div key={r.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-600">
                    {new Date(r.created_at).toLocaleDateString("en-MW", { timeZone: "Africa/Blantyre", year: "numeric", month: "long", day: "numeric" })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="info" className="text-xs">
                    {r.status}
                  </Badge>
                  {r.reward_amount ? (
                    <span className="text-sm font-bold text-slate-900">
                      {formatMoney(r.reward_amount)} <span className="text-xs font-normal text-slate-500">({r.reward_status})</span>
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">No reward configured</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
