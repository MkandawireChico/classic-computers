import { getApprovedReviews } from "@/lib/data/reviews";
import Link from "next/link";

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

  if (reviews.length === 0) {
    return (
      <section aria-labelledby="customer-confidence-heading" className="section-shell py-14 sm:py-16 lg:py-20">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl space-y-3">
            <p className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-amber-800">
              Before you buy
            </p>
            <h2 id="customer-confidence-heading" className="text-h2 font-extrabold leading-tight text-slate-900">
              Shop with <span className="text-emerald-700">clarity</span>
            </h2>
            <p className="text-base leading-relaxed text-slate-600 sm:text-lg">
              Helpful information before you buy. Review product details and contact our team if you need help with an order or enquiry.
            </p>
          </div>
          <div aria-hidden="true" className="hidden h-1.5 w-28 shrink-0 rounded-full bg-gradient-to-r from-amber-400 via-emerald-500 to-brand-500 sm:mb-2 sm:block" />
        </div>
        <div className="grid items-stretch gap-4 sm:grid-cols-3 sm:gap-5">
          {[
            { href: "/warranty", title: "Warranty information", description: "Read the store warranty policy.", accent: "border-t-amber-400 group-hover:bg-amber-50/60", icon: "✓", iconStyle: "bg-amber-100 text-amber-800" },
            { href: "/returns", title: "Returns policy", description: "See the returns terms before purchase.", accent: "border-t-emerald-500 group-hover:bg-emerald-50/60", icon: "↺", iconStyle: "bg-emerald-100 text-emerald-800" },
            { href: "/contact", title: "Contact the team", description: "Get in touch with Classic Computers.", accent: "border-t-brand-500 group-hover:bg-brand-50/60", icon: "↗", iconStyle: "bg-brand-100 text-brand-800" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 sm:p-6 ${item.accent}`}
            >
              <span className={`mb-5 flex h-11 w-11 items-center justify-center rounded-xl text-xl font-bold ${item.iconStyle}`} aria-hidden="true">{item.icon}</span>
              <h3 className="text-lg font-bold leading-snug text-slate-900">{item.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600 sm:text-base">{item.description}</p>
              <span className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-brand-700">
                Learn more <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
              </span>
            </Link>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="reviews-heading" className="section-shell py-14 sm:py-16 lg:py-20">
      <div className="mb-8 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Customer feedback</p>
        <h2 id="reviews-heading" className="text-h2 font-bold text-slate-900">What customers say</h2>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {reviews.map((review) => (
          <figure key={review.id} className="rounded-xl border border-slate-200/60 bg-white p-6 shadow-lg shadow-slate-900/5">
            <Stars rating={review.rating} />
            {review.title ? <p className="mt-4 text-base font-semibold text-slate-900">{review.title}</p> : null}
            {review.comment ? <p className="mt-2 text-base leading-relaxed text-slate-600">{review.comment}</p> : null}
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
