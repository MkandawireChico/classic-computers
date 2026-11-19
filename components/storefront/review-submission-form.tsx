"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { submitReviewAction } from "@/app/(storefront)/account/reviews/write/actions";
import type { ReviewType } from "@/types/catalog";

export interface ReviewableTransaction {
  id: string;
  type: ReviewType;
  reference: string;
  description: string;
  date: string;
  productId?: string;
  imageUrl?: string | null;
}

export function ReviewSubmissionForm({
  transaction,
  returnHref,
}: {
  transaction: ReviewableTransaction;
  returnHref: string;
}) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [successWarning, setSuccessWarning] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (isPending) return;
    setError(null);
    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }

    setIsPending(true);
    try {
      const request = new FormData();
      request.set("review", JSON.stringify({
        review_type: transaction.type,
        product_id: transaction.productId,
        order_id: transaction.type === "product" ? transaction.id : undefined,
        rental_booking_id: transaction.type === "rental" ? transaction.id : undefined,
        repair_ticket_id: transaction.type === "repair" ? transaction.id : undefined,
        rating,
        title: title.trim() || undefined,
        comment: comment.trim() || undefined,
      }));
      images.forEach((image) => request.append("images", image));
      const result = await submitReviewAction(request);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setSuccessWarning(result.warning ?? null);
      setSuccess(true);
    } catch (submissionError) {
      console.error("Review form submission failed:", submissionError);
      setError("We could not submit your review. Please check your connection and try again.");
    } finally {
      setIsPending(false);
    }
  }

  if (success) {
    return (
      <div className="space-y-4">
        <Alert variant="success" className="space-y-2">
          <p className="font-semibold">Review submitted</p>
          <p className="text-sm">Your review is pending moderation and will appear publicly only if approved.</p>
          {successWarning ? <p role="status" className="text-sm">{successWarning}</p> : null}
          <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-900">
            Pending moderation
          </span>
        </Alert>
        <Link href={returnHref} className="inline-flex min-h-11 items-center rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          Return to transaction
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error ? <Alert variant="danger">{error}</Alert> : null}

      <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
        {transaction.imageUrl ? (
          <Image src={transaction.imageUrl} alt="" width={80} height={80} className="h-20 w-20 shrink-0 rounded-lg border border-slate-200 bg-white object-contain" />
        ) : null}
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-brand-800">{transaction.type} review</p>
          <h2 className="mt-1 font-bold text-slate-950">{transaction.description}</h2>
          <p className="mt-1 text-sm text-slate-600">{transaction.reference}</p>
        </div>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold text-slate-800">Rating <span className="text-rose-600">*</span></legend>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onFocus={() => setHoverRating(star)}
              onBlur={() => setHoverRating(0)}
              aria-label={`Rate ${star} out of 5 stars`}
              aria-pressed={rating === star}
              className="rounded px-0.5 text-3xl leading-tight transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            >
              <span className={star <= (hoverRating || rating) ? "text-amber-500" : "text-slate-300"} aria-hidden="true">★</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-500">{rating ? `${rating} out of 5 stars` : "Choose a rating"}</p>
      </fieldset>

      <div className="space-y-2">
        <label htmlFor="review-title" className="text-sm font-semibold text-slate-800">Review title (optional)</label>
        <input
          id="review-title"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={200}
          placeholder="Summarize your experience"
          className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-brand-600 focus:ring-4 focus:ring-brand-100"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="review-comment" className="text-sm font-semibold text-slate-800">Your review (optional)</label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          maxLength={2000}
          rows={5}
          placeholder="Add a few details if you would like to explain your rating."
          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none focus:border-brand-600 focus:ring-4 focus:ring-brand-100"
        />
        <p className="text-xs text-slate-500">{comment.length}/2000 characters. A written comment is optional.</p>
      </div>

      <div className="space-y-2">
        <label htmlFor="review-photos" className="text-sm font-semibold text-slate-800">Photos (optional, up to 5)</label>
        <input
          id="review-photos"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={(event) => {
            const selected = Array.from(event.target.files ?? []);
            if (selected.length > 5 || selected.some((file) => file.size > 5 * 1024 * 1024)) {
              setError(selected.length > 5 ? "You can attach up to 5 photos." : "Each photo must be smaller than 5MB.");
              event.target.value = "";
              setImages([]);
              return;
            }
            setError(null);
            setImages(selected);
          }}
          className="block min-h-11 w-full rounded-xl border border-slate-300 bg-white p-2 text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-2 file:font-semibold file:text-brand-800"
        />
        <p className="text-xs text-slate-500">JPEG, PNG or WebP. Maximum 5MB per image.</p>
      </div>

      <Button
        type="submit"
        isLoading={isPending}
        disabled={isPending || rating === 0}
        className="min-h-12 w-full rounded-xl bg-brand-700 text-sm font-extrabold hover:bg-brand-800"
      >
        Submit Review
      </Button>
    </form>
  );
}
