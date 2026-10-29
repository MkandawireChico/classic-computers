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
    <form action={handleSubmit} className="max-w-sm space-y-6 rounded-card border border-surface-border bg-white p-6 shadow-soft">
      {error ? <Alert variant="danger">{error}</Alert> : null}

      {/* Address Details */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Address details</h3>
        <div className="space-y-1">
          <label htmlFor="label" className="text-sm font-medium text-gray-700">
            Label (optional)
          </label>
          <input
            id="label"
            name="label"
            placeholder="Home, Office…"
            autoComplete="address-line1"
            className="w-full rounded-card border border-surface-border bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="line1" className="text-sm font-medium text-gray-700">
            Address line 1
          </label>
          <input
            id="line1"
            name="line1"
            required
            autoComplete="address-line1"
            className="w-full rounded-card border border-surface-border bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="line2" className="text-sm font-medium text-gray-700">
            Address line 2 (optional)
          </label>
          <input
            id="line2"
            name="line2"
            autoComplete="address-line2"
            className="w-full rounded-card border border-surface-border bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
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
            autoComplete="address-level2"
            className="w-full rounded-card border border-surface-border bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Options */}
      <div className="space-y-4">
        <label className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer">
          <input type="checkbox" name="isDefault" className="h-4 w-4 rounded border-surface-border text-brand-500 focus:ring-brand-500" />
          Set as default address
        </label>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button type="submit" isLoading={isPending} className="flex-1">
          Save address
        </Button>
        <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  );
}
