"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { createAddressAction } from "./actions";

export function NewAddressForm() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  async function handleSubmit(formData: FormData) {
    if (isPending) return;
    setError(null);
    setIsPending(true);
    try {
      const result = await createAddressAction(formData);
      if (result.success) {
        setOpen(false);
        router.refresh();
      } else {
        setError(result.error);
      }
    } catch {
      setError("We couldn't save this address. Check your connection and try again.");
    } finally {
      setIsPending(false);
    }
  }

  if (!open) {
    return (
      <Button variant="outline" onClick={() => setOpen(true)}>
        Add address
      </Button>
    );
  }

  return (
    <form action={handleSubmit} className="max-w-sm space-y-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      {error ? <Alert variant="danger">{error}</Alert> : null}

      {/* Address Details */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-950">Address details</h3>
        <div className="space-y-1">
          <label htmlFor="label" className="text-sm font-medium text-slate-700">
            Label (optional)
          </label>
          <input
            id="label"
            name="label"
            placeholder="Home, Office…"
            autoComplete="address-line1"
            className="w-full min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="line1" className="text-sm font-medium text-slate-700">
            Address line 1
          </label>
          <input
            id="line1"
            name="line1"
            required
            autoComplete="address-line1"
            className="w-full min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="line2" className="text-sm font-medium text-slate-700">
            Address line 2 (optional)
          </label>
          <input
            id="line2"
            name="line2"
            autoComplete="address-line2"
            className="w-full min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="city" className="text-sm font-medium text-slate-700">
            City
          </label>
          <input
            id="city"
            name="city"
            required
            autoComplete="address-level2"
            className="w-full min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
      </div>

      {/* Options */}
      <div className="space-y-4">
        <label className="flex items-center gap-3 text-sm text-slate-700 cursor-pointer">
          <input type="checkbox" name="isDefault" className="h-4 w-4 rounded border-surface-border text-brand-500 focus:ring-brand-500" />
          Set as default address
        </label>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button type="submit" isLoading={isPending} disabled={isPending} className="flex-1">
          Save address
        </Button>
        <Button type="button" variant="outline" disabled={isPending} onClick={() => setOpen(false)} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  );
}
