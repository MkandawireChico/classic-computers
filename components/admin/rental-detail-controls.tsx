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
    setError(null);
    startTransition(async () => {
      const result = await fn();
      if (!result.success) setError(result.error ?? "Something went wrong.");
      else router.refresh();
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
                variant="outline"
                isLoading={isPending}
                onClick={() => run(() => updateRentalStatusAction({ bookingId: rental.id, newStatus: s }))}
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
          <input type="number" value={charge} onChange={(e) => setCharge(Number(e.target.value))} className="w-32 rounded-card border border-surface-border px-2 py-1.5 text-sm" />
          <Button size="sm" variant="outline" isLoading={isPending} onClick={() => run(() => setRentalChargeAction({ bookingId: rental.id, totalCharge: charge }))}>
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
        <textarea value={internalNotes} onChange={(e) => setInternalNotes(e.target.value)} rows={3} className="w-full rounded-card border border-surface-border px-2 py-1.5 text-sm" />
        <Button size="sm" className="mt-1" isLoading={isPending} onClick={() => run(() => updateRentalInternalNotesAction({ bookingId: rental.id, notes: internalNotes }))}>
          Save internal note
        </Button>
      </div>
    </div>
  );
}
