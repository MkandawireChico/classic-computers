"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { trackRepairAction } from "./actions";
import type { TrackedRepair } from "@/lib/data/repair-tracking";

export function RepairTrackingForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [repair, setRepair] = useState<TrackedRepair | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    setRepair(null);
    startTransition(async () => {
      const result = await trackRepairAction({
        ticketNumber: formData.get("ticketNumber")?.toString() ?? "",
        trackingToken: formData.get("trackingToken")?.toString() ?? "",
      });
      if ("error" in result) {
        setError(result.error);
      } else {
        setRepair(result);
      }
    });
  }

  return (
    <div className="space-y-6">
      <form action={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-1">
          <label htmlFor="ticketNumber" className="text-sm font-medium text-gray-700">
            Ticket number
          </label>
          <input
            id="ticketNumber"
            name="ticketNumber"
            required
            placeholder="REP-2026-000001"
            className="w-full rounded-card border border-surface-border px-3 py-2 text-sm"
          />
        </div>
        <div className="flex-1 space-y-1">
          <label htmlFor="trackingToken" className="text-sm font-medium text-gray-700">
            Tracking code
          </label>
          <input
            id="trackingToken"
            name="trackingToken"
            required
            className="w-full rounded-card border border-surface-border px-3 py-2 text-sm"
          />
        </div>
        <Button type="submit" isLoading={isPending}>
          Track
        </Button>
      </form>

      {error ? <Alert variant="danger">{error}</Alert> : null}

      {repair ? (
        <div className="rounded-card border border-surface-border p-4">
          <div className="flex items-center justify-between">
            <p className="font-medium text-gray-900">{repair.ticketNumber}</p>
            <Badge variant="info">{repair.status.replace(/_/g, " ")}</Badge>
          </div>
          <p className="mt-1 text-sm text-gray-600">
            {repair.deviceType} {repair.brand ? `· ${repair.brand}` : ""} {repair.model ? repair.model : ""}
          </p>
          <p className="mt-2 text-sm text-gray-700">{repair.problemDescription}</p>

          {repair.updates.length > 0 ? (
            <div className="mt-4">
              <p className="mb-1 text-xs font-medium uppercase text-gray-500">Updates</p>
              <ul className="space-y-1">
                {repair.updates.map((u, i) => (
                  <li key={i} className="text-sm text-gray-600">
                    {u.note}{" "}
                    <span className="text-xs text-gray-400">
                      ({new Date(u.createdAt).toLocaleDateString("en-MW", { timeZone: "Africa/Blantyre" })})
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
