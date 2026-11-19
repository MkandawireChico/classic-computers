"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toggleWishlistAction } from "./actions";

export function RemoveWishlistButton({ productId, variantId }: { productId: string; variantId: string | null }) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRemove() {
    if (isPending) return;
    setIsPending(true);
    setError(null);
    try {
      const result = await toggleWishlistAction({ productId, variantId });
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.refresh();
    } catch {
      setError("We couldn't update your wishlist. Check your connection and try again.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        disabled={isPending}
        onClick={handleRemove}
        aria-label="Remove product from wishlist"
        className="min-h-10 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Removing…" : "Remove"}
      </button>
      {error ? <p role="alert" className="max-w-40 text-xs text-red-700">{error}</p> : null}
    </div>
  );
}
