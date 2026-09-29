"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/format/money";
import { trackRentalAction } from "./actions";
import type { TrackedRental } from "@/lib/data/rental-tracking";

export function RentalTrackingWidget() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [rental, setRental] = useState<TrackedRental | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    setRental(null);
    startTransition(async () => {
      const result = await trackRentalAction({ trackingToken: formData.get("trackingToken")?.toString() ?? "" });
      if ("error" in result) setError(result.error);
      else setRental(result);
    });
  }

  return (
    <div className="rounded-card border border-surface-border p-4">
      <h3 className="mb-2 text-sm font-semibold text-gray-900">Track a rental request</h3>
      <form action={handleSubmit} className="flex gap-2">
        <input name="trackingToken" required placeholder="Tracking code" className="flex-1 rounded-card border border-surface-border px-3 py-1.5 text-sm" />
        <Button type="submit" size="sm" isLoading={isPending}>
          Track
        </Button>
      </form>
      {error ? <Alert variant="danger" className="mt-2">{error}</Alert> : null}
      {rental ? (
        <div className="mt-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-900">{rental.productName ?? "Rental"}</span>
            <Badge variant="info">{rental.status}</Badge>
          </div>
          <p className="mt-1 text-slate-600">
            <a href="#" className="text-brand-600 hover:underline">{rental.startDate} – {rental.endDate}</a> · Qty {rental.quantity}
          </p>
          {rental.totalCharge ? <p className="text-gray-600">Total: {formatMoney(rental.totalCharge)}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
