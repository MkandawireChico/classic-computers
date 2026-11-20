"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { recordStaffQuotationDecision } from "@/app/admin/documents/actions";

export function StaffQuotationDecisionControls({ documentId }: { documentId: string }) {
  const router = useRouter();
  const [decision, setDecision] = useState<"accepted" | "rejected">("accepted");
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit() {
    setError(null);
    startTransition(async () => {
      try {
        const result = await recordStaffQuotationDecision(documentId, decision, comment);
        if (!result.success) {
          setError(result.error);
          return;
        }
        router.refresh();
      } catch {
        setError("The customer decision could not be saved.");
      }
    });
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="font-bold text-slate-950">Record customer response</h2>
      <p className="mt-1 text-sm text-slate-600">Use this when the customer responds by phone or in person. Record the source of the confirmation.</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-[180px_minmax(0,1fr)]">
        <select value={decision} onChange={(e) => setDecision(e.target.value as "accepted" | "rejected")} className="rounded-lg border border-slate-200 px-3 py-2 text-sm"><option value="accepted">Customer accepted</option><option value="rejected">Customer rejected</option></select>
        <input value={comment} onChange={(e) => setComment(e.target.value)} maxLength={1000} placeholder="e.g. Customer confirmed by phone on 20 November" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
      </div>
      {error ? <p role="alert" className="mt-2 text-sm text-rose-700">{error}</p> : null}
      <div className="mt-3 flex justify-end"><Button type="button" disabled={pending || comment.trim().length < 3} isLoading={pending} onClick={submit}>Save customer response</Button></div>
    </section>
  );
}
