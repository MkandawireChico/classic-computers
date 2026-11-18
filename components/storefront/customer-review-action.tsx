import Link from "next/link";
import type { CustomerReviewStatus } from "@/lib/data/customer-reviews";
import type { ReviewType } from "@/types/catalog";

const STATUS_LABEL: Record<CustomerReviewStatus["status"], string> = {
  pending: "Pending moderation",
  approved: "Approved",
  rejected: "Rejected — resubmission available",
  hidden: "Hidden by moderation",
};

export function CustomerReviewAction({
  type,
  transactionId,
  productId,
  eligible,
  review,
  label,
}: {
  type: ReviewType;
  transactionId: string;
  productId?: string;
  eligible: boolean;
  review?: CustomerReviewStatus;
  label: string;
}) {
  const query = new URLSearchParams({ type, transactionId });
  if (productId) query.set("productId", productId);
  const reviewUrl = `/account/reviews/write?${query.toString()}`;

  return (
    <div className="mt-3 space-y-2">
      {review ? (
        <div>
          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
            review.status === "approved" ? "bg-brand-50 text-brand-800"
              : review.status === "rejected" ? "bg-rose-50 text-rose-800"
                : review.status === "hidden" ? "bg-slate-100 text-slate-700"
                  : "bg-amber-50 text-amber-800"
          }`}>
            {STATUS_LABEL[review.status]}
          </span>
          {review.admin_response ? (
            <p className="mt-2 text-sm leading-5 text-slate-600">
              <span className="font-semibold text-slate-800">Response from Classic Computers:</span>{" "}
              {review.admin_response}
            </p>
          ) : null}
          {review.status === "rejected" ? (
            <Link href={reviewUrl} className="mt-2 inline-flex min-h-10 items-center rounded-lg bg-brand-700 px-3 text-sm font-semibold text-white hover:bg-brand-800">
              Resubmit review
            </Link>
          ) : null}
        </div>
      ) : eligible ? (
        <Link href={reviewUrl} className="inline-flex min-h-10 items-center rounded-lg border border-brand-700 px-3 text-sm font-semibold text-brand-800 hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2">
          Review this {label}
        </Link>
      ) : (
        <p className="text-xs text-slate-500">Not yet eligible to review</p>
      )}
    </div>
  );
}
