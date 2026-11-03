"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { AddressRecord } from "@/lib/services/addresses";
import { updateAddressAction } from "./actions";

export function EditAddressForm({ address }: { address: AddressRecord }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await updateAddressAction(formData);
      if (result.success) {
        setIsOpen(false);
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  if (!isOpen) {
    return <Button type="button" variant="outline" size="sm" className="min-h-10 rounded-lg" onClick={() => setIsOpen(true)}>Edit</Button>;
  }

  return (
    <form action={handleSubmit} className="mt-4 grid gap-4 border-t border-slate-200 pt-4 sm:grid-cols-2">
      {error ? <div className="sm:col-span-2"><Alert variant="danger">{error}</Alert></div> : null}
      <input type="hidden" name="id" value={address.id} />
      <label className="space-y-1 text-sm font-semibold text-slate-700">Label
        <input name="label" defaultValue={address.label ?? ""} maxLength={50} className="mt-1 w-full" />
      </label>
      <label className="space-y-1 text-sm font-semibold text-slate-700">City
        <input name="city" defaultValue={address.city} required autoComplete="address-level2" className="mt-1 w-full" />
      </label>
      <label className="space-y-1 text-sm font-semibold text-slate-700 sm:col-span-2">Address line 1
        <input name="line1" defaultValue={address.line1} required autoComplete="address-line1" className="mt-1 w-full" />
      </label>
      <label className="space-y-1 text-sm font-semibold text-slate-700 sm:col-span-2">Address line 2
        <input name="line2" defaultValue={address.line2 ?? ""} autoComplete="address-line2" className="mt-1 w-full" />
      </label>
      <label className="flex min-h-11 items-center gap-3 text-sm text-slate-700 sm:col-span-2">
        <input type="checkbox" name="isDefault" defaultChecked={address.is_default} className="h-4 w-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-700" />
        Use as my default address
      </label>
      <div className="flex gap-2 sm:col-span-2">
        <Button type="submit" isLoading={isPending} className="min-h-11 rounded-lg">Save changes</Button>
        <Button type="button" variant="outline" className="min-h-11 rounded-lg" onClick={() => { setError(null); setIsOpen(false); }}>Cancel</Button>
      </div>
    </form>
  );
}