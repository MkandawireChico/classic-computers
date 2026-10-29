"use client";

import { useRouter } from "next/navigation";

type BackButtonProps = {
  fallbackHref: string;
};

function getSafeFallback(href: string) {
  return href.startsWith("/") && !href.startsWith("//") ? href : "/";
}

export function BackButton({ fallbackHref }: BackButtonProps) {
  const router = useRouter();

  function handleBack() {
    const hasSameOriginReferrer =
      typeof document !== "undefined" &&
      document.referrer !== "" &&
      new URL(document.referrer).origin === window.location.origin;

    if (window.history.length > 1 && hasSameOriginReferrer) {
      router.back();
      return;
    }

    router.push(getSafeFallback(fallbackHref));
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      aria-label="Go back"
      className="mb-4 inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200 focus-visible:ring-offset-2"
    >
      <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-4 w-4">
        <path
          d="M12.5 4.5 7 10l5.5 5.5M7.5 10H16"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
      </svg>
      Back
    </button>
  );
}
