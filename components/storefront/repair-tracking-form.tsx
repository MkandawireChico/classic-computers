"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { trackRepairAction } from "./actions";
import type { TrackedRepair } from "@/lib/data/repair-tracking";

const STATUS_VARIANT: Record<string, "neutral" | "success" | "warning" | "danger" | "info"> = {
  checked_in: "warning",
  diagnosing: "info",
  quoted: "info",
  awaiting_approval: "warning",
  in_progress: "info",
  ready_for_pickup: "info",
  completed: "success",
  cancelled: "danger",
};

export function RepairTrackingForm() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [repair, setRepair] = useState<TrackedRepair | null>(null);

  async function handleSubmit(formData: FormData) {
    if (isPending) return;
    setError(null);
    setRepair(null);
    setIsPending(true);
    try {
      const result = await trackRepairAction({
        ticketNumber: formData.get("ticketNumber")?.toString() ?? "",
        trackingToken: formData.get("trackingToken")?.toString() ?? "",
      });
      if ("error" in result) {
        setError(result.error);
      } else {
        setRepair(result);
      }
    } catch {
      setError("We couldn't retrieve your repair update. Check your connection and try again.");
    } finally {
      setIsPending(false);
    }
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("en-MW", {
      timeZone: "Africa/Blantyre",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900">Track your repair</h2>
        <p className="mt-2 text-sm text-slate-600">
          Enter your repair reference and tracking code to check the latest available update on your device.
        </p>
      </div>

      <form action={handleSubmit} className="space-y-4 sm:space-y-0 sm:flex sm:items-end sm:gap-4">
        <div className="flex-1 space-y-1.5">
          <label htmlFor="ticketNumber" className="text-sm font-semibold text-slate-700">
            Ticket number <span className="text-red-500">*</span>
          </label>
          <input
            id="ticketNumber"
            name="ticketNumber"
            required
            placeholder="REP-2026-000001"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
          />
        </div>
        <div className="flex-1 space-y-1.5">
          <label htmlFor="trackingToken" className="text-sm font-semibold text-slate-700">
            Tracking code <span className="text-red-500">*</span>
          </label>
          <input
            id="trackingToken"
            name="trackingToken"
            required
            placeholder="Your tracking code"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
          />
        </div>
        <Button type="submit" isLoading={isPending} disabled={isPending} className="rounded-xl min-h-[52px] w-full sm:w-auto">
          Track repair
        </Button>
      </form>

      {error ? (
        <Alert variant="danger" className="rounded-xl">
          {error}
        </Alert>
      ) : null}

      {repair ? (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-extrabold text-slate-900">{repair.ticketNumber}</h3>
                <p className="mt-1 text-sm text-slate-600">Submitted {formatDate(repair.createdAt)}</p>
              </div>
              <Badge variant={STATUS_VARIANT[repair.status] ?? "neutral"} className="px-3 py-1.5 text-sm">
                {repair.status.replace(/_/g, " ")}
              </Badge>
            </div>

            <div className="mt-6 space-y-4 border-t border-slate-100 pt-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Device</p>
                <p className="mt-1 text-base font-semibold text-slate-900">
                  {repair.deviceType}
                  {repair.brand ? ` · ${repair.brand}` : ""}
                  {repair.model ? ` · ${repair.model}` : ""}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Problem description</p>
                <p className="mt-1 text-sm text-slate-700">{repair.problemDescription}</p>
              </div>
            </div>
          </div>

          {repair.updates.length > 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500">Repair updates</h4>
              <ol className="mt-4 space-y-4 border-l-2 border-slate-200 pl-4">
                {repair.updates.map((u, i) => (
                  <li key={i} className="relative">
                    <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-brand-600 border-2 border-white" />
                    <p className="text-sm text-slate-900">{u.note}</p>
                    <p className="mt-1 text-xs text-slate-500">{formatDate(u.createdAt)}</p>
                  </li>
                ))}
              </ol>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
              <p className="text-sm text-slate-600">No updates have been posted yet. Our team will add updates as your repair progresses.</p>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
