"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateCartItemQuantityAction, removeCartItemAction } from "@/app/(storefront)/cart/actions";

export function CartItemControls({ cartItemId, quantity }: { cartItemId: string; quantity: number }) {
  const router = useRouter();
  const [value, setValue] = useState(quantity);
  const [isPending, startTransition] = useTransition();

  function commitQuantity(next: number) {
    const clamped = Math.max(1, Math.min(20, next));
    setValue(clamped);
    startTransition(async () => {
      await updateCartItemQuantityAction({ cartItemId, quantity: clamped });
      router.refresh();
    });
  }

  function handleRemove() {
    startTransition(async () => {
      await removeCartItemAction({ cartItemId });
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center rounded-card border border-surface-border">
        <button
          type="button"
          aria-label="Decrease quantity"
          onClick={() => commitQuantity(value - 1)}
          disabled={isPending || value <= 1}
          className="px-2.5 py-1 text-gray-600 hover:bg-surface-muted disabled:opacity-40"
        >
          −
        </button>
        <span className="w-8 text-center text-sm" aria-live="polite">
          {value}
        </span>
        <button
          type="button"
          aria-label="Increase quantity"
          onClick={() => commitQuantity(value + 1)}
          disabled={isPending || value >= 20}
          className="px-2.5 py-1 text-gray-600 hover:bg-surface-muted disabled:opacity-40"
        >
          +
        </button>
      </div>
      <button
        type="button"
        onClick={handleRemove}
        disabled={isPending}
        className="text-sm text-gray-500 hover:text-status-danger disabled:opacity-40"
      >
        Remove
      </button>
    </div>
  );
}
