import { getApprovedReviews, getReviewStats } from "@/lib/data/reviews";
import { getBusinessInfo } from "@/lib/data/site-settings";
import Link from "next/link";
import { ReviewPhotos } from "./review-photos";

function Stars({ rating }: { rating: number }) {
  return (
    <div role="img" aria-label={`${rating} out of 5 stars`} className="flex shrink-0 gap-0.5 text-amber-500">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} aria-hidden="true">{i < rating ? "★" : "☆"}</span>
      ))}
    </div>
  );
}

export async function ReviewsSection() {
  const [reviews, stats, businessInfo] = await Promise.all([
    getApprovedReviews(3),
    getReviewStats(),
    getBusinessInfo(),
  ]);
  const whatsappNumber = businessInfo?.whatsapp?.replace(/\\D/g, "") ?? "";
  const feedbackMessage = encodeURIComponent("Hello Classic Computers, I would like to share feedback about my customer experience.");

  return (
    <section aria-labelledby="reviews-heading" className="border-y border-surface-border bg-surface-muted">
      <div className="section-shell py-14 sm:py-16 lg:py-20">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <p className="section-kicker">Customer feedback</p>
            <h2 id="reviews-heading" className="section-heading">What customers say</h2>
            <p className="section-description">
              {stats.totalReviews > 0
                ? `${stats.totalReviews} approved customer ${stats.totalReviews === 1 ? "review" : "reviews"} across products and services.`
                : "Feedback from customers who have completed a purchase, rental or repair."}
            </p>
            {stats.totalReviews > 0 ? (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-sm text-slate-600">
                <span className="font-bold text-navy-900">
                  {(Object.values(stats.byType).reduce((sum, item) => sum + item.averageRating * item.count, 0) / stats.totalReviews).toFixed(1)} / 5
                </span>
                <span aria-hidden="true" className="text-amber-500">★★★★★</span>
                <span>Based on approved customer reviews</span>
              </div>
            ) : null}
          </div>
          <Link
            href="/reviews"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
          >
            Read customer reviews
          </Link>
        </div>

        {reviews.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review) => (
              <figure key={review.id} className="flex h-full min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-panel sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
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
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                  <span className="font-semibold capitalize text-slate-600">{review.review_type} review</span>
                  <time dateTime={review.created_at}>
                    {new Date(review.created_at).toLocaleDateString("en-MW", { day: "numeric", month: "short", year: "numeric", timeZone: "Africa/Blantyre" })}
                  </time>
                </div>
                {review.title ? <p className="mt-3 break-words font-semibold text-navy-900">{review.title}</p> : null}
                {review.comment ? <blockquote className="mt-2 flex-1 break-words text-sm leading-7 text-slate-600">{review.comment}</blockquote> : <div className="flex-1" />}
                <ReviewPhotos images={review.images} />
                {review.admin_response ? (
                  <div className="mt-4 min-w-0 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
                    <p className="font-semibold text-navy-900">Response from Classic Computers</p>
                    <p className="mt-1 break-words leading-relaxed">{review.admin_response}</p>
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
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center sm:px-10">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-brand-700">Your feedback matters</p>
            <h3 className="mt-3 text-xl font-bold text-navy-900">Be the first to share your experience.</h3>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
              We publish customer feedback after moderation. If you have completed a purchase, rental or repair with Classic Computers, sign in to your account to check your review options.
            </p>
            <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/account"
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-700 px-5 text-sm font-semibold text-white transition hover:bg-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
              >
                Sign in to submit a review
              </Link>
              {whatsappNumber ? (
                <a
                  href={`https://wa.me/${whatsappNumber}?text=${feedbackMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 px-5 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
                >
                  Share feedback on WhatsApp
                </a>
              ) : null}
              {businessInfo?.email ? (
                <a
                  href={`mailto:${businessInfo.email}?subject=${encodeURIComponent("Customer feedback")}`}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
                >
                  Email us
                </a>
              ) : null}
            </div>
            <p className="mt-4 text-xs leading-5 text-slate-500">
              You are also welcome to share feedback with our team in store.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
