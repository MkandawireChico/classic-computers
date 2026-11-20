"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { submitQuotationDecision } from "@/app/(storefront)/account/quotations/actions";

export function QuotationDecisionControls({ documentId }: { documentId: string }) {
  const router = useRouter();
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function decide(decision: "accepted" | "rejected") {
    const message = decision === "accepted"
      ? "Accept this quotation and confirm the quoted work or supply?"
      : "Reject this quotation?";
    if (!window.confirm(message)) return;
    setError(null);
    startTransition(async () => {
      try {
        const result = await submitQuotationDecision(documentId, decision, comment);
        if (!result.success) {
          setError(result.error);
          return;
        }
        router.refresh();
      } catch {
        setError("Your response could not be submitted. Please try again.");
      }
    });
  }

  return (
    <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <div>
        <h2 className="font-bold text-slate-950">Respond to quotation</h2>
        <p className="mt-1 text-sm text-slate-600">Your response is recorded against this quotation and cannot be changed online.</p>
      </div>
      <label className="block text-sm font-medium text-slate-700">
        Comment (optional)
        <textarea value={comment} maxLength={1000} rows={3} onChange={(e) => setComment(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
      </label>
      {error ? <p role="alert" className="text-sm text-rose-700">{error}</p> : null}
      <div className="flex flex-wrap gap-2">
        <Button type="button" disabled={pending} isLoading={pending} onClick={() => decide("accepted")}>Accept quotation</Button>
        <Button type="button" disabled={pending} variant="outline" onClick={() => decide("rejected")}>Reject quotation</Button>
      </div>
    </section>
  );
}
