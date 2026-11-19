"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toggleCompareAction } from "./actions";

export function RemoveComparedProductButton({ productId }: { productId: string }) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRemove() {
    if (isPending) return;
    setIsPending(true);
    setError(null);
    try {
      await toggleCompareAction(productId);
      router.refresh();
    } catch {
      setError("Unable to remove this product. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={handleRemove}
        disabled={isPending}
        className="inline-flex min-h-9 items-center justify-center rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
      >
        {isPending ? "Removing…" : "Remove"}
      </button>
      {error ? <p role="alert" className="mt-1 max-w-[12rem] text-xs text-red-700">{error}</p> : null}
    </div>
  );
}
