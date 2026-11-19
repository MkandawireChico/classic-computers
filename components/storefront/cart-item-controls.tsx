"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateCartItemQuantityAction, removeCartItemAction } from "@/app/(storefront)/cart/actions";

export function CartItemControls({ cartItemId, quantity }: { cartItemId: string; quantity: number }) {
  const router = useRouter();
  const [value, setValue] = useState(quantity);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setValue(quantity), [quantity]);

  function commitQuantity(next: number) {
    const clamped = Math.max(1, Math.min(20, next));
    setError(null);
    setValue(clamped);
    startTransition(async () => {
      const result = await updateCartItemQuantityAction({ cartItemId, quantity: clamped });
      if (!result.success) {
        setValue(quantity);
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  function handleRemove() {
    setError(null);
    startTransition(async () => {
      const result = await removeCartItemAction({ cartItemId });
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex items-center rounded-xl border border-slate-200 bg-white">
        <button
          type="button"
          aria-label="Decrease quantity"
          onClick={() => commitQuantity(value - 1)}
          disabled={isPending || value <= 1}
          className="flex h-9 w-9 items-center justify-center rounded-l-xl text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-35"
        >
          −
        </button>
        <span className="w-8 text-center text-sm font-semibold tabular-nums text-slate-900" aria-live="polite">
          {value}
        </span>
        <button
          type="button"
          aria-label="Increase quantity"
          onClick={() => commitQuantity(value + 1)}
          disabled={isPending || value >= 20}
          className="flex h-9 w-9 items-center justify-center rounded-r-xl text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-35"
        >
          +
        </button>
      </div>
      <button
        type="button"
        onClick={handleRemove}
        disabled={isPending}
        className="text-xs font-semibold text-slate-500 underline-offset-4 transition hover:text-rose-700 hover:underline disabled:opacity-40"
      >
        Remove
      </button>
      {error ? <p role="alert" className="max-w-40 text-right text-xs font-medium text-rose-700">{error}</p> : null}
      {isPending ? <span className="text-[11px] text-slate-500" aria-live="polite">Updating…</span> : null}
    </div>
  );
}
