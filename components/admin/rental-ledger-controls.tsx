"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { recordRentalConditionAction, recordRentalPaymentAction } from "@/app/admin/rentals/actions";
import type { AdminRentalDetail } from "@/lib/data/admin/rentals";
import { formatMoney } from "@/lib/format/money";

const EVENT_LABELS: Record<string, string> = {
  checkout: "Handover inspection",
  return: "Return inspection",
  damage: "Damage assessment",
  loss: "Lost equipment report",
};

export function RentalLedgerControls({ rental }: { rental: AdminRentalDetail }) {
  const router = useRouter();
  const [type, setType] = useState<"payment" | "refund">("payment");
  const [provider, setProvider] = useState("Cash");
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [verified, setVerified] = useState(false);
  const [eventType, setEventType] = useState("checkout");
  const [condition, setCondition] = useState("good");
  const [conditionNotes, setConditionNotes] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const paid = rental.paymentTransactions.reduce((sum, row) => sum + (row.transaction_type === "payment" ? row.amount : 0), 0);
  const refunded = rental.paymentTransactions.reduce((sum, row) => sum + (row.transaction_type === "refund" ? row.amount : 0), 0);
  const net = paid - refunded;
  const outstanding = rental.total_charge === null ? null : Math.max(rental.total_charge - net, 0);
  const refundable = Math.max(net, 0);
  const recordedEvents = new Set(rental.conditionReports.map((row) => row.event_type));
  const availableEvents = ["checkout", "return", "damage", "loss"].filter((event) => !recordedEvents.has(event));
  const latestReport = rental.conditionReports[rental.conditionReports.length - 1];

  async function submitPayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const limit = type === "payment" ? outstanding ?? 0 : refundable;
    const numericAmount = Number(amount);
    if (!verified) { setError("Confirm you checked the provider account first."); return; }
    if (!provider.trim() || !Number.isFinite(numericAmount) || numericAmount <= 0 || numericAmount > limit) {
      setError("Enter a valid amount within the current rental balance."); return;
    }
    if (!window.confirm(`Confirm ${type} of ${formatMoney(numericAmount)} through ${provider}?`)) return;
    setPending(true); setError(null);
    try {
      const result = await recordRentalPaymentAction({
        bookingId: rental.id, transactionType: type, provider, amount: numericAmount, providerReference: reference,
      });
      if (!result.success) { setError(result.error); return; }
      setAmount(""); setReference(""); setVerified(false); router.refresh();
    } catch { setError("Could not record the rental transaction. Refresh and try again."); }
    finally { setPending(false); }
  }

  async function submitCondition(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setPending(true); setError(null);
    try {
      const result = await recordRentalConditionAction({
        bookingId: rental.id, eventType, condition, notes: conditionNotes,
      });
      if (!result.success) { setError(result.error); return; }
      setConditionNotes(""); router.refresh();
    } catch { setError("Could not save the condition report. Refresh and try again."); }
    finally { setPending(false); }
  }

  return (
    <div className="space-y-5">
      {error ? <Alert variant="danger">{error}</Alert> : null}
      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-bold text-slate-950">Rental payment ledger</h2>
        <p className="mt-1 text-xs leading-5 text-slate-500">Only record funds after confirming the payment or refund in the provider account. All rental charges and transactions use MWK.</p>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">Agreed charge</p><p className="mt-1 font-bold text-slate-950">{rental.total_charge === null ? "Not set" : formatMoney(rental.total_charge)}</p></div>
          <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">Verified net received</p><p className="mt-1 font-bold text-slate-950">{formatMoney(net)}</p></div>
          <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">Outstanding</p><p className="mt-1 font-bold text-slate-950">{outstanding === null ? "Set charge first" : formatMoney(outstanding)}</p></div>
          <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">Refunded</p><p className="mt-1 font-bold text-slate-950">{formatMoney(refunded)}</p></div>
        </div>
        <form onSubmit={submitPayment} className="mt-4 space-y-3 border-t border-slate-100 pt-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs font-semibold text-slate-700">Transaction
              <select value={type} onChange={(e) => { setType(e.target.value as "payment" | "refund"); setVerified(false); }} className="mt-1 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm">
                <option value="payment">Payment received</option><option value="refund">Refund processed</option>
              </select>
            </label>
            <label className="text-xs font-semibold text-slate-700">Provider
              <input required maxLength={80} value={provider} onChange={(e) => setProvider(e.target.value)} className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm" placeholder="Cash, bank, TNM Mpamba..." />
            </label>
            <label className="text-xs font-semibold text-slate-700">Amount (MWK)
              <input required type="number" min="0.01" step="0.01" max={type === "payment" ? outstanding ?? 0 : refundable} value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm" />
            </label>
            <label className="text-xs font-semibold text-slate-700">Provider reference
              <input maxLength={120} value={reference} onChange={(e) => setReference(e.target.value)} className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm" placeholder="Optional" />
            </label>
          </div>
          <label className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-950">
            <input type="checkbox" checked={verified} onChange={(e) => setVerified(e.target.checked)} className="mt-0.5 h-4 w-4" />
            <span>I checked the provider account and confirmed this {type === "payment" ? "payment was received" : "refund was processed"}.</span>
          </label>
          <Button type="submit" size="sm" isLoading={pending} disabled={pending || !verified || (type === "payment" ? outstanding === null || outstanding <= 0 : refundable <= 0)}>{type === "payment" ? "Record verified payment" : "Record verified refund"}</Button>
        </form>
        {rental.paymentTransactions.length ? (
          <ol className="mt-4 space-y-2 border-t border-slate-100 pt-3">
            {rental.paymentTransactions.map((row) => <li key={row.id} className="flex flex-wrap justify-between gap-2 text-xs">
              <span className="text-slate-600">{row.transaction_type} · {row.provider}{row.provider_reference ? ` · ${row.provider_reference}` : ""}</span>
              <strong className={row.transaction_type === "refund" ? "text-rose-700" : "text-emerald-700"}>{row.transaction_type === "refund" ? "−" : "+"}{formatMoney(row.amount)}</strong>
            </li>)}
          </ol>
        ) : <p className="mt-4 text-xs text-slate-500">No verified rental transactions recorded.</p>}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-bold text-slate-950">Equipment condition</h2>
        <p className="mt-1 text-xs leading-5 text-slate-500">Record a condition report before handover, return, damage or loss status changes. Reports are retained as an audit record.</p>
        {availableEvents.length ? (
          <form onSubmit={submitCondition} className="mt-4 space-y-3">
            <label className="block text-xs font-semibold text-slate-700">Inspection type
              <select value={eventType} onChange={(e) => setEventType(e.target.value)} className="mt-1 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm">
                {availableEvents.map((event) => <option key={event} value={event}>{EVENT_LABELS[event]}</option>)}
              </select>
            </label>
            <label className="block text-xs font-semibold text-slate-700">Overall condition
              <select value={condition} onChange={(e) => setCondition(e.target.value)} className="mt-1 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm">
                <option value="excellent">Excellent</option><option value="good">Good</option><option value="fair">Fair</option><option value="damaged">Damaged</option><option value="missing">Missing</option>
              </select>
            </label>
            <label className="block text-xs font-semibold text-slate-700">Inspection notes
              <textarea required minLength={3} maxLength={1500} rows={3} value={conditionNotes} onChange={(e) => setConditionNotes(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="Record visible condition, accessories, faults or missing items." />
            </label>
            <Button type="submit" size="sm" isLoading={pending} disabled={pending || conditionNotes.trim().length < 3}>Save condition report</Button>
          </form>
        ) : <p className="mt-3 text-xs text-emerald-700">All four condition report types have been recorded.</p>}
        {latestReport ? <p className="mt-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">Latest: {EVENT_LABELS[latestReport.event_type]} · {latestReport.condition} · {latestReport.recorded_by_name ?? "Staff member"}</p> : null}
        <ol className="mt-3 space-y-3">
          {rental.conditionReports.map((row) => <li key={row.id} className="border-t border-slate-100 pt-3 text-xs">
            <div className="flex flex-wrap justify-between gap-2"><strong className="text-slate-800">{EVENT_LABELS[row.event_type]} · {row.condition}</strong><span className="text-slate-500">{new Date(row.created_at).toLocaleString("en-MW", { timeZone: "Africa/Blantyre" })}</span></div>
            <p className="mt-1 whitespace-pre-wrap text-slate-600">{row.notes}</p><p className="mt-1 text-slate-400">Recorded by {row.recorded_by_name ?? "Staff member"}</p>
          </li>)}
        </ol>
      </section>
    </div>
  );
}
