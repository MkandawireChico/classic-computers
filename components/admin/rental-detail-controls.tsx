"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { updateRentalStatusAction, updateRentalInternalNotesAction, setRentalChargeAction } from "@/app/admin/rentals/actions";
import type { AdminRentalDetail } from "@/lib/data/admin/rentals";

const NEXT_STATUS: Record<string, string[]> = {
  requested: ["approved", "cancelled"],
  approved: ["ready", "cancelled"],
  ready: ["active", "cancelled"],
  active: ["returned", "overdue", "damaged", "lost"],
  overdue: ["returned", "damaged", "lost"],
  returned: [],
  damaged: [],
  lost: [],
  cancelled: [],
};

export function RentalDetailControls({ rental }: { rental: AdminRentalDetail }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [internalNotes, setInternalNotes] = useState(rental.internal_notes ?? "");
  const [charge, setCharge] = useState(rental.total_charge ?? 0);

  function run(fn: () => Promise<{ success: boolean; error?: string }>) {
    if (isPending) return;
    setError(null);
    startTransition(async () => {
      try {
        const result = await fn();
        if (!result.success) setError(result.error ?? "Something went wrong.");
        else router.refresh();
      } catch {
        setError("The rental update failed. Refresh the page and try again.");
      }
    });
  }

  const nextOptions = NEXT_STATUS[rental.status] ?? [];

  return (
    <div className="space-y-4">
      {error ? <Alert variant="danger">{error}</Alert> : null}

      <div>
        <p className="mb-1 text-xs font-medium uppercase text-gray-500">Status</p>
        {nextOptions.length === 0 ? (
          <p className="text-xs text-gray-500">Final status.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {nextOptions.map((s) => (
              <Button
                key={s}
                size="sm"
                variant={s === "cancelled" || s === "damaged" || s === "lost" ? "danger" : "outline"}
                isLoading={isPending}
                disabled={isPending}
                onClick={() => {
                  const message = s === "cancelled"
                    ? "Cancel this rental request?"
                    : s === "active"
                      ? "Confirm handover? This action deducts the rental quantity from stock."
                      : s === "returned"
                        ? "Confirm the equipment has been returned? This action restores the rental quantity to stock."
                        : s === "damaged" || s === "lost"
                          ? `Mark this equipment as ${s}? Review the stock impact before continuing.`
                          : null;
                  if (message && !window.confirm(message)) return;
                  run(() => updateRentalStatusAction({ bookingId: rental.id, newStatus: s }));
                }}
              >
                {s}
              </Button>
            ))}
          </div>
        )}
        {(nextOptions.includes("active") || nextOptions.includes("returned")) ? (
          <p className="mt-1 text-xs text-gray-500">
            Moving to &ldquo;active&rdquo; deducts stock; &ldquo;returned&rdquo; restores it —
            both through the same inventory ledger used everywhere else.
          </p>
        ) : null}
      </div>

      <div>
        <p className="mb-1 text-xs font-medium uppercase text-gray-500">Charge (MWK)</p>
        <div className="flex items-center gap-2">
          <input type="number" min="0" step="0.01" value={charge} onChange={(e) => setCharge(Number(e.target.value))} className="w-32 rounded-card border border-surface-border px-2 py-1.5 text-sm" />
          <Button size="sm" variant="outline" disabled={isPending || !Number.isFinite(charge) || charge < 0} isLoading={isPending} onClick={() => run(() => setRentalChargeAction({ bookingId: rental.id, totalCharge: charge }))}>
            Save
          </Button>
        </div>
      </div>

      {rental.notes ? (
        <div>
          <p className="mb-1 text-xs font-medium uppercase text-gray-500">Customer&apos;s request notes</p>
          <p className="rounded-card border border-surface-border bg-surface-muted p-2 text-sm text-gray-700">{rental.notes}</p>
        </div>
      ) : null}

      <div>
        <p className="mb-1 text-xs font-medium uppercase text-gray-500">Internal notes (staff only — never shown to the customer)</p>
        <textarea value={internalNotes} maxLength={1000} onChange={(e) => setInternalNotes(e.target.value)} rows={4} className="w-full rounded-card border border-surface-border px-2 py-1.5 text-sm" />
        <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs text-slate-500">{internalNotes.length}/1,000</span>
          <Button size="sm" disabled={isPending || internalNotes.length > 1000} className="mt-1" isLoading={isPending} onClick={() => run(() => updateRentalInternalNotesAction({ bookingId: rental.id, notes: internalNotes }))}>
            Save internal note
          </Button>
        </div>
      </div>
    </div>
  );
}
