"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
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
      <div className="space-y-4">
        <Alert variant="success" className="space-y-3">
          <p className="font-medium">Repair booked — ticket {result.ticketNumber}</p>
          <p className="text-sm">
            {isAuthenticated
              ? "You can track this repair any time from your account under Repairs."
              : "Save your tracking code to check status later — we can't recover it for you:"}
          </p>
          {!isAuthenticated ? (
            <p className="rounded bg-white/60 p-3 font-mono text-xs break-all">{result.trackingToken}</p>
          ) : null}
          <p className="text-xs text-gray-600">Our team will review your ticket and follow up with next steps.</p>
        </Alert>
        <Link
          href="/repairs"
          className="inline-flex w-full items-center justify-center rounded-card border border-surface-border px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-surface-muted transition-colors"
        >
          Back to repairs
        </Link>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {error ? <Alert variant="danger">{error}</Alert> : null}

      {/* Your Information Section */}
      {!isAuthenticated ? (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900">Your information</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label htmlFor="repair-guest-name" className="text-sm font-medium text-gray-700">
                Full name
              </label>
              <input
                id="repair-guest-name"
                name="guestName"
                required
                autoComplete="name"
                className="w-full rounded-card border border-surface-border bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="repair-guest-phone" className="text-sm font-medium text-gray-700">
                Phone
              </label>
              <input
                id="repair-guest-phone"
                name="guestPhone"
                required
                type="tel"
                autoComplete="tel"
                className="w-full rounded-card border border-surface-border bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label htmlFor="repair-guest-email" className="text-sm font-medium text-gray-700">
              Email (optional)
            </label>
            <input
              id="repair-guest-email"
              name="guestEmail"
              type="email"
              autoComplete="email"
              className="w-full rounded-card border border-surface-border bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>
      ) : null}

      {/* Device Information Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Device information</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-1">
            <label htmlFor="repair-device-type" className="text-sm font-medium text-gray-700">
              Device type
            </label>
            <input
              id="repair-device-type"
              name="deviceType"
              required
              placeholder="e.g. Laptop"
              className="w-full rounded-card border border-surface-border bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="repair-brand" className="text-sm font-medium text-gray-700">
              Brand
            </label>
            <input
              id="repair-brand"
              name="brand"
              className="w-full rounded-card border border-surface-border bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="repair-model" className="text-sm font-medium text-gray-700">
              Model
            </label>
            <input
              id="repair-model"
              name="model"
              className="w-full rounded-card border border-surface-border bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>
        <div className="space-y-1">
          <label htmlFor="repair-serial" className="text-sm font-medium text-gray-700">
            Serial number (optional)
          </label>
          <input
            id="repair-serial"
            name="serialNumber"
            className="w-full rounded-card border border-surface-border bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Problem Description Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Problem description</h3>
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
            className="w-full rounded-card border border-surface-border bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Additional Information Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Additional information</h3>
        <div className="space-y-1">
          <label htmlFor="accessoriesReceived" className="text-sm font-medium text-gray-700">
            Accessories included (optional)
          </label>
          <input
            id="accessoriesReceived"
            name="accessoriesReceived"
            placeholder="e.g. charger, bag"
            className="w-full rounded-card border border-surface-border bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <p className="text-xs text-gray-500">
          Submitting this creates a repair ticket for our team to review — it does not guarantee
          acceptance, and pricing/turnaround will be confirmed by our technicians.
        </p>
        <Button type="submit" isLoading={isPending} className="w-full" disabled={isPending}>
          Book Repair
        </Button>
        <Link
          href="/repairs"
          className="block w-full text-center text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors"
        >
          Cancel and return to repairs
        </Link>
      </div>
    </form>
  );
}
