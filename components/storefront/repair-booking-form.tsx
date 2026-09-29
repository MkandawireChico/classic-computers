"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { submitRepairBookingAction } from "./actions";

export function RepairBookingForm({ isAuthenticated }: { isAuthenticated: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ ticketNumber: string; trackingToken: string } | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await submitRepairBookingAction({
        deviceType: formData.get("deviceType")?.toString() ?? "",
        brand: formData.get("brand")?.toString() || undefined,
        model: formData.get("model")?.toString() || undefined,
        serialNumber: formData.get("serialNumber")?.toString() || undefined,
        problemDescription: formData.get("problemDescription")?.toString() ?? "",
        accessoriesReceived: formData.get("accessoriesReceived")?.toString() || undefined,
        guestName: formData.get("guestName")?.toString() || undefined,
        guestPhone: formData.get("guestPhone")?.toString() || undefined,
        guestEmail: formData.get("guestEmail")?.toString() || undefined,
      });
      if (!res.success) {
        setError(res.error);
        return;
      }
      setResult({ ticketNumber: res.ticketNumber, trackingToken: res.trackingToken });
    });
  }

  if (result) {
    return (
      <Alert variant="success" className="space-y-2">
        <p className="font-medium">Repair booked — ticket {result.ticketNumber}</p>
        <p>
          {isAuthenticated
            ? "You can track this repair any time from your account under Repairs."
            : "Save your tracking code to check status later — we can't recover it for you:"}
        </p>
        {!isAuthenticated ? (
          <p className="rounded bg-white/60 p-2 font-mono text-xs break-all">{result.trackingToken}</p>
        ) : null}
      </Alert>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {error ? <Alert variant="danger">{error}</Alert> : null}

      {!isAuthenticated ? (
        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold text-gray-900">Your details</legend>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input name="guestName" required placeholder="Full name" className="rounded-card border border-surface-border px-3 py-2 text-sm" />
            <input name="guestPhone" required placeholder="Phone" className="rounded-card border border-surface-border px-3 py-2 text-sm" />
          </div>
          <input name="guestEmail" type="email" placeholder="Email (optional)" className="w-full rounded-card border border-surface-border px-3 py-2 text-sm" />
        </fieldset>
      ) : null}

      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-gray-900">Device</legend>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <input name="deviceType" required placeholder="Device type (e.g. Laptop)" className="rounded-card border border-surface-border px-3 py-2 text-sm" />
          <input name="brand" placeholder="Brand" className="rounded-card border border-surface-border px-3 py-2 text-sm" />
          <input name="model" placeholder="Model" className="rounded-card border border-surface-border px-3 py-2 text-sm" />
        </div>
        <input name="serialNumber" placeholder="Serial number (optional)" className="w-full rounded-card border border-surface-border px-3 py-2 text-sm" />
      </fieldset>

      <div className="space-y-1">
        <label htmlFor="problemDescription" className="text-sm font-medium text-gray-700">
          Describe the problem
        </label>
        <textarea
          id="problemDescription"
          name="problemDescription"
          required
          rows={4}
          minLength={10}
          className="w-full rounded-card border border-surface-border px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="accessoriesReceived" className="text-sm font-medium text-gray-700">
          Accessories included (optional)
        </label>
        <input
          id="accessoriesReceived"
          name="accessoriesReceived"
          placeholder="e.g. charger, bag"
          className="w-full rounded-card border border-surface-border px-3 py-2 text-sm"
        />
      </div>

      <p className="text-xs text-gray-500">
        Submitting this creates a repair ticket for our team to review — it does not guarantee
        acceptance, and pricing/turnaround will be confirmed by our technicians.
      </p>

      <Button type="submit" isLoading={isPending}>
        Book repair
      </Button>
    </form>
  );
}
