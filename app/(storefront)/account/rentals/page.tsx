import Link from "next/link";
import { getMyRentals } from "@/lib/data/account-rentals";
import { Badge } from "@/components/ui/badge";
import { getMyReviewStatuses } from "@/lib/data/customer-reviews";
import { CustomerReviewAction } from "@/components/storefront/customer-review-action";

const STATUS_VARIANT: Record<string, "neutral" | "success" | "warning" | "danger" | "info"> = {
  requested: "warning",
  approved: "info",
  ready: "info",
  active: "info",
  returned: "success",
  overdue: "danger",
  damaged: "danger",
  lost: "danger",
  cancelled: "neutral",
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-MW", { timeZone: "Africa/Blantyre", year: "numeric", month: "short", day: "numeric" });
}

export default async function AccountRentalsPage() {
  const rentals = await getMyRentals();
  const reviewStatuses = await getMyReviewStatuses({ rentalIds: rentals.map((rental) => rental.id) });

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-5">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-700">My activity</p>
        <h1 className="mt-1 text-2xl font-extrabold text-slate-950 sm:text-3xl">My rentals</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">Review booking periods, quantities and current status.</p>
      </div>

      {rentals.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-7 text-center shadow-sm sm:p-9">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-4 text-slate-300">
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
            <line x1="16" x2="16" y1="2" y2="6" />
            <line x1="8" x2="8" y1="2" y2="6" />
            <line x1="3" x2="21" y1="10" y2="10" />
          </svg>
          <h3 className="text-lg font-bold text-slate-950">No rental bookings yet</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">Explore available equipment and request a rental when you need it.</p>
          <Link
            href="/rentals"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-700 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
              <line x1="16" x2="16" y1="2" y2="6" />
              <line x1="8" x2="8" y1="2" y2="6" />
              <line x1="3" x2="21" y1="10" y2="10" />
            </svg>
            Browse Rentals
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {rentals.map((r) => (
            <article
              key={r.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-panel sm:p-5"
            >
              <Link href={`/account/rentals/${r.id}`} className="group flex items-start justify-between gap-4 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-base font-bold text-slate-950">{r.product_name ?? "Rental"}</p>
                    <Badge variant={STATUS_VARIANT[r.status] ?? "info"} className="text-xs">{r.status.replace(/_/g, " ")}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-slate-700">
                    {formatDate(r.start_date)} to {formatDate(r.end_date)} · Quantity {r.quantity}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">Booked {formatDate(r.created_at)}</p>
                </div>
                <span className="shrink-0 text-xs font-semibold text-brand-700 transition-colors group-hover:text-brand-900">View details</span>
              </Link>
              <CustomerReviewAction
                type="rental"
                transactionId={r.id}
                eligible={r.status === "returned"}
                review={reviewStatuses.rentals[r.id]}
                label="rental"
              />
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
