"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { moderateReviewAction, respondToReviewAction } from "@/app/admin/reviews/actions";
import type { AdminReview } from "@/lib/data/admin/reviews";

const STATUS_VARIANT: Record<string, "neutral" | "success" | "warning" | "danger"> = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
  hidden: "neutral",
};

const TYPE_LABEL: Record<string, string> = {
  product: "Product",
  rental: "Rental",
  repair: "Repair",
};

export function ReviewRow({ review, canModerate }: { review: AdminReview; canModerate: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [response, setResponse] = useState(review.admin_response || "");
  const [responseError, setResponseError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  function moderate(status: "approved" | "rejected" | "hidden") {
    setActionMessage(null);
    setActionError(null);
    startTransition(async () => {
      const result = await moderateReviewAction({ reviewId: review.id, status });
      if (!result.success) {
        setActionError(result.error);
        return;
      }
      setActionMessage(`Review ${status}.`);
      router.refresh();
    });
  }

  function submitResponse() {
    setResponseError(null);
    if (response.trim().length < 1) {
      setResponseError("Response cannot be empty");
      return;
    }
    startTransition(async () => {
      const result = await respondToReviewAction({ reviewId: review.id, response: response.trim() });
      if (!result.success) {
        setResponseError(result.error);
        return;
      }
      setShowResponseForm(false);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-3 border-b border-surface-border p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-amber-500 text-lg">{"★".repeat(review.rating)}</span>
            <Badge variant={STATUS_VARIANT[review.status] ?? "neutral"}>{review.status}</Badge>
            <Badge variant="neutral">{TYPE_LABEL[review.review_type] || review.review_type}</Badge>
            {review.verified_purchase && (
              <Badge variant="success">Verified</Badge>
            )}
          </div>
          {review.title ? <p className="mt-2 text-sm font-medium text-gray-900">{review.title}</p> : null}
          {review.comment ? <p className="mt-1 text-sm text-gray-600">{review.comment}</p> : null}
          <p className="mt-2 text-xs text-gray-500">
            {review.review_type === "product" && review.product_name ? `${review.product_name} · ` : ""}
            Transaction: {review.transaction_reference} · Customer: {review.customer_name ?? "Unknown customer"}
          </p>
          <p className="text-xs text-gray-400">
            {new Date(review.created_at).toLocaleDateString()} {review.updated_at !== review.created_at ? `· Updated ${new Date(review.updated_at).toLocaleDateString()}` : ""}
          </p>
        </div>
        {canModerate ? <div className="flex gap-2 sm:flex-col sm:items-end">
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
          <button
            type="button"
            disabled={isPending}
            onClick={() => setShowResponseForm(!showResponseForm)}
            className="text-xs text-brand-600 hover:underline"
          >
            {review.admin_response ? "Edit response" : "Respond"}
          </button>
        </div> : null}
      </div>

      {actionError ? <p role="alert" className="text-sm text-status-danger">{actionError}</p> : null}
      {actionMessage ? <p role="status" className="text-sm text-status-success">{actionMessage}</p> : null}
      {showResponseForm && (
        <div className="space-y-2 rounded-lg bg-slate-50 p-3">
          <textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Write a response to this review..."
            rows={3}
            className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
          {responseError && <p className="text-xs text-status-danger">{responseError}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              disabled={isPending}
              onClick={submitResponse}
              className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
            >
              Save response
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => setShowResponseForm(false)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-slate-100"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {review.admin_response && !showResponseForm && (
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs font-semibold text-gray-900">Response from Classic Computers:</p>
          <p className="mt-1 text-sm text-gray-600">{review.admin_response}</p>
          {review.admin_response_at && (
            <p className="mt-1 text-xs text-gray-400">
              {new Date(review.admin_response_at).toLocaleDateString()}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
