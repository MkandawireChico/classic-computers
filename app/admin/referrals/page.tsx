import { requirePermission } from "@/lib/auth/permissions";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
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
      <AdminPageHeader eyebrow="Marketing · Referrals" title="Referrals" description="Review referral activity and programme settings." />
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
