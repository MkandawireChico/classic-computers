import { getApprovedReviews } from "@/lib/data/reviews";

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

  // Clean omission, per the brief, if there are no approved reviews yet —
  // no invented testimonials, no empty-state placeholder on the homepage.
  if (reviews.length === 0) return null;

  return (
    <section className="section-shell py-10 sm:py-12">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Feedback</p>
        <h2 className="mt-1 text-2xl font-bold text-gray-900">What customers say</h2>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {reviews.map((review) => (
          <figure key={review.id} className="rounded-md border border-surface-border bg-white p-5 shadow-sm">
            <Stars rating={review.rating} />
            {review.title ? <p className="mt-3 text-sm font-semibold text-gray-900">{review.title}</p> : null}
            {review.comment ? <p className="mt-2 text-sm leading-6 text-gray-600">{review.comment}</p> : null}
            {review.product ? (
              <figcaption className="mt-3 text-xs font-medium uppercase tracking-[0.12em] text-gray-400">
                {review.product.name}
              </figcaption>
            ) : null}
          </figure>
        ))}
      </div>
    </section>
  );
}
