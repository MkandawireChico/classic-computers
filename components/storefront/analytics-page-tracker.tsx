"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { trackInterestEvent, type InterestEventName } from "@/lib/client/customer-interest-analytics";

function pageEvent(pathname: string): InterestEventName | null {
  if (pathname.startsWith("/admin") || pathname.startsWith("/account") || pathname.startsWith("/auth")) return null;
  if (pathname.startsWith("/rentals")) return "rental_page_viewed";
  if (pathname.startsWith("/repairs")) return "repair_page_viewed";
  if (pathname.startsWith("/corporate")) return "corporate_page_viewed";
  if (pathname.startsWith("/student-deals")) return "student_deals_viewed";
  if (pathname.startsWith("/contact")) return "contact_page_viewed";
  if (pathname === "/checkout") return "checkout_started";
  return "page_view";
}

export function AnalyticsPageTracker() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || pathname === lastPath.current) return;
    lastPath.current = pathname;
    const name = pageEvent(pathname);
    if (name) trackInterestEvent({ name, pagePath: pathname });
  }, [pathname]);

  return null;
}

export function ProductInterestTracker({ productId, categoryId }: { productId: string; categoryId: string | null }) {
  const trackedProduct = useRef<string | null>(null);
  useEffect(() => {
    if (trackedProduct.current === productId) return;
    trackedProduct.current = productId;
    trackInterestEvent({ name: "product_view", productId, categoryId: categoryId ?? undefined });
  }, [categoryId, productId]);
  return null;
}

export function SearchInterestTracker({ searchTerm, resultCount }: { searchTerm: string; resultCount: number }) {
  const trackedSearch = useRef<string | null>(null);
  useEffect(() => {
    const term = searchTerm.trim();
    const key = `${term}:${resultCount}`;
    if (!term || trackedSearch.current === key) return;
    trackedSearch.current = key;
    trackInterestEvent({ name: "search_performed", searchTerm: term, resultCount });
    if (resultCount === 0) trackInterestEvent({ name: "search_no_results", searchTerm: term, resultCount });
  }, [resultCount, searchTerm]);
  return null;
}

export function CategoryInterestTracker({ categoryId }: { categoryId: string }) {
  const trackedCategory = useRef<string | null>(null);
  useEffect(() => {
    if (trackedCategory.current === categoryId) return;
    trackedCategory.current = categoryId;
    trackInterestEvent({ name: "category_viewed", categoryId });
  }, [categoryId]);
  return null;
}
