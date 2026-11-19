import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getMyRentalById } from "@/lib/data/account-rentals";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/format/money";
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

function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString("en-MW", { timeZone: "Africa/Blantyre", dateStyle: "medium", timeStyle: "short" });
}

export default async function AccountRentalDetailPage({ params }: { params: { id: string } }) {
  const rental = await getMyRentalById(params.id);
  if (!rental) notFound();
  const reviewStatuses = await getMyReviewStatuses({ rentalIds: [rental.id] });

  return (
    <div className="space-y-6">
      <header className="border-b border-slate-200 pb-5">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-700">Rental details</p>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-extrabold text-slate-950 sm:text-3xl">{rental.product_name ?? "Rental booking"}</h1>
          <Badge variant={STATUS_VARIANT[rental.status] ?? "info"}>{rental.status.replace(/_/g, " ")}</Badge>
        </div>
        <Link href="/account/rentals" className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-brand-700 transition-colors hover:text-brand-900">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6" />
            <path d="M9 18h6" />
          </svg>
          Back to rentals
        </Link>
        <CustomerReviewAction
          type="rental"
          transactionId={rental.id}
          eligible={rental.status === "returned"}
          review={reviewStatuses.rentals[rental.id]}
          label="rental"
        />
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 text-sm shadow-sm sm:p-6">
          {rental.image_url ? (
            <Image src={rental.image_url} alt="" width={96} height={96} className="mb-4 h-24 w-24 rounded-lg border border-slate-200 object-contain" />
          ) : null}
          <h2 className="mb-4 text-base font-semibold text-slate-950">Rental information</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="font-medium text-slate-700">Start date</span>
              <span className="text-slate-900">{formatDate(rental.start_date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-slate-700">End date</span>
              <span className="text-slate-900">{formatDate(rental.end_date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-slate-700">Quantity</span>
              <span className="text-slate-900">{rental.quantity}</span>
            </div>
            {rental.daily_rate !== null && (
              <div className="flex justify-between">
                <span className="font-medium text-slate-700">Daily rate</span>
                <span className="text-slate-900">{formatMoney(rental.daily_rate)}</span>
              </div>
            )}
            {rental.deposit_amount !== null && (
              <div className="flex justify-between">
                <span className="font-medium text-slate-700">Deposit</span>
                <span className="text-slate-900">{formatMoney(rental.deposit_amount)}</span>
              </div>
            )}
            {rental.total_charge !== null && (
              <div className="flex justify-between border-t border-slate-200 pt-3">
                <span className="font-semibold text-slate-900">Total charge</span>
                <span className="font-semibold text-slate-900">{formatMoney(rental.total_charge)}</span>
              </div>
            )}
          </div>
        </section>

        {rental.notes ? (
          <section className="rounded-xl border border-slate-200 bg-white p-5 text-sm sm:p-6">
            <h2 className="mb-4 text-base font-semibold text-slate-950">Additional requirements</h2>
            <p className="text-slate-700">{rental.notes}</p>
          </section>
        ) : null}
      </div>

      {rental.statusHistory.length > 0 ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_4px_18px_rgba(15,23,42,0.045)] sm:p-6">
          <h2 className="mb-4 text-base font-semibold text-slate-950">Status history</h2>
          <ol className="space-y-4 border-l border-slate-200 pl-4">
            {rental.statusHistory.map((event, i) => (
              <li key={i} className="relative text-sm text-slate-700">
                <div className="absolute -left-[21px] flex h-3 w-3 items-center justify-center rounded-full bg-brand-700 ring-4 ring-white"></div>
                <span className="font-semibold capitalize text-slate-950">{event.to_status.replace(/_/g, " ")}</span>
                <span className="ml-2 text-xs text-slate-500">{formatDateTime(event.created_at)}</span>
              </li>
            ))}
          </ol>
        </section>
      ) : null}
    </div>
  );
}
