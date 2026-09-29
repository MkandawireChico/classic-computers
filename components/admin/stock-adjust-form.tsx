"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { adjustInventoryAction } from "@/app/admin/inventory/actions";

const MOVEMENT_LABELS: Record<string, string> = {
  opening: "Opening stock",
  adjustment: "Adjustment",
  damage: "Damage",
  lost: "Lost",
  correction: "Correction",
  return: "Return",
};

export function StockAdjustForm({ inventoryId, onDone }: { inventoryId: string; onDone?: () => void }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [movementType, setMovementType] = useState("adjustment");
  const [delta, setDelta] = useState(0);
  const [note, setNote] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await adjustInventoryAction({ inventoryId, movementType, quantityDelta: delta, note });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setDelta(0);
      setNote("");
      router.refresh();
      onDone?.();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-2">
      {error ? <p className="w-full text-xs text-status-danger">{error}</p> : null}
      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-700">Reason</label>
        <select
          value={movementType}
          onChange={(e) => setMovementType(e.target.value)}
          className="rounded-card border border-surface-border px-2 py-1.5 text-sm"
        >
          {Object.entries(MOVEMENT_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-700">Change (+/-)</label>
        <input
          type="number"
          value={delta}
          onChange={(e) => setDelta(Number(e.target.value))}
          className="w-24 rounded-card border border-surface-border px-2 py-1.5 text-sm"
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-700">Note</label>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="rounded-card border border-surface-border px-2 py-1.5 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={isPending || delta === 0}
        className="h-9 rounded-card bg-brand-500 px-3 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
      >
        Apply
      </button>
    </form>
  );
}
