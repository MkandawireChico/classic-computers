"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { trackInterestEvent } from "@/lib/client/customer-interest-analytics";

export function TrackedProductLink({
  href,
  productId,
  trackSearchResult,
  className,
  ariaLabel,
  children,
}: {
  href: string;
  productId: string;
  trackSearchResult: boolean;
  className: string;
  ariaLabel?: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={() => {
        if (trackSearchResult) {
          trackInterestEvent({ name: "search_result_selected", productId });
        }
      }}
      className={className}
      aria-label={ariaLabel}
    >
      {children}
    </Link>
  );
}
