"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { trackRepairAction } from "./actions";
import type { TrackedRepair } from "@/lib/data/repair-tracking";
import { getRepairStatusDetails } from "@/lib/repairs/status";

export function RepairTrackingForm() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [repair, setRepair] = useState<TrackedRepair | null>(null);
  const [ticketNumber, setTicketNumber] = useState("");
  const [trackingToken, setTrackingToken] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPending) return;
    setError(null);
    setRepair(null);
    setIsPending(true);
    try {
      const result = await trackRepairAction({ ticketNumber, trackingToken });
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

  const status = repair ? getRepairStatusDetails(repair.status) : null;

  return (
    <div className="space-y-7">
      <div>
        <h2 className="text-xl font-bold text-slate-950">Find your repair update</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Enter the repair reference and private tracking code supplied after your request was submitted.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="space-y-1.5">
          <label htmlFor="repair-ticket-number" className="text-sm font-semibold text-slate-800">
            Repair reference
          </label>
          <input
            id="repair-ticket-number"
            name="ticketNumber"
            type="text"
            required
            autoComplete="off"
            spellCheck={false}
            value={ticketNumber}
            onChange={(event) => setTicketNumber(event.target.value)}
            placeholder="REP-2026-000001"
            className="min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="repair-tracking-code" className="text-sm font-semibold text-slate-800">
            Private tracking code
          </label>
          <input
            id="repair-tracking-code"
            name="trackingToken"
            type="text"
            required
            autoComplete="off"
            spellCheck={false}
            value={trackingToken}
            onChange={(event) => setTrackingToken(event.target.value)}
            placeholder="Enter the tracking code from your confirmation"
            className="min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
        <p className="text-xs leading-5 text-slate-500">
          Keep your tracking code private. You need both details to view a guest repair request.
        </p>
        <Button type="submit" isLoading={isPending} disabled={isPending || !ticketNumber.trim() || !trackingToken.trim()} className="min-h-12 w-full rounded-xl sm:w-auto">
          Check repair status
        </Button>
      </form>

      {error ? (
        <Alert variant="danger" className="rounded-xl" role="alert">
          {error}
        </Alert>
      ) : null}

      {repair ? (
        <section aria-live="polite" aria-labelledby="repair-result-heading" className="space-y-5">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-[#f7f9fa] p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-700">Repair reference</p>
                  <h3 id="repair-result-heading" className="mt-2 text-2xl font-bold tracking-tight text-slate-950">{repair.ticketNumber}</h3>
                  <p className="mt-1 text-sm text-slate-500">Request submitted {formatDate(repair.createdAt)}</p>
                </div>
                <Badge variant={status?.variant ?? "neutral"} className="px-3 py-1.5 text-xs font-semibold">
                  {status.label}
                </Badge>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-950">{status.label}</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {status.description}
                </p>
              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Device</p>
                  <p className="mt-1 text-sm font-semibold text-slate-950">
                    {repair.deviceType}
                    {repair.brand ? ` · ${repair.brand}` : ""}
                    {repair.model ? ` · ${repair.model}` : ""}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Reported issue</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-700">{repair.problemDescription}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="text-base font-bold text-slate-950">Repair activity</h4>
                <p className="mt-1 text-sm text-slate-500">Customer-visible updates from the repair team.</p>
              </div>
              <span className="text-xs text-slate-500">{repair.updates.length} {repair.updates.length === 1 ? "update" : "updates"}</span>
            </div>
            {repair.updates.length > 0 ? (
              <ol className="mt-5 space-y-5">
                {repair.updates.map((update, index) => (
                  <li key={`${update.createdAt}-${index}`} className="relative flex gap-4">
                    <span aria-hidden="true" className="relative mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-800">
                      <span className="h-2 w-2 rounded-full bg-brand-700" />
                    </span>
                    {index < repair.updates.length - 1 ? (
                      <span aria-hidden="true" className="absolute left-[13px] top-8 h-[calc(100%+0.75rem)] w-px bg-slate-200" />
                    ) : null}
                    <div className="min-w-0 flex-1 pb-1">
                      <p className="whitespace-pre-wrap text-sm leading-6 text-slate-800">{update.note}</p>
                      <p className="mt-1 text-xs text-slate-500">{formatDate(update.createdAt)}</p>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="mt-5 rounded-xl bg-slate-50 p-5">
                <p className="text-sm font-medium text-slate-800">No progress notes have been posted yet.</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">Your request is recorded. Check again later for updates from the repair team.</p>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setRepair(null)}
            className="text-sm font-semibold text-brand-800 underline decoration-brand-300 underline-offset-4 hover:text-brand-950"
          >
            Track another repair
          </button>
        </section>
      ) : null}
    </div>
  );
}
