import { getPublicReviewsPage, getReviewStats } from "@/lib/data/reviews";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/current-user";
import { Pagination } from "@/components/storefront/pagination";
import { RatingBreakdown } from "@/components/storefront/rating-breakdown";
import type { ReviewType } from "@/types/catalog";
import { ReviewPhotos } from "@/components/storefront/review-photos";

type SearchParams = Record<string, string | string[] | undefined>;

const REVIEW_TYPES: ReviewType[] = ["product", "rental", "repair"];

function Stars({ rating }: { rating: number }) {
  return (
    <div aria-label={`${rating} out of 5 stars`} className="flex gap-0.5 text-amber-500">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} aria-hidden="true">{i < rating ? "★" : "☆"}</span>
      ))}
    </div>
  );
}

export default async function ReviewsPage({ searchParams }: { searchParams: SearchParams }) {
  const rawType = typeof searchParams.type === "string" ? searchParams.type : undefined;
  const reviewType = REVIEW_TYPES.find((type) => type === rawType);
  const parsedRating = typeof searchParams.rating === "string" ? Number(searchParams.rating) : 0;
  const rating = Number.isInteger(parsedRating) && parsedRating >= 1 && parsedRating <= 5 ? parsedRating : undefined;
  const sort = searchParams.sort === "highest" ? "highest" : "newest";
  const parsedPage = typeof searchParams.page === "string" ? Number(searchParams.page) : 1;
  const page = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const [result, stats, user] = await Promise.all([
    getPublicReviewsPage({ reviewType, rating, sort, page, pageSize: 10 }),
    getReviewStats(),
    getCurrentUser(),
  ]);
  const categories = reviewType ? [reviewType] : REVIEW_TYPES;
  const distribution = categories.reduce(
    (combined, type) => {
      for (const star of [1, 2, 3, 4, 5] as const) {
        combined[star] += stats.byType[type].distribution[star];
      }
      return combined;
    },
    { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  );
  const distributionTotal = Object.values(distribution).reduce((sum, count) => sum + count, 0);

  return (
    <main className="min-h-screen bg-[#f4f6f7]"><div className="section-shell py-10 sm:py-14 lg:py-16">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 space-y-4 rounded-[1.5rem] border border-slate-200 bg-gradient-to-br from-brand-50 via-white to-cyan-50 p-6 text-navy-900 shadow-sm sm:p-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-800">Customer feedback</p>
          <h1 className="text-3xl font-semibold tracking-tight text-navy-950 sm:text-4xl">Customer reviews</h1>
          <p className="max-w-2xl text-sm leading-6 text-slate-700">
            Reviews are shown after moderation. Ratings are reported separately for products, rentals and repairs.
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {REVIEW_TYPES.map((type) => {
              const category = stats.byType[type];
              return (
                <section key={type} className="rounded-xl border border-slate-200 bg-white p-4" aria-label={`${type} review statistics`}>
                  <h2 className="text-sm font-bold capitalize text-navy-900">{type}</h2>
                  {category.count ? (
                    <p className="mt-1 text-sm text-slate-700">
                      <span className="font-bold text-navy-950">{category.averageRating.toFixed(1)} / 5</span>
                      {" · "}{category.count} approved review{category.count === 1 ? "" : "s"}
                    </p>
                  ) : <p className="mt-1 text-sm text-slate-600">No approved reviews yet</p>}
                </section>
              );
            })}
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <h2 className="mb-3 text-sm font-bold text-navy-900">
              {reviewType ? `${reviewType.charAt(0).toUpperCase()}${reviewType.slice(1)} rating distribution` : "Approved ratings distribution"}
            </h2>
            <div className="max-w-md">
              <RatingBreakdown distribution={distribution} total={distributionTotal} />
            </div>
          </div>
        </header>

        <div className="mb-6 flex flex-col gap-3">
          <form method="get" className="grid gap-2 rounded-xl border border-slate-200 bg-white p-3 sm:grid-cols-[1fr_1fr_1fr_auto]">
            <label className="sr-only" htmlFor="review-type-filter">Review type</label>
            <select id="review-type-filter" name="type" defaultValue={reviewType ?? ""} className="min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700">
              <option value="">All types</option>
              <option value="product">Products</option>
              <option value="rental">Rentals</option>
              <option value="repair">Repairs</option>
            </select>
            <label className="sr-only" htmlFor="review-rating-filter">Star rating</label>
            <select id="review-rating-filter" name="rating" defaultValue={rating ?? ""} className="min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700">
              <option value="">All star ratings</option>
              {[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} stars</option>)}
            </select>
            <label className="sr-only" htmlFor="review-sort">Sort reviews</label>
            <select id="review-sort" name="sort" defaultValue={sort} className="min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700">
              <option value="newest">Newest first</option>
              <option value="highest">Highest rated</option>
            </select>
            <button type="submit" className="min-h-11 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800">
              Apply filters
            </button>
          </form>
          {(reviewType || rating || sort !== "newest") ? (
            <Link href="/reviews" className="self-start text-sm font-semibold text-cyan-800 underline underline-offset-4">Clear filters</Link>
          ) : null}
        </div>

        {result.items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-7 text-center sm:p-10">
            <h2 className="text-lg font-bold text-slate-950">No reviews match these filters</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
              {stats.totalReviews === 0
                ? `No approved reviews have been published yet. Customers with completed transactions can ${user ? "write a review from their account" : "sign in to share their honest feedback"}.`
                : "Try changing the review type or star rating to see other approved reviews."}
            </p>
            {user ? (
              <Link href="/account/reviews/write" className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#0b2238] px-4 text-sm font-bold text-white hover:bg-cyan-800">
                Write a review
              </Link>
            ) : (
              <Link href="/sign-in?redirectTo=%2Faccount%2Freviews%2Fwrite" className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#0b2238] px-4 text-sm font-bold text-white hover:bg-cyan-800">
                Sign in to write a review
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {result.items.map((review) => (
              <article key={review.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <Stars rating={review.rating} />
                      {review.verified_purchase ? (
                        <span className="rounded-full bg-cyan-50 px-2 py-1 text-xs font-semibold text-cyan-800">Verified transaction</span>
                      ) : null}
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold capitalize text-slate-600">{review.review_type}</span>
                    </div>
                    {review.title ? <h2 className="mt-3 text-lg font-bold text-slate-950">{review.title}</h2> : null}
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{review.comment}</p>
                    <ReviewPhotos images={review.images} />
                    {review.admin_response ? (
                      <div className="mt-4 rounded-lg bg-slate-50 p-4">
                        <p className="text-sm font-semibold text-slate-900">Response from Classic Computers</p>
                        <p className="mt-1 text-sm leading-6 text-slate-600">{review.admin_response}</p>
                      </div>
                    ) : null}
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <time dateTime={review.created_at}>{new Date(review.created_at).toLocaleDateString("en-MW", { year: "numeric", month: "long", day: "numeric" })}</time>
                      {review.product ? <span>· {review.product.name}</span> : null}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        <Pagination
          page={result.page}
          pageSize={result.pageSize}
          total={result.total}
          basePath="/reviews"
          searchParams={searchParams}
        />
      </div>
    </div></main>
  );
}
