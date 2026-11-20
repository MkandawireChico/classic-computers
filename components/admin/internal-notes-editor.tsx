"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { updateInternalNotesAction } from "@/app/admin/orders/actions";

export function InternalNotesEditor({ orderId, initialNotes }: { orderId: string; initialNotes: string }) {
  const router = useRouter();
  const [value, setValue] = useState(initialNotes);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      try {
        const result = await updateInternalNotesAction(orderId, value);
        if (!result.success) {
          setError(result.error);
          return;
        }
        setSaved(true);
        router.refresh();
      } catch {
        setError("We could not save the internal note. Please try again.");
      }
    });
  }

  return (
    <div className="space-y-2">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={4}
        maxLength={2000}
        placeholder="Internal notes — never shown to the customer"
        className="w-full rounded-card border border-surface-border px-3 py-2 text-sm"
      />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-slate-500">{value.length}/2,000 characters</p>
        <Button size="sm" onClick={handleSave} isLoading={isPending} disabled={value === initialNotes}>
          Save internal note
        </Button>
      </div>
      {error ? <p role="alert" className="text-xs font-medium text-rose-700">{error}</p> : null}
      {saved ? <p role="status" className="text-xs font-medium text-emerald-700">Internal note saved.</p> : null}
    </div>
  );
}
