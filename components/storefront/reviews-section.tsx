import { getApprovedReviews, getReviewStats } from "@/lib/data/reviews";
import Link from "next/link";
import { ReviewPhotos } from "./review-photos";

function Stars({ rating }: { rating: number }) {
  return (
    <div aria-label={`${rating} out of 5 stars`} className="flex gap-0.5 text-amber-500">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} aria-hidden="true">{i < rating ? "★" : "☆"}</span>
      ))}
    </div>
  );
}

export async function ReviewsSection() {
  const reviews = await getApprovedReviews(3);
  if (reviews.length === 0) return null;

  const stats = await getReviewStats();

  return (
    <section aria-labelledby="reviews-heading" className="border-y border-slate-100 bg-slate-50/80">
      <div className="section-shell py-14 sm:py-16 lg:py-20">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <p className="section-kicker">Customer feedback</p>
            <h2 id="reviews-heading" className="section-heading">Experiences worth sharing</h2>
            <p className="section-description">
              {stats.totalReviews} approved customer {stats.totalReviews === 1 ? "review" : "reviews"} across products and services.
            </p>
          </div>
          <Link
            href="/reviews"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
          >
            Read customer reviews
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <figure key={review.id} className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-panel sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <Stars rating={review.rating} />
                {review.verified_purchase ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-800">
                    <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Verified
                  </span>
                ) : null}
              </div>
              {review.title ? <p className="mt-4 font-semibold text-navy-900">{review.title}</p> : null}
              {review.comment ? <blockquote className="mt-2 flex-1 text-sm leading-7 text-slate-600">{review.comment}</blockquote> : <div className="flex-1" />}
              <ReviewPhotos images={review.images} />
              {review.admin_response ? (
                <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
                  <p className="font-semibold text-navy-900">Response from Classic Computers</p>
                  <p className="mt-1 leading-relaxed">{review.admin_response}</p>
                </div>
              ) : null}
              {review.product ? (
                <figcaption className="mt-5 border-t border-slate-100 pt-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  {review.product.name}
                </figcaption>
              ) : null}
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
