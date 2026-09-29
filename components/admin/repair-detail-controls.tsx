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
} from "@/app/admin/repairs/actions";
import type { AdminRepairDetail } from "@/lib/data/admin/repairs";

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
}: {
  repair: AdminRepairDetail;
  technicians: Array<{ id: string; name: string | null }>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [isInternal, setIsInternal] = useState(true);
  const [quote, setQuote] = useState(repair.quote_amount ?? 0);
  const [partForm, setPartForm] = useState({ partName: "", cost: 0, quantity: 1 });

  function run(fn: () => Promise<{ success: boolean; error?: string }>) {
    setError(null);
    startTransition(async () => {
      const result = await fn();
      if (!result.success) setError(result.error ?? "Something went wrong.");
      else router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {error ? <Alert variant="danger">{error}</Alert> : null}

      <div>
        <p className="mb-1 text-xs font-medium uppercase text-gray-500">Status</p>
        <div className="flex flex-wrap gap-2">
          {(NEXT_STATUS[repair.status] ?? []).map((s) => (
            <Button
              key={s}
              size="sm"
              variant="outline"
              isLoading={isPending}
              onClick={() => run(() => updateRepairStatusAction({ ticketId: repair.id, newStatus: s }))}
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
            value={quote}
            onChange={(e) => setQuote(Number(e.target.value))}
            className="w-32 rounded-card border border-surface-border px-2 py-1.5 text-sm"
          />
          <Button size="sm" variant="outline" isLoading={isPending} onClick={() => run(() => setRepairQuoteAction({ ticketId: repair.id, quoteAmount: quote }))}>
            Set quote
          </Button>
        </div>
      </div>

      <div>
        <p className="mb-1 text-xs font-medium uppercase text-gray-500">Add update</p>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          placeholder="Diagnosis, progress note, etc."
          className="w-full rounded-card border border-surface-border px-2 py-1.5 text-sm"
        />
        <div className="mt-1 flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs text-gray-600">
            <input type="checkbox" checked={isInternal} onChange={(e) => setIsInternal(e.target.checked)} />
            Internal only (never shown to customer)
          </label>
          <Button
            size="sm"
            isLoading={isPending}
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
        <p className="mb-2 text-xs font-medium uppercase text-gray-500">Parts used</p>
        {repair.parts.length === 0 ? (
          <p className="text-sm text-gray-500">No parts recorded.</p>
        ) : (
          <div className="space-y-1">
            {repair.parts.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-card border border-surface-border p-2 text-sm">
                <span>
                  {p.part_name} × {p.quantity} — {formatMoney(p.cost)}
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
        <div className="mt-2 flex flex-wrap items-end gap-2">
          <input
            placeholder="Part name"
            value={partForm.partName}
            onChange={(e) => setPartForm((f) => ({ ...f, partName: e.target.value }))}
            className="rounded-card border border-surface-border px-2 py-1.5 text-sm"
          />
          <input
            type="number"
            placeholder="Cost"
            value={partForm.cost}
            onChange={(e) => setPartForm((f) => ({ ...f, cost: Number(e.target.value) }))}
            className="w-24 rounded-card border border-surface-border px-2 py-1.5 text-sm"
          />
          <input
            type="number"
            placeholder="Qty"
            value={partForm.quantity}
            onChange={(e) => setPartForm((f) => ({ ...f, quantity: Number(e.target.value) }))}
            className="w-20 rounded-card border border-surface-border px-2 py-1.5 text-sm"
          />
          <Button
            size="sm"
            isLoading={isPending}
            onClick={() =>
              run(async () => {
                if (!partForm.partName) return { success: false, error: "Part name is required." };
                const result = await addRepairPartAction({
                  ticketId: repair.id,
                  partName: partForm.partName,
                  cost: partForm.cost,
                  quantity: partForm.quantity,
                  productId: null,
                  variantId: null,
                });
                if (result.success) setPartForm({ partName: "", cost: 0, quantity: 1 });
                return result;
              })
            }
          >
            Add part
          </Button>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          This quick-add records a non-stocked part. Linking a part to a real catalogue product
          (to deduct inventory) is available from the product picker in a future refinement — see
          the Phase 6 report.
        </p>
      </div>
    </div>
  );
}
