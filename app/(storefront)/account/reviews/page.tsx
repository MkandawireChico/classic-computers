import Link from "next/link";
import { getMyReviews } from "@/lib/data/customer-reviews";

const STATUS_LABEL = {
  pending: "Pending moderation",
  approved: "Approved",
  rejected: "Rejected",
  hidden: "Hidden",
} as const;

const STATUS_CLASS = {
  pending: "bg-amber-50 text-amber-800",
  approved: "bg-emerald-50 text-emerald-800",
  rejected: "bg-rose-50 text-rose-800",
  hidden: "bg-slate-100 text-slate-700",
} as const;

function resubmitHref(review: Awaited<ReturnType<typeof getMyReviews>>[number]): string | null {
  const query = new URLSearchParams({ type: review.review_type });
  if (review.review_type === "product" && review.order_id && review.product_id) {
    query.set("transactionId", review.order_id);
    query.set("productId", review.product_id);
  } else if (review.review_type === "rental" && review.rental_booking_id) {
    query.set("transactionId", review.rental_booking_id);
  } else if (review.review_type === "repair" && review.repair_ticket_id) {
    query.set("transactionId", review.repair_ticket_id);
  } else {
    return null;
  }
  return `/account/reviews/write?${query.toString()}`;
}

export default async function MyReviewsPage() {
  const reviews = await getMyReviews();

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-800">My activity</p>
          <h1 className="mt-1 text-2xl font-extrabold text-slate-950 sm:text-3xl">My reviews</h1>
          <p className="mt-2 text-sm text-slate-600">Track moderation and read responses to your feedback.</p>
        </div>
        <Link href="/account/reviews/write" className="inline-flex min-h-11 items-center rounded-lg bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800">
          Find an eligible transaction
        </Link>
      </header>

      {reviews.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center">
          <h2 className="font-bold text-slate-950">You haven&apos;t submitted any reviews yet</h2>
          <p className="mt-2 text-sm text-slate-600">Review links are available on completed orders, returned rentals and completed repairs.</p>
          <Link href="/account/reviews/write" className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-emerald-700 px-4 text-sm font-semibold text-white">Find a transaction</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => {
            const retryHref = review.status === "rejected" ? resubmitHref(review) : null;
            return (
              <article key={review.id} className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-emerald-800">{review.review_type} review</p>
                    <h2 className="mt-1 font-bold text-slate-950">{review.product?.name ?? review.title ?? "Customer experience"}</h2>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_CLASS[review.status]}`}>
                    {STATUS_LABEL[review.status]}
                  </span>
                </div>
                <p className="mt-3 text-amber-500" aria-label={`${review.rating} out of 5 stars`}>
                  {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                </p>
                {review.title ? <h3 className="mt-2 font-semibold text-slate-900">{review.title}</h3> : null}
                <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-700">{review.comment}</p>
                <p className="mt-3 text-xs text-slate-500">Submitted {new Date(review.created_at).toLocaleDateString("en-MW", { timeZone: "Africa/Blantyre", dateStyle: "long" })}</p>
                {review.admin_response ? (
                  <div className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                    <p className="font-semibold">Response from Classic Computers</p>
                    <p className="mt-1">{review.admin_response}</p>
                    {review.admin_response_at ? <p className="mt-2 text-xs text-slate-500">{new Date(review.admin_response_at).toLocaleDateString("en-MW", { timeZone: "Africa/Blantyre", dateStyle: "long" })}</p> : null}
                  </div>
                ) : null}
                {retryHref ? <Link href={retryHref} className="mt-4 inline-flex min-h-10 items-center rounded-lg border border-emerald-700 px-3 text-sm font-semibold text-emerald-800 hover:bg-emerald-50">Resubmit review</Link> : null}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
