import Link from "next/link";
import { getApprovedReviews, getReviewStats } from "@/lib/data/reviews";
import { getCurrentUser } from "@/lib/auth/current-user";
import type { ReviewType } from "@/types/catalog";
import { RatingBreakdown } from "./rating-breakdown";
import { ReviewPhotos } from "./review-photos";

const LABELS: Record<ReviewType, { heading: string; noun: string }> = {
  product: { heading: "Product reviews", noun: "products" },
  rental: { heading: "Rental experiences", noun: "rental equipment" },
  repair: { heading: "Repair and service reviews", noun: "repair services" },
};

function Stars({ rating }: { rating: number }) {
  return (
    <span aria-label={`${rating} out of 5 stars`} className="text-amber-500">
      {"★".repeat(Math.round(rating))}{"☆".repeat(5 - Math.round(rating))}
    </span>
  );
}

export async function ReviewCategorySection({ reviewType }: { reviewType: ReviewType }) {
  const [reviews, stats, user] = await Promise.all([
    getApprovedReviews(3, reviewType),
    getReviewStats(),
    getCurrentUser(),
  ]);
  const category = stats.byType[reviewType];
  const labels = LABELS[reviewType];

  return (
    <section aria-labelledby={`${reviewType}-reviews-heading`} className="section-shell py-10 sm:py-12">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-800">Customer feedback</p>
          <h2 id={`${reviewType}-reviews-heading`} className="mt-1 text-2xl font-extrabold text-slate-950">
            {labels.heading}
          </h2>
        </div>
        <Link href={`/reviews?type=${reviewType}`} className="text-sm font-semibold text-brand-800 underline underline-offset-4">
          View all
        </Link>
      </div>

      {category.count > 0 ? (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-extrabold text-slate-950">{category.averageRating.toFixed(1)}</span>
              <div>
                <Stars rating={category.averageRating} />
                <p className="text-sm text-slate-600">{category.count} approved review{category.count === 1 ? "" : "s"}</p>
              </div>
            </div>
            <div className="mt-4"><RatingBreakdown distribution={category.distribution} total={category.count} /></div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {reviews.map((review) => (
              <article key={review.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Stars rating={review.rating} />
                  {review.verified_purchase ? (
                    <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-brand-800">Verified transaction</span>
                  ) : null}
                </div>
                {review.title ? <h3 className="mt-3 font-bold text-slate-950">{review.title}</h3> : null}
                {review.comment ? <p className="mt-2 text-sm leading-6 text-slate-700">{review.comment}</p> : <p className="mt-2 text-sm text-slate-500">Rating submitted without a written comment.</p>}
                <ReviewPhotos images={review.images} />
                {review.admin_response ? (
                  <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                    <p className="font-semibold">Response from Classic Computers</p>
                    <p className="mt-1">{review.admin_response}</p>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 sm:p-8">
          <p className="font-semibold text-slate-900">No approved {reviewType} reviews yet</p>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Have you completed a transaction with us? {user
              ? "Write a review after your transaction is complete."
              : "Sign in to share honest feedback after your transaction is complete."}
          </p>
          <Link
            href={user ? "/account/reviews/write" : "/sign-in?redirectTo=%2Faccount%2Freviews%2Fwrite"}
            className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-700 px-4 text-sm font-bold text-white hover:bg-brand-800"
          >
            {user ? "Write a review" : "Sign in to write a review"}
          </Link>
        </div>
      )}
    </section>
  );
}
