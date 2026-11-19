import Link from "next/link";
import { notFound } from "next/navigation";
import { getMyRepairById } from "@/lib/data/account-repairs";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/format/money";
import { getMyReviewStatuses } from "@/lib/data/customer-reviews";
import { CustomerReviewAction } from "@/components/storefront/customer-review-action";
import { getRepairStatusDetails } from "@/lib/repairs/status";

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-MW", {
    timeZone: "Africa/Blantyre",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function AccountRepairDetailPage({ params }: { params: { id: string } }) {
  const repair = await getMyRepairById(params.id);
  if (!repair) notFound();
  const reviewStatuses = await getMyReviewStatuses({ repairIds: [repair.id] });
  const status = getRepairStatusDetails(repair.status);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div>
          <Link href="/account/repairs" className="text-sm font-semibold text-brand-700 hover:text-brand-700">
            ← Back to repairs
          </Link>
          <h1 className="mt-2 text-2xl font-extrabold text-slate-900">{repair.ticket_number}</h1>
          <p className="mt-1 text-sm text-slate-600">Submitted {formatDate(repair.created_at)}</p>
          <CustomerReviewAction
            type="repair"
            transactionId={repair.id}
            eligible={repair.status === "completed"}
            review={reviewStatuses.repairs[repair.id]}
            label="repair"
          />
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge variant={status.variant} className="px-3 py-1.5 text-sm">
            {status.label}
          </Badge>
          <p className="max-w-xs text-right text-xs leading-5 text-slate-500">{status.description}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">Device information</h2>
            <dl className="mt-4 space-y-3">
              <div className="flex justify-between">
                <dt className="text-sm text-slate-600">Device type</dt>
                <dd className="text-sm font-semibold text-slate-900">{repair.device_type}</dd>
              </div>
              {repair.brand && (
                <div className="flex justify-between">
                  <dt className="text-sm text-slate-600">Brand</dt>
                  <dd className="text-sm font-semibold text-slate-900">{repair.brand}</dd>
                </div>
              )}
              {repair.model && (
                <div className="flex justify-between">
                  <dt className="text-sm text-slate-600">Model</dt>
                  <dd className="text-sm font-semibold text-slate-900">{repair.model}</dd>
                </div>
              )}
              {repair.serial_number && (
                <div className="flex justify-between">
                  <dt className="text-sm text-slate-600">Serial number</dt>
                  <dd className="text-sm font-semibold text-slate-900">{repair.serial_number}</dd>
                </div>
              )}
            </dl>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">Problem description</h2>
            <p className="mt-4 text-sm text-slate-700">{repair.problem_description}</p>
            {repair.accessories_received && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-600">Accessories included: {repair.accessories_received}</p>
              </div>
            )}
          </div>

          {repair.quote_amount ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">Quote</h2>
              <div className="mt-4">
                <p className="text-2xl font-extrabold text-slate-900">{formatMoney(repair.quote_amount)}</p>
                <p className="mt-2 text-sm text-slate-600">
                  {repair.quote_approved_at ? "Approved" : "Awaiting your response"}
                </p>
              </div>
            </div>
          ) : null}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">Repair updates</h2>
          {repair.updates.length > 0 ? (
            <ol className="mt-4 space-y-4 border-l-2 border-slate-200 pl-4">
              {repair.updates.map((u, i) => (
                <li key={i} className="relative">
                  <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-brand-600 border-2 border-white" />
                  <p className="text-sm text-slate-900">{u.note}</p>
                  <p className="mt-1 text-xs text-slate-500">{formatDate(u.created_at)}</p>
                </li>
              ))}
            </ol>
          ) : (
            <div className="mt-4 text-center">
              <p className="text-sm text-slate-600">No updates have been posted yet. Our team will add updates as your repair progresses.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
