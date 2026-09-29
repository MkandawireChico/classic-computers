"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { updateInternalNotesAction } from "@/app/admin/orders/actions";

export function InternalNotesEditor({ orderId, initialNotes }: { orderId: string; initialNotes: string }) {
  const router = useRouter();
  const [value, setValue] = useState(initialNotes);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      await updateInternalNotesAction(orderId, value);
      router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={3}
        placeholder="Internal notes — never shown to the customer"
        className="w-full rounded-card border border-surface-border px-3 py-2 text-sm"
      />
      <Button size="sm" onClick={handleSave} isLoading={isPending}>
        Save internal note
      </Button>
    </div>
  );
}
