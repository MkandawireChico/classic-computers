"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { toggleWishlistAction } from "@/app/(storefront)/account/wishlist/actions";
import { trackInterestEvent } from "@/lib/client/customer-interest-analytics";

export function WishlistButton({
  productId,
  variantId,
  initialSavedVariantIds,
  initialProductLevelSaved,
}: {
  productId: string;
  variantId: string | null;
  initialSavedVariantIds: string[];
  initialProductLevelSaved: boolean;
}) {
  const router = useRouter();
  const [savedOverrides, setSavedOverrides] = useState<Record<string, boolean>>({});
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const entryKey = variantId ?? "product";
  const initiallySaved = variantId
    ? initialSavedVariantIds.includes(variantId)
    : initialProductLevelSaved;
  const inWishlist = savedOverrides[entryKey] ?? initiallySaved;

  async function handleClick() {
    if (isPending) return;
    setIsPending(true);
    setError(null);
    try {
      const result = await toggleWishlistAction({ productId, variantId });
      if (!result.success) {
        setError(result.error);
        return;
      }
      if (result.inWishlist) {
        try {
          trackInterestEvent({ name: "add_to_wishlist", productId });
        } catch (analyticsError) {
          console.warn("Wishlist analytics could not be recorded:", analyticsError);
        }
      }
      setSavedOverrides((current) => ({ ...current, [entryKey]: result.inWishlist }));
      router.refresh();
    } catch {
      setError("We couldn't update your wishlist. Check your connection and try again.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button variant="outline" onClick={handleClick} isLoading={isPending} disabled={isPending}>
        {inWishlist ? "Remove from wishlist" : "Wishlist"}
      </Button>
      {error ? <Alert variant="danger">{error}</Alert> : null}
    </div>
  );
}
