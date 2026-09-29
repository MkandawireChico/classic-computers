"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleWishlistAction } from "./actions";

export function RemoveWishlistButton({ productId }: { productId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await toggleWishlistAction({ productId, variantId: null });
          router.refresh();
        })
      }
      className="text-sm text-gray-500 hover:text-status-danger disabled:opacity-40"
    >
      Remove
    </button>
  );
}
