"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { addToCartAction } from "@/app/(storefront)/cart/actions";
import { trackInterestEvent } from "@/lib/client/customer-interest-analytics";

export function AddToCartButton({
  productId,
  variantId,
  disabled,
  buyNow = false,
}: {
  productId: string;
  variantId: string | null;
  disabled?: boolean;
  buyNow?: boolean;
}) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  async function handleClick() {
    if (isPending || disabled) return;
    setError(null);
    setAdded(false);
    setIsPending(true);

    try {
      const result = await addToCartAction({ productId, variantId, quantity: 1 });
      if (!result.success) {
        setError(result.error);
        return;
      }

      try {
        trackInterestEvent({ name: "add_to_cart", productId });
      } catch (analyticsError) {
        console.warn("Cart analytics could not be recorded:", analyticsError);
      }
      if (buyNow) {
        router.push("/checkout");
        return;
      }

      setAdded(true);
      router.refresh();
    } catch (err) {
      console.error("Add to cart failed:", err);
      setError("We could not update your cart. Please try again.");
    } finally {
      setIsPending(false);
    }
  }
  return (
    <div className="flex-1">
      <Button
        variant={buyNow ? "outline" : "primary"}
        className={`min-h-12 w-full rounded-lg font-bold shadow-sm transition-colors ${buyNow ? "border border-brand-300 bg-white text-brand-800 hover:bg-brand-50" : "bg-navy-900 text-white hover:bg-brand-800"}`}
        onClick={handleClick}
        isLoading={isPending}
        disabled={disabled || isPending}
      >
        {buyNow ? "Buy now" : added ? "Added to cart" : "Add to cart"}
      </Button>
      {error ? (
        <Alert variant="danger" className="mt-2">
          {error}
        </Alert>
      ) : null}
      {added ? <Alert variant="success" className="mt-2">Item added to cart successfully.</Alert> : null}
    </div>
  );
}
