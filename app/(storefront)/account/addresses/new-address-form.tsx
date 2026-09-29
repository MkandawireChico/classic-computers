"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { createAddressAction } from "./actions";

export function NewAddressForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createAddressAction(formData);
      if (result.success) {
        setOpen(false);
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  if (!open) {
    return (
      <Button variant="outline" onClick={() => setOpen(true)}>
        Add address
      </Button>
    );
  }

  return (
    <form action={handleSubmit} className="max-w-sm space-y-3 rounded-card border border-surface-border p-4">
      {error ? <Alert variant="danger">{error}</Alert> : null}
      <div className="space-y-1">
        <label htmlFor="label" className="text-sm font-medium text-gray-700">
          Label (optional)
        </label>
        <input
          id="label"
          name="label"
          placeholder="Home, Office…"
          className="w-full rounded-card border border-surface-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="line1" className="text-sm font-medium text-gray-700">
          Address
        </label>
        <input
          id="line1"
          name="line1"
          required
          className="w-full rounded-card border border-surface-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="line2" className="text-sm font-medium text-gray-700">
          Address line 2 (optional)
        </label>
        <input
          id="line2"
          name="line2"
          className="w-full rounded-card border border-surface-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="city" className="text-sm font-medium text-gray-700">
          City
        </label>
        <input
          id="city"
          name="city"
          required
          className="w-full rounded-card border border-surface-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </div>
      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input type="checkbox" name="isDefault" className="h-4 w-4 rounded border-surface-border text-brand-500" />
        Set as default address
      </label>
      <div className="flex gap-2">
        <Button type="submit" isLoading={isPending}>
          Save address
        </Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
