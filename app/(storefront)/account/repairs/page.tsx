import Link from "next/link";
import { getMyRepairs } from "@/lib/data/account-repairs";
import { Badge } from "@/components/ui/badge";
import { getMyReviewStatuses } from "@/lib/data/customer-reviews";
import { CustomerReviewAction } from "@/components/storefront/customer-review-action";

const STATUS_VARIANT: Record<string, "neutral" | "success" | "warning" | "danger" | "info"> = {
  checked_in: "warning",
  diagnosing: "info",
  quoted: "info",
  awaiting_approval: "warning",
  in_progress: "info",
  ready_for_pickup: "info",
  completed: "success",
  cancelled: "danger",
};

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-MW", {
    timeZone: "Africa/Blantyre",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function AccountRepairsPage() {
  const repairs = await getMyRepairs();
  const reviewStatuses = await getMyReviewStatuses({ repairIds: repairs.map((repair) => repair.id) });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="border-b border-slate-200 pb-5">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-800">My activity</p>
          <h1 className="mt-1 text-2xl font-extrabold text-slate-950 sm:text-3xl">My repairs</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">Track service progress and review updates from our team.</p>
        </div>
        <Link
          href="/repairs/book"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-black/15 transition-colors hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-400/60"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
          Book a Repair
        </Link>
      </div>

      {repairs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center sm:p-8">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-4 text-slate-300">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
          <h3 className="text-lg font-semibold text-slate-900">No repair requests yet</h3>
          <p className="mt-2 text-sm text-slate-600">Book a repair when you need device service</p>
        </div>
      ) : (
        <div className="space-y-3">
          {repairs.map((r) => (
            <article
              key={r.id}
              className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5"
            >
              <Link href={`/account/repairs/${r.id}`} className="group flex items-start justify-between gap-4 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="break-all text-base font-bold text-slate-950">{r.ticket_number}</p>
                    <Badge variant={STATUS_VARIANT[r.status] ?? "neutral"} className="text-xs">
                      {r.status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-slate-700">{r.device_type}</p>
                  <p className="mt-1 text-xs text-slate-500">Opened {new Date(r.created_at).toLocaleDateString("en-MW", { timeZone: "Africa/Blantyre", year: "numeric", month: "short", day: "numeric" })}</p>
                  <p className="mt-1 text-xs text-slate-500">Submitted {formatDate(r.created_at)}</p>
                </div>
                <span className="text-xs font-semibold text-emerald-700 transition-colors group-hover:text-emerald-900">View details</span>
              </Link>
              <CustomerReviewAction
                type="repair"
                transactionId={r.id}
                eligible={r.status === "completed"}
                review={reviewStatuses.repairs[r.id]}
                label="repair"
              />
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
