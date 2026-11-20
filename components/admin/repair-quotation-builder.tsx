"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/format/money";
import { calculateDocumentPricing } from "@/lib/documents/pricing";
import { createRepairQuotationAction } from "@/app/admin/repairs/quotation-actions";

type Line = { description: string; quantity: number; unitPrice: number };

export function RepairQuotationBuilder({ ticketId }: { ticketId: string }) {
  const router = useRouter();
  const [lines, setLines] = useState<Line[]>([{ description: "Diagnosis and repair labour", quantity: 1, unitPrice: 0 }]);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountReason, setDiscountReason] = useState("");
  const [notes, setNotes] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  let totals = null;
  try {
    totals = calculateDocumentPricing({ lines, discountAmount, vatRate: 17.5, ppdaRate: 1 });
  } catch {
    totals = null;
  }

  function updateLine(index: number, patch: Partial<Line>) {
    setLines((current) => current.map((line, i) => i === index ? { ...line, ...patch } : line));
  }

  function issue() {
    setError(null);
    startTransition(async () => {
      try {
        const result = await createRepairQuotationAction({
          ticketId, lines, discountAmount, discountReason, notes,
          ...(validUntil ? { validUntil } : {}),
        });
        if (!result.success) {
          setError(result.error);
          return;
        }
        if (result.documentId) router.push(`/admin/documents/${result.documentId}`);
      } catch {
        setError("The quotation could not be issued. Refresh and try again.");
      }
    });
  }

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">Customer documents</p>
        <h2 className="mt-1 text-lg font-semibold text-slate-950">Prepare repair quotation</h2>
        <p className="mt-1 text-sm text-slate-500">Enter selling prices excluding VAT. The system adds VAT and PPDA separately.</p>
      </div>
      {error ? <Alert variant="danger">{error}</Alert> : null}
      <div className="space-y-3">
        {lines.map((line, index) => (
          <div key={index} className="grid grid-cols-1 gap-2 rounded-xl border border-slate-200 p-3 sm:grid-cols-[minmax(0,1fr)_90px_140px_auto]">
            <input aria-label={`Description ${index + 1}`} value={line.description} maxLength={240} onChange={(e) => updateLine(index, { description: e.target.value })} placeholder="Description" className="min-w-0 rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            <input aria-label="Quantity" type="number" min="0.01" step="0.01" value={line.quantity} onChange={(e) => updateLine(index, { quantity: Number(e.target.value) })} className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            <input aria-label="Unit selling price excluding VAT" type="number" min="0" step="0.01" value={line.unitPrice} onChange={(e) => updateLine(index, { unitPrice: Number(e.target.value) })} placeholder="Unit price (MWK)" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            <Button type="button" size="sm" variant="ghost" disabled={lines.length === 1 || isPending} onClick={() => setLines((current) => current.filter((_, i) => i !== index))}>Remove</Button>
          </div>
        ))}
        <Button type="button" size="sm" variant="outline" disabled={isPending || lines.length >= 30} onClick={() => setLines((current) => [...current, { description: "", quantity: 1, unitPrice: 0 }])}>Add line</Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Discount authorised by Classic Computers (MWK)</label>
          <input type="number" min="0" step="0.01" value={discountAmount} onChange={(e) => setDiscountAmount(Number(e.target.value))} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Reason for discount</label>
          <input value={discountReason} maxLength={300} onChange={(e) => setDiscountReason(e.target.value)} placeholder="Required when a discount is applied" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Quotation valid until</label>
          <input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Customer notes / terms</label>
          <input value={notes} maxLength={2000} onChange={(e) => setNotes(e.target.value)} placeholder="Optional" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
        </div>
      </div>

      {totals ? (
        <div className="ml-auto max-w-sm space-y-1 border-t border-slate-200 pt-3 text-sm">
          <div className="flex justify-between"><span>Selling subtotal</span><span>{formatMoney(totals.subtotal)}</span></div>
          <div className="flex justify-between"><span>Authorised discount</span><span>-{formatMoney(totals.discountAmount)}</span></div>
          <div className="flex justify-between"><span>Taxable selling price</span><span>{formatMoney(totals.taxableAmount)}</span></div>
          <div className="flex justify-between"><span>VAT ({totals.vatRate}%)</span><span>{formatMoney(totals.vatAmount)}</span></div>
          <div className="flex justify-between"><span>PPDA ({totals.ppdaRate}%)</span><span>{formatMoney(totals.ppdaAmount)}</span></div>
          <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-bold text-slate-950"><span>Grand total</span><span>{formatMoney(totals.grandTotal)}</span></div>
        </div>
      ) : <p className="text-sm text-rose-700">Enter valid line descriptions, quantities and prices to calculate the quotation.</p>}
      <div className="flex justify-end">
        <Button type="button" disabled={isPending || !totals || (discountAmount > 0 && discountReason.trim().length < 3)} isLoading={isPending} onClick={issue}>Issue quotation</Button>
      </div>
    </section>
  );
}
