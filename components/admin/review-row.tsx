"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { moderateReviewAction } from "@/app/admin/reviews/actions";
import type { AdminReview } from "@/lib/data/admin/reviews";

const STATUS_VARIANT: Record<string, "neutral" | "success" | "warning" | "danger"> = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
  hidden: "neutral",
};

export function ReviewRow({ review }: { review: AdminReview }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function moderate(status: "approved" | "rejected" | "hidden") {
    startTransition(async () => {
      await moderateReviewAction({ reviewId: review.id, status });
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-2 border-b border-surface-border p-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-amber-500">{"★".repeat(review.rating)}</span>
          <Badge variant={STATUS_VARIANT[review.status] ?? "neutral"}>{review.status}</Badge>
        </div>
        {review.title ? <p className="mt-1 text-sm font-medium text-gray-900">{review.title}</p> : null}
        {review.comment ? <p className="text-sm text-gray-600">{review.comment}</p> : null}
        <p className="mt-1 text-xs text-gray-400">
          {review.product_name ?? "Unknown product"} · {review.customer_name ?? "Unknown customer"}
        </p>
      </div>
      <div className="flex gap-2">
        {review.status !== "approved" ? (
          <button type="button" disabled={isPending} onClick={() => moderate("approved")} className="text-xs text-status-success hover:underline">
            Approve
          </button>
        ) : null}
        {review.status !== "rejected" ? (
          <button type="button" disabled={isPending} onClick={() => moderate("rejected")} className="text-xs text-status-danger hover:underline">
            Reject
          </button>
        ) : null}
        {review.status !== "hidden" ? (
          <button type="button" disabled={isPending} onClick={() => moderate("hidden")} className="text-xs text-gray-500 hover:underline">
            Hide
          </button>
        ) : null}
      </div>
    </div>
  );
}
