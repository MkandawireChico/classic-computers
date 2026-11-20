"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/format/money";
import {
  updateRepairStatusAction,
  assignTechnicianAction,
  setRepairQuoteAction,
  addRepairUpdateAction,
  addRepairPartAction,
  removeRepairPartAction,
  addRepairWorkLogAction,
} from "@/app/admin/repairs/actions";
import type { AdminRepairDetail, RepairStockOption } from "@/lib/data/admin/repairs";

const NEXT_STATUS: Record<string, string[]> = {
  checked_in: ["diagnosing", "cancelled"],
  diagnosing: ["quoted", "cancelled"],
  quoted: ["awaiting_approval", "cancelled"],
  awaiting_approval: ["in_progress", "cancelled"],
  in_progress: ["ready_for_pickup", "cancelled"],
  ready_for_pickup: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

export function RepairDetailControls({
  repair,
  technicians,
  stockOptions,
}: {
  repair: AdminRepairDetail;
  technicians: Array<{ id: string; name: string | null }>;
  stockOptions: RepairStockOption[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [isInternal, setIsInternal] = useState(true);
  const [quote, setQuote] = useState(repair.quote_amount ?? 0);
  const [partForm, setPartForm] = useState({ partName: "", cost: 0, quantity: 1 });
  const [stockInventoryId, setStockInventoryId] = useState("");
  const [workLog, setWorkLog] = useState({ workDate: new Date().toISOString().slice(0, 10), durationMinutes: 30, workPerformed: "" });
  const selectedStockOption = stockOptions.find((option) => option.inventory_id === stockInventoryId) ?? null;

  function run(fn: () => Promise<{ success: boolean; error?: string }>) {
    if (isPending) return;
    setError(null);
    startTransition(async () => {
      try {
        const result = await fn();
        if (!result.success) setError(result.error ?? "Something went wrong.");
        else router.refresh();
      } catch {
        setError("The repair update failed. Refresh the page and try again.");
      }
    });
  }

  const loggedHours = Math.floor(repair.loggedMinutes / 60);
  const loggedRemainder = repair.loggedMinutes % 60;
  const labourCost = repair.internalLabourRate !== null
    ? (repair.loggedMinutes / 60) * repair.internalLabourRate
    : null;
  const totalRecordedCost = labourCost !== null ? repair.partsCostTotal + labourCost : null;
  const partsBalance = repair.latestQuotation
    ? repair.latestQuotation.taxable_amount - repair.partsCostTotal
    : null;
  const estimatedContribution = repair.latestQuotation && totalRecordedCost !== null
    ? repair.latestQuotation.taxable_amount - totalRecordedCost
    : null;

  return (
    <div className="space-y-6">
      {error ? <Alert variant="danger">{error}</Alert> : null}

      <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Repair cost overview</p>
            <h3 className="mt-1 text-base font-semibold text-slate-900">Parts, labour time and selling price</h3>
          </div>
          {repair.latestQuotation ? <Badge variant={repair.latestQuotation.status === "accepted" ? "success" : "info"}>Quotation #{repair.latestQuotation.document_number} · {repair.latestQuotation.status.replace(/_/g, " ")}</Badge> : <Badge variant="warning">No quotation</Badge>}
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <p className="text-xs text-slate-500">Internal parts cost</p>
            <p className="mt-1 text-lg font-semibold tabular-nums text-slate-900">{formatMoney(repair.partsCostTotal)}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <p className="text-xs text-slate-500">Technician time logged</p>
            <p className="mt-1 text-lg font-semibold tabular-nums text-slate-900">{loggedHours}h {loggedRemainder}m</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <p className="text-xs text-slate-500">Customer selling price, before tax</p>
            <p className="mt-1 text-lg font-semibold tabular-nums text-slate-900">{repair.latestQuotation ? formatMoney(repair.latestQuotation.taxable_amount) : "Not quoted"}</p>
          </div>
        </div>
        {partsBalance !== null ? (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-3 text-sm">
            <span className="font-medium text-slate-700">Selling price less parts cost</span>
            <span className="font-semibold tabular-nums text-slate-900">{formatMoney(partsBalance)}</span>
          </div>
        ) : null}
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <p className="text-xs text-slate-500">Estimated internal labour cost</p>
            <p className="mt-1 text-lg font-semibold tabular-nums text-slate-900">{labourCost !== null ? formatMoney(labourCost) : "Rate not configured"}</p>
            <p className="mt-1 text-xs text-slate-500">{repair.internalLabourRate !== null ? `Rate: ${formatMoney(repair.internalLabourRate)} per hour` : "Set an internal hourly rate in Admin Settings → Repair settings."}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <p className="text-xs text-slate-500">Estimated contribution after recorded costs</p>
            <p className="mt-1 text-lg font-semibold tabular-nums text-slate-900">{estimatedContribution !== null ? formatMoney(estimatedContribution) : "Incomplete"}</p>
            <p className="mt-1 text-xs text-slate-500">{totalRecordedCost !== null ? `Recorded parts and labour: ${formatMoney(totalRecordedCost)}` : "Requires a configured labour rate and quotation."}</p>
          </div>
        </div>
        <p className="mt-2 text-xs leading-5 text-slate-500">Estimate uses the latest quotation before tax, recorded parts cost and configured labour rate. Excludes overheads, unlogged work, warranty costs and later invoice adjustments. Not an accounting profit figure.</p>
      </section>

      <div>
        <p className="mb-1 text-xs font-medium uppercase text-gray-500">Status</p>
        <div className="flex flex-wrap gap-2">
          {(NEXT_STATUS[repair.status] ?? []).map((s) => (
            <Button
              key={s}
              size="sm"
              variant={s === "cancelled" ? "danger" : "outline"}
              isLoading={isPending}
              disabled={isPending}
              onClick={() => {
                const message = s === "cancelled"
                  ? "Cancel this repair ticket? Confirm the device has not been handed back or left in an active repair."
                  : s === "completed"
                    ? "Mark this repair as completed? Confirm the device is ready for handover."
                    : null;
                if (message && !window.confirm(message)) return;
                run(() => updateRepairStatusAction({ ticketId: repair.id, newStatus: s }));
              }}
            >
              {s.replace(/_/g, " ")}
            </Button>
          ))}
          {(NEXT_STATUS[repair.status] ?? []).length === 0 ? <span className="text-xs text-gray-500">Final status.</span> : null}
        </div>
      </div>

      <div>
        <p className="mb-1 text-xs font-medium uppercase text-gray-500">Assigned technician</p>
        <select
          defaultValue={repair.assigned_technician_id ?? ""}
          onChange={(e) => run(() => assignTechnicianAction({ ticketId: repair.id, technicianId: e.target.value || null }))}
          className="rounded-card border border-surface-border px-2 py-1.5 text-sm"
        >
          <option value="">Unassigned</option>
          {technicians.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name ?? t.id}
            </option>
          ))}
        </select>
      </div>

      <div>
        <p className="mb-1 text-xs font-medium uppercase text-gray-500">Quote</p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            step="0.01"
            value={quote}
            onChange={(e) => setQuote(Number(e.target.value))}
            className="w-32 rounded-card border border-surface-border px-2 py-1.5 text-sm"
          />
          <Button size="sm" variant="outline" disabled={isPending || !Number.isFinite(quote) || quote < 0} isLoading={isPending} onClick={() => run(() => setRepairQuoteAction({ ticketId: repair.id, quoteAmount: quote }))}>
            Set quote
          </Button>
        </div>
      </div>

      <div>
        <p className="mb-1 text-xs font-medium uppercase text-gray-500">Add update</p>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          maxLength={1000}
          placeholder="Diagnosis, progress note, etc."
          className="w-full rounded-card border border-surface-border px-2 py-1.5 text-sm"
        />
        <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs text-slate-500">{note.length}/1,000</span>
          <label className="flex items-center gap-2 text-xs text-gray-600">
            <input type="checkbox" checked={isInternal} onChange={(e) => setIsInternal(e.target.checked)} />
            Internal only (never shown to customer)
          </label>
          <Button
            size="sm"
            isLoading={isPending}
            disabled={isPending || !note.trim()}
            onClick={() =>
              run(async () => {
                const result = await addRepairUpdateAction({ ticketId: repair.id, note, isInternal });
                if (result.success) setNote("");
                return result;
              })
            }
          >
            Add note
          </Button>
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium uppercase text-gray-500">Notes &amp; history</p>
        <div className="space-y-2">
          {repair.updates.map((u) => (
            <div key={u.id} className="rounded-card border border-surface-border p-2 text-sm">
              <div className="flex items-center gap-2">
                {u.is_internal ? <Badge variant="warning">Internal</Badge> : <Badge variant="success">Customer-visible</Badge>}
                <span className="text-xs text-gray-400">
                  {new Date(u.created_at).toLocaleString("en-MW", { timeZone: "Africa/Blantyre" })}
                </span>
              </div>
              <p className="mt-1 text-gray-700">{u.note}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div>
        <p className="mb-2 text-xs font-medium uppercase text-gray-500">Technician work log</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <label className="text-xs font-medium text-slate-600">Work date
            <input type="date" value={workLog.workDate} onChange={(e) => setWorkLog((v) => ({ ...v, workDate: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </label>
          <label className="text-xs font-medium text-slate-600">Time spent (minutes)
            <input type="number" min="1" max="1440" step="1" value={workLog.durationMinutes} onChange={(e) => setWorkLog((v) => ({ ...v, durationMinutes: Number(e.target.value) }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </label>
          <label className="text-xs font-medium text-slate-600 sm:col-span-3">Work performed
            <textarea rows={3} maxLength={2000} value={workLog.workPerformed} onChange={(e) => setWorkLog((v) => ({ ...v, workPerformed: e.target.value }))} placeholder="Record diagnosis, tests, repairs and results" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </label>
        </div>
        <div className="mt-2 flex justify-end">
          <Button size="sm" isLoading={isPending} disabled={isPending || workLog.workPerformed.trim().length < 3 || !Number.isInteger(workLog.durationMinutes) || workLog.durationMinutes < 1 || workLog.durationMinutes > 1440 || !workLog.workDate} onClick={() => run(async () => { const result = await addRepairWorkLogAction({ ticketId: repair.id, ...workLog }); if (result.success) setWorkLog((v) => ({ ...v, workPerformed: "" })); return result; })}>Save work log</Button>
        </div>
        <div className="mt-3 space-y-2">
          {repair.workLogs.length === 0 ? <p className="text-sm text-slate-500">No technician work recorded yet.</p> : repair.workLogs.map((entry) => (
            <div key={entry.id} className="rounded-xl border border-slate-200 p-3">
              <div className="flex flex-wrap justify-between gap-2 text-xs text-slate-500"><span>{entry.technician_name ?? "Technician"} · {entry.work_date}</span><span>{entry.duration_minutes} minutes</span></div>
              <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{entry.work_performed}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="mb-2 text-xs font-medium uppercase text-gray-500">Parts used</p>
        {repair.parts.length === 0 ? (
          <p className="text-sm text-gray-500">No parts recorded.</p>
        ) : (
          <div className="space-y-1">
            {repair.parts.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-card border border-surface-border p-2 text-sm">
                <span>
                  {p.part_name} × {p.quantity} — {formatMoney(p.cost * p.quantity)} total
                  {p.inventory_movement_id ? <Badge variant="info" className="ml-2">Stock deducted</Badge> : null}
                </span>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => run(() => removeRepairPartAction(p.id, repair.id))}
                  className="text-xs text-status-danger hover:underline"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="mt-2 space-y-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Link to stocked item (optional)</label>
            <select
              value={stockInventoryId}
              onChange={(e) => {
                const selected = stockOptions.find((option) => option.inventory_id === e.target.value);
                setStockInventoryId(e.target.value);
                if (selected) {
                  setPartForm((current) => ({
                    ...current,
                    partName: selected.variant_name
                      ? `${selected.product_name} · ${selected.variant_name}`
                      : selected.product_name,
                  }));
                }
              }}
              className="w-full rounded-card border border-surface-border px-2 py-2 text-sm"
            >
              <option value="">Non-stocked / manually recorded part</option>
              {stockOptions.map((option) => (
                <option key={option.inventory_id} value={option.inventory_id}>
                  {option.product_name}{option.variant_name ? ` · ${option.variant_name}` : ""} · {option.sku || "No SKU"} · {option.quantity_on_hand} available
                </option>
              ))}
            </select>
          </div>
          {selectedStockOption ? (
            <p className="text-xs text-amber-700">
              {selectedStockOption.quantity_on_hand} units currently available. Adding this part deducts the requested quantity from stock.
            </p>
          ) : null}
          <div className="flex flex-wrap items-end gap-2">
          <input
            placeholder="Part name"
            value={partForm.partName}
            onChange={(e) => setPartForm((f) => ({ ...f, partName: e.target.value }))}
            className="rounded-card border border-surface-border px-2 py-1.5 text-sm"
          />
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="Unit cost"
            value={partForm.cost}
            onChange={(e) => setPartForm((f) => ({ ...f, cost: Number(e.target.value) }))}
            className="w-24 rounded-card border border-surface-border px-2 py-1.5 text-sm"
          />
          <input
            type="number"
            min="1"
            step="1"
            placeholder="Qty"
            value={partForm.quantity}
            onChange={(e) => setPartForm((f) => ({ ...f, quantity: Number(e.target.value) }))}
            className="w-20 rounded-card border border-surface-border px-2 py-1.5 text-sm"
          />
          <Button
            size="sm"
            isLoading={isPending}
            disabled={isPending || !partForm.partName.trim() || !Number.isFinite(partForm.cost) || partForm.cost < 0 || !Number.isInteger(partForm.quantity) || partForm.quantity < 1 || Boolean(selectedStockOption && partForm.quantity > selectedStockOption.quantity_on_hand)}
            onClick={() =>
              run(async () => {
                if (!partForm.partName.trim()) return { success: false, error: "Part name is required." };
                const result = await addRepairPartAction({
                  ticketId: repair.id,
                  partName: partForm.partName,
                  cost: partForm.cost,
                  quantity: partForm.quantity,
                  productId: selectedStockOption?.product_id ?? null,
                  variantId: selectedStockOption?.variant_id ?? null,
                });
                if (result.success) {
                  setPartForm({ partName: "", cost: 0, quantity: 1 });
                  setStockInventoryId("");
                }
                return result;
              })
            }
          >
            Add part
          </Button>
          </div>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Stock-linked parts deduct inventory. Manual entries record labour or components not held in the catalogue.
        </p>
      </div>
    </div>
  );
}
