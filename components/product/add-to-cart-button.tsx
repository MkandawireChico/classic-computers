"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { addToCartAction } from "@/app/(storefront)/cart/actions";

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
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  function handleClick() {
    setError(null);
    setAdded(false);
    startTransition(async () => {
      const result = await addToCartAction({ productId, variantId, quantity: 1 });
      if (result.success) {
        if (buyNow) {
          router.push("/checkout");
          return;
        }
        setAdded(true);
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div className="flex-1">
      <Button
        variant={buyNow ? "outline" : "primary"}
        className="w-full"
        onClick={handleClick}
        isLoading={isPending}
        disabled={disabled}
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
