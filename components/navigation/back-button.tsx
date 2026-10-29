"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

function getFallbackHref(pathname: string): string {
  if (pathname.startsWith("/admin/")) {
    const section = pathname.split("/")[2];
    return section ? `/admin/${section}` : "/admin";
  }
  if (pathname === "/admin") return "/";

  if (pathname.startsWith("/account/")) {
    const segments = pathname.split("/").filter(Boolean);
    if (
      segments.length > 2 &&
      segments[1] &&
      ["orders", "rentals", "repairs"].includes(segments[1])
    ) {
      return `/account/${segments[1]}`;
    }
    return "/account";
  }
  if (pathname === "/account") return "/";

  if (pathname.startsWith("/checkout")) return "/cart";
  if (pathname.startsWith("/product/")) return "/shop";
  if (pathname.startsWith("/shop/") || pathname === "/search" || pathname === "/compare") {
    return "/shop";
  }
  if (pathname.startsWith("/rentals/")) return "/rentals";
  if (pathname.startsWith("/repairs/")) return "/repairs";
  if (pathname.startsWith("/corporate/")) return "/corporate";
  if (pathname === "/reset-password" || pathname === "/update-password") return "/sign-in";
  if (pathname === "/sign-up") return "/sign-in";
  if (pathname.startsWith("/auth/")) return "/sign-in";

  return "/";
}

function isInternalPath(path: string): boolean {
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;

  try {
    return new URL(path, window.location.origin).origin === window.location.origin;
  } catch {
    return false;
  }
}

function isRelevantPreviousPage(currentPath: string, previousPath: string): boolean {
  if (currentPath.startsWith("/admin")) return previousPath.startsWith("/admin");
  if (currentPath.startsWith("/checkout")) return /^\/(?:cart|checkout)(?:\/|$)/.test(previousPath);
  if (currentPath.startsWith("/product/")) {
    return (
      previousPath === "/" ||
      /^\/(?:shop(?:\/|$)|search(?:\/|$)|compare(?:\/|$)|product\/)/.test(previousPath)
    );
  }
  if (currentPath.startsWith("/account")) {
    return previousPath.startsWith("/account") || previousPath.startsWith("/sign-in");
  }
  if (currentPath.startsWith("/rentals")) return previousPath.startsWith("/rentals");
  if (currentPath.startsWith("/repairs")) return previousPath.startsWith("/repairs");
  if (currentPath.startsWith("/corporate")) return previousPath.startsWith("/corporate");
  if (
    currentPath === "/sign-in" ||
    currentPath === "/sign-up" ||
    currentPath === "/reset-password" ||
    currentPath === "/update-password" ||
    currentPath.startsWith("/auth/")
  ) {
    return !previousPath.startsWith("/admin") && !previousPath.startsWith("/account");
  }
  return true;
}

export function BackButton({ className = "" }: { className?: string }) {
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  const currentPathRef = useRef<string | null>(null);
  const previousPathRef = useRef<string | null>(null);
  const isFallbackNavigationRef = useRef(false);

  useEffect(() => {
    if (currentPathRef.current === null) {
      currentPathRef.current = pathname;
      return;
    }

    if (currentPathRef.current !== pathname) {
      if (isFallbackNavigationRef.current) {
        previousPathRef.current = null;
        isFallbackNavigationRef.current = false;
      } else {
        previousPathRef.current = currentPathRef.current;
      }
      currentPathRef.current = pathname;
    }
  }, [pathname]);

  if (pathname === "/") return null;

  function handleBack() {
    const previousPath = previousPathRef.current ?? getSameOriginReferrerPath();
    const canReturnToPreviousPage =
      window.history.length > 1 &&
      previousPath !== null &&
      previousPath !== pathname &&
      isInternalPath(previousPath) &&
      isRelevantPreviousPage(pathname, previousPath);

    if (canReturnToPreviousPage) {
      router.back();
      return;
    }

    const fallbackHref = getFallbackHref(pathname);
    isFallbackNavigationRef.current = true;
    router.replace(isInternalPath(fallbackHref) ? fallbackHref : "/");
  }

  return (
    <div className={`mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8 ${className}`}>
      <button
        type="button"
        onClick={handleBack}
        aria-label="Back"
        className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-2.5 text-sm font-bold text-emerald-950 shadow-sm transition-colors hover:border-emerald-300 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-100 focus-visible:ring-offset-2 active:bg-emerald-100"
      >
        <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none">
          <path
            d="M19 12H5m7 7-7-7 7-7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Back
      </button>
    </div>
  );
}

function getSameOriginReferrerPath(): string | null {
  if (!document.referrer) return null;

  try {
    const referrer = new URL(document.referrer);
    if (referrer.origin !== window.location.origin) return null;
    return `${referrer.pathname}${referrer.search}${referrer.hash}`;
  } catch {
    return null;
  }
}
