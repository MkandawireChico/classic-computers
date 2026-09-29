import { requirePermission } from "@/lib/auth/permissions";
import { listAdminReferrals } from "@/lib/data/admin/referrals";
import { ReferralRow } from "@/components/admin/referral-row";

export default async function AdminReferralsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  await requirePermission("settings.write");
  const status = typeof searchParams.status === "string" ? searchParams.status : undefined;
  const referrals = await listAdminReferrals(status);

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-gray-900">Referrals</h1>
      <div className="rounded-card border border-surface-border">
        {referrals.length === 0 ? (
          <p className="p-6 text-center text-sm text-gray-500">No referrals found.</p>
        ) : (
          referrals.map((r) => <ReferralRow key={r.id} referral={r} />)
        )}
      </div>
    </div>
  );
}
