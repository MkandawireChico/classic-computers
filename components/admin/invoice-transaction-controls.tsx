"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/format/money";
import { recordBusinessDocumentTransactionAction } from "@/app/admin/documents/actions";

export function InvoiceTransactionControls({ documentId, outstanding, refundable, hasRefund }: { documentId: string; outstanding: number; refundable: number; hasRefund: boolean }) {
  const router = useRouter();
  const [type, setType] = useState<"payment" | "refund">("payment");
  const [amount, setAmount] = useState("");
  const [provider, setProvider] = useState("Bank transfer");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const limit = type === "payment" ? outstanding : refundable;

  function submit() {
    setError(null);
    startTransition(async () => {
      try {
        const result = await recordBusinessDocumentTransactionAction({
          documentId, transactionType: type, amount: Number(amount), provider,
          providerReference: reference, providerChecked: checked, notes,
        });
        if (!result.success) {
          setError(result.error);
          return;
        }
        setAmount("");
        setReference("");
        setNotes("");
        setChecked(false);
        router.refresh();
      } catch {
        setError("The transaction could not be recorded. Refresh and try again.");
      }
    });
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><h2 className="font-bold text-slate-950">Invoice transactions</h2><p className="mt-1 text-xs text-slate-500">Outstanding: {formatMoney(outstanding)} · Verified refundable balance: {formatMoney(refundable)}</p></div>
        <select value={type} onChange={(e) => { setType(e.target.value as "payment" | "refund"); setAmount(""); setError(null); }} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
          <option value="payment">Record payment</option><option value="refund">Record refund</option>
        </select>
      </div>
      {type === "payment" && hasRefund ? <p className="mt-3 text-sm text-amber-800">Further payments are blocked after a refund. Reconcile this invoice first.</p> : null}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="text-xs font-semibold text-slate-600">Amount (MWK)<input type="number" min="0.01" max={limit} step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></label>
        <label className="text-xs font-semibold text-slate-600">Payment provider<input value={provider} maxLength={80} onChange={(e) => setProvider(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></label>
        <label className="text-xs font-semibold text-slate-600 sm:col-span-2">Transaction reference<input value={reference} maxLength={120} onChange={(e) => setReference(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></label>
        <label className="text-xs font-semibold text-slate-600 sm:col-span-2">Internal note (optional)<input value={notes} maxLength={500} onChange={(e) => setNotes(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></label>
      </div>
      <label className="mt-4 flex items-start gap-2 text-sm text-slate-700"><input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} className="mt-1" /><span>I have checked the provider account and verified the transaction or refund.</span></label>
      {error ? <p role="alert" className="mt-3 text-sm text-rose-700">{error}</p> : null}
      <div className="mt-4 flex justify-end"><Button type="button" disabled={pending || !checked || !amount || Number(amount) <= 0 || Number(amount) > limit || !reference.trim() || !provider.trim() || (type === "payment" && hasRefund)} isLoading={pending} onClick={submit}>{type === "payment" ? "Record payment" : "Record refund"}</Button></div>
    </section>
  );
}
