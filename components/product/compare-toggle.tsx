"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toggleCompareAction } from "@/app/(storefront)/compare/actions";

export function CompareToggle({ productId, isComparing }: { productId: string; isComparing: boolean }) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleToggle() {
    if (isPending) return;
    setIsPending(true);
    setMessage(null);
    try {
      const result = await toggleCompareAction(productId);
      if (result.limitReached) {
        setMessage("You can compare up to 4 products. Remove one from your comparison first.");
        return;
      }
      router.refresh();
    } catch {
      setMessage("Unable to update your comparison. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void handleToggle();
        }}
        disabled={isPending}
        aria-pressed={isComparing}
        aria-label={isComparing ? "Remove from compare" : "Add to compare"}
        className={`rounded-full border px-2 py-0.5 text-[11px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1 disabled:opacity-50 ${
          isComparing
            ? "border-brand-500 bg-brand-500 text-white"
            : "border-surface-border bg-surface/90 text-gray-600 hover:bg-surface"
        }`}
      >
        {isPending ? "Saving…" : isComparing ? "Comparing" : "Compare"}
      </button>
      {message ? <span role="status" className="max-w-48 text-[11px] leading-4 text-red-700">{message}</span> : null}
    </div>
  );
}
