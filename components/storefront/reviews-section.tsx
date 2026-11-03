import { getApprovedReviews, getReviewStats } from "@/lib/data/reviews";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/current-user";
import { ReviewPhotos } from "./review-photos";

function Stars({ rating }: { rating: number }) {
  return (
    <div aria-label={`${rating} out of 5 stars`} className="flex gap-0.5 text-amber-500">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} aria-hidden="true">
          {i < rating ? "★" : "☆"}
        </span>
      ))}
    </div>
  );
}

export async function ReviewsSection() {
  const reviews = await getApprovedReviews(3);
  const stats = await getReviewStats();
  const user = await getCurrentUser();

  if (reviews.length === 0) {
    return (
      <section aria-labelledby="customer-confidence-heading" className="section-shell py-14 sm:py-16 lg:py-20">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl space-y-3">
            <p className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-amber-800">
              Before you buy
            </p>
            <h2 id="customer-confidence-heading" className="text-h2 font-extrabold leading-tight text-slate-900">
              Customer reviews
            </h2>
            <p className="text-base leading-relaxed text-slate-600 sm:text-lg">
              No approved customer reviews yet. {user
                ? "If you have completed a purchase, rental or repair, choose Write a review to share your honest experience."
                : "If you have completed a purchase, rental or repair, sign in to share your honest experience."}
            </p>
          </div>
          {user ? (
            <Link href="/account/reviews/write" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-700 px-4 text-sm font-bold text-white hover:bg-emerald-800">
              Write a review
            </Link>
          ) : (
            <Link href="/sign-in?redirectTo=%2Faccount%2Freviews%2Fwrite" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-700 px-4 text-sm font-bold text-white hover:bg-emerald-800">
              Sign in to write a review
            </Link>
          )}
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="reviews-heading" className="section-shell py-14 sm:py-16 lg:py-20">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Customer feedback</p>
          <h2 id="reviews-heading" className="text-h2 font-bold text-slate-900">What customers say</h2>
          <div className="flex items-center gap-4">
            <p className="text-sm text-slate-600">
              <span className="font-semibold text-slate-900">{stats.totalReviews}</span> approved reviews across products and services
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link
            href="/reviews"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
          >
            View all reviews
          </Link>
          {user && (
            <Link
              href="/account/reviews/write"
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-700 px-4 text-sm font-bold text-white transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
            >
              Write a review
            </Link>
          )}
        </div>
      </div>
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        {(["product", "rental", "repair"] as const).map((type) => {
          const category = stats.byType[type];
          return (
            <div key={type} className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold capitalize text-slate-800">{type} reviews</p>
              {category.count ? (
                <p className="mt-1 text-sm text-slate-600">
                  <span className="font-bold text-slate-950">{category.averageRating.toFixed(1)} / 5</span>
                  {" · "}{category.count} approved
                </p>
              ) : <p className="mt-1 text-sm text-slate-500">No approved reviews yet</p>}
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {reviews.map((review) => (
          <figure key={review.id} className="rounded-xl border border-slate-200/60 bg-white p-6 shadow-lg shadow-slate-900/5">
            <div className="flex items-center justify-between">
              <Stars rating={review.rating} />
              {review.verified_purchase && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Verified
                </span>
              )}
            </div>
            {review.title ? <p className="mt-4 text-base font-semibold text-slate-900">{review.title}</p> : null}
            {review.comment ? <p className="mt-2 text-base leading-relaxed text-slate-600">{review.comment}</p> : null}
            <ReviewPhotos images={review.images} />
            {review.admin_response && (
              <div className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                <p className="font-semibold">Response from Classic Computers:</p>
                <p className="mt-1">{review.admin_response}</p>
              </div>
            )}
            {review.product ? (
              <figcaption className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                {review.product.name}
              </figcaption>
            ) : null}
          </figure>
        ))}
      </div>
    </section>
  );
}
