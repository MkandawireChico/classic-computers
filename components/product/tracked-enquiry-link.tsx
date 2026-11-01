"use client";

import type { ReactNode } from "react";
import { trackInterestEvent } from "@/lib/client/customer-interest-analytics";

export function TrackedEnquiryLink({
  href,
  eventName,
  productId,
  target,
  rel,
  className,
  children,
}: {
  href: string;
  eventName: "whatsapp_clicked" | "telephone_clicked";
  productId?: string;
  target?: string;
  rel?: string;
  className: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      onClick={() => trackInterestEvent({ name: eventName, productId })}
      target={target}
      rel={rel}
      className={className}
    >
      {children}
    </a>
  );
}
