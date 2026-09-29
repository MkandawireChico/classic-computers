"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { clearCompareAction } from "@/app/(storefront)/compare/actions";

export function ClearCompareButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(async () => {
        await clearCompareAction();
        router.refresh();
      })}
      className="text-sm text-gray-500 hover:text-status-danger disabled:opacity-40"
    >
      Clear all
    </button>
  );
}
