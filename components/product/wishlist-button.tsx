"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toggleWishlistAction } from "@/app/(storefront)/account/wishlist/actions";
import { trackInterestEvent } from "@/lib/client/customer-interest-analytics";

export function WishlistButton({
  productId,
  variantId,
  initialInWishlist,
}: {
  productId: string;
  variantId: string | null;
  initialInWishlist: boolean;
}) {
  const router = useRouter();
  const [inWishlist, setInWishlist] = useState(initialInWishlist);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await toggleWishlistAction({ productId, variantId });
      if (result.success) {
        if (result.inWishlist) trackInterestEvent({ name: "add_to_wishlist", productId });
        setInWishlist(result.inWishlist);
        router.refresh();
      }
    });
  }

  return (
    <Button variant="outline" onClick={handleClick} isLoading={isPending}>
      {inWishlist ? "Remove from wishlist" : "Wishlist"}
    </Button>
  );
}
