"use client";

import { useState } from "react";

export function CopyPaymentValue({ value, label }: { value: string; label: string }) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");

  async function copyValue() {
    try {
      await navigator.clipboard.writeText(value);
      setStatus("copied");
    } catch (error) {
      console.error("Could not copy payment details:", error);
      setStatus("error");
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={copyValue}
        className="inline-flex min-h-9 items-center rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
      >
        {status === "copied" ? "Copied" : `Copy ${label}`}
      </button>
      {status === "error" ? (
        <span role="status" className="text-xs font-medium text-rose-700">
          Could not copy. Please select and copy the text.
        </span>
      ) : null}
    </div>
  );
}
