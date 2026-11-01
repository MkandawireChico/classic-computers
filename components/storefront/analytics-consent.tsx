"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Consent = "granted" | "denied" | null;

function readConsent(): Consent {
  const value = document.cookie.split("; ").find((cookie) => cookie.startsWith("site-analytics-consent="))?.split("=")[1];
  return value === "granted" || value === "denied" ? value : null;
}

function writeConsent(consent: Exclude<Consent, null>) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `site-analytics-consent=${consent}; Max-Age=31536000; Path=/; SameSite=Lax${secure}`;
}

function stopAnalyticsCollection() {
  void fetch("/api/analytics/events", { method: "DELETE", credentials: "same-origin" }).catch((error: unknown) => {
    console.warn("Could not clear analytics identifiers after consent was withdrawn:", error);
  });
}

export function AnalyticsConsentBanner() {
  const [consent, setConsent] = useState<Consent>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setConsent(readConsent());
    setLoaded(true);
  }, []);

  if (!loaded || consent) return null;

  return (
    <aside aria-label="Analytics privacy choices" className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-3xl rounded-xl border border-slate-300 bg-white p-4 shadow-xl sm:inset-x-6 sm:bottom-6 sm:p-5">
      <p className="font-semibold text-slate-950">Help us understand what visitors find useful</p>
      <p className="mt-1 text-sm leading-5 text-slate-600">
        Optional first-party analytics records page and product interest after you choose to allow it. It does not collect form contents, payment details, or full URLs. Read our{" "}
        <Link href="/privacy" className="font-semibold text-emerald-800 underline underline-offset-2">privacy policy</Link>.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={() => { writeConsent("granted"); setConsent("granted"); }} className="min-h-10 rounded-lg bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800">
          Allow analytics
        </button>
        <button type="button" onClick={() => { writeConsent("denied"); stopAnalyticsCollection(); setConsent("denied"); }} className="min-h-10 rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          Decline optional analytics
        </button>
      </div>
    </aside>
  );
}

export function AnalyticsConsentControls() {
  const [consent, setConsent] = useState<Consent>(null);
  useEffect(() => setConsent(readConsent()), []);

  function choose(next: Exclude<Consent, null>) {
    writeConsent(next);
    if (next === "denied") stopAnalyticsCollection();
    setConsent(next);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <p className="text-sm text-slate-700">Optional analytics: <span className="font-semibold">{consent === "granted" ? "Allowed" : consent === "denied" ? "Declined" : "Not set"}</span></p>
      <button type="button" onClick={() => choose("granted")} className="min-h-10 rounded-lg bg-emerald-700 px-3 text-sm font-semibold text-white hover:bg-emerald-800">Allow</button>
      <button type="button" onClick={() => choose("denied")} className="min-h-10 rounded-lg border border-slate-300 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Decline / withdraw</button>
    </div>
  );
}
