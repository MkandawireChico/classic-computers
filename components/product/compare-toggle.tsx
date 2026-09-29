"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleCompareAction } from "@/app/(storefront)/compare/actions";

export function CompareToggle({ productId, isComparing }: { productId: string; isComparing: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        startTransition(async () => {
          await toggleCompareAction(productId);
          router.refresh();
        });
      }}
      disabled={isPending}
      aria-pressed={isComparing}
      className={`absolute right-2 top-2 rounded-full border px-2 py-0.5 text-[11px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1 ${
        isComparing
          ? "border-brand-500 bg-brand-500 text-white"
          : "border-surface-border bg-surface/90 text-gray-600 hover:bg-surface"
      }`}
    >
      {isComparing ? "Comparing" : "Compare"}
    </button>
  );
}
