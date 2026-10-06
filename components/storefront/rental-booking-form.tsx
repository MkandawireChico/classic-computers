"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { formatMoney } from "@/lib/format/money";
import { submitRentalBookingAction, checkAvailabilityAction } from "./actions";
import type { RentableProduct } from "@/lib/data/rental-tracking";

export function RentalBookingForm({
  products,
  isAuthenticated,
  defaultRentalProductId,
}: {
  products: RentableProduct[];
  isAuthenticated: boolean;
  defaultRentalProductId?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [rentalProductId, setRentalProductId] = useState(defaultRentalProductId ?? products[0]?.rentalProductId ?? "");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [availability, setAvailability] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ trackingToken: string } | null>(null);

  function checkAvailability(nextStart: string, nextEnd: string) {
    if (!nextStart || !nextEnd || !rentalProductId) return;
    startTransition(async () => {
      const avail = await checkAvailabilityAction(rentalProductId, nextStart, nextEnd);
      setAvailability(avail);
    });
  }

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await submitRentalBookingAction({
        rentalProductId,
        quantity,
        startDate,
        endDate,
        notes: formData.get("notes")?.toString() || undefined,
        guestName: formData.get("guestName")?.toString() || undefined,
        guestPhone: formData.get("guestPhone")?.toString() || undefined,
        guestEmail: formData.get("guestEmail")?.toString() || undefined,
      });
      if (!res.success) {
        setError(res.error);
        return;
      }
      setResult({ trackingToken: res.trackingToken });
    });
  }

  if (products.length === 0) {
    return (
      <Alert variant="warning">
        <p>No rental products are currently listed. Contact us to ask about availability.</p>
        <Link href="/contact" className="mt-2 inline-flex font-medium text-brand-700 underline underline-offset-2">
          Contact Classic Computers
        </Link>
      </Alert>
    );
  }

  if (result) {
    return (
      <div className="space-y-4">
        <Alert variant="success" className="space-y-3">
          <p className="font-medium">Rental request submitted</p>
          <p className="text-sm">
            {isAuthenticated
              ? "You can check its status any time from your account under Rentals."
              : "Save this tracking code to check status later — we can't recover it for you:"}
          </p>
          {!isAuthenticated ? (
            <p className="rounded bg-white/60 p-3 font-mono text-xs break-all">{result.trackingToken}</p>
          ) : null}
          <p className="text-xs text-gray-600">This is a request — our team will confirm availability and approve it.</p>
        </Alert>
        <Link
          href="/rentals"
          className="inline-flex w-full items-center justify-center rounded-card border border-surface-border px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-surface-muted transition-colors"
        >
          Back to rentals
        </Link>
      </div>
    );
  }

  const selected = products.find((p) => p.rentalProductId === rentalProductId) ?? products[0] ?? null;

  return (
    <form action={handleSubmit} className="space-y-6">
      {error ? <Alert variant="danger">{error}</Alert> : null}

      {/* Rental Item Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Rental item</h3>
        <div className="space-y-1">
          <label htmlFor="rental-product" className="text-sm font-medium text-gray-700">
            Product
          </label>
          <select
            id="rental-product"
            value={rentalProductId}
            onChange={(e) => {
              setRentalProductId(e.target.value);
              setAvailability(null);
            }}
            className="w-full rounded-card border border-surface-border bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            {products.map((p) => (
              <option key={p.rentalProductId} value={p.rentalProductId}>
                {p.productName}{p.variantName ? ` — ${p.variantName}` : ""}
              </option>
            ))}
          </select>
          {selected ? (
            <p className="text-xs text-gray-500">
              {selected.variantName ? `${selected.variantName} · ` : ""}
              {selected.dailyRate ? `${formatMoney(selected.dailyRate)}/day` : ""}
              {selected.weeklyRate ? ` · ${formatMoney(selected.weeklyRate)}/week` : ""}
              {selected.monthlyRate ? ` · ${formatMoney(selected.monthlyRate)}/month` : ""}
              {selected.depositAmount ? ` · Deposit ${formatMoney(selected.depositAmount)}` : ""}
              {!selected.dailyRate && !selected.weeklyRate && !selected.monthlyRate
                ? " · Pricing to be confirmed — this is a rental enquiry"
                : ""}
              {selected.availableQuantity > 0 ? ` · ${selected.availableQuantity} available` : " · Currently unavailable"}
            </p>
          ) : null}
        </div>
      </div>

      {/* Rental Period Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Rental period</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label htmlFor="rental-start-date" className="text-sm font-medium text-gray-700">
              Start date
            </label>
            <input
              id="rental-start-date"
              type="date"
              required
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                checkAvailability(e.target.value, endDate);
              }}
              className="w-full rounded-card border border-surface-border bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="rental-end-date" className="text-sm font-medium text-gray-700">
              End date
            </label>
            <input
              id="rental-end-date"
              type="date"
              required
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                checkAvailability(startDate, e.target.value);
              }}
              className="w-full rounded-card border border-surface-border bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>
        <div className="space-y-1">
          <label htmlFor="rental-quantity" className="text-sm font-medium text-gray-700">
            Quantity
          </label>
          <input
            id="rental-quantity"
            type="number"
            min={1}
            max={10}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-full rounded-card border border-surface-border bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
        {availability !== null ? (
          <p className={`text-sm ${availability >= quantity ? "text-status-success" : "text-status-danger"}`}>
            {availability} unit(s) available for those dates.{" "}
            <span className="text-xs text-gray-400">(re-checked when you submit)</span>
          </p>
        ) : null}
      </div>

      {/* Customer Information Section */}
      {!isAuthenticated ? (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900">Your information</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label htmlFor="rental-guest-name" className="text-sm font-medium text-gray-700">
                Full name
              </label>
              <input
                id="rental-guest-name"
                name="guestName"
                required
                autoComplete="name"
                className="w-full rounded-card border border-surface-border bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="rental-guest-phone" className="text-sm font-medium text-gray-700">
                Phone
              </label>
              <input
                id="rental-guest-phone"
                name="guestPhone"
                required
                type="tel"
                autoComplete="tel"
                className="w-full rounded-card border border-surface-border bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label htmlFor="rental-guest-email" className="text-sm font-medium text-gray-700">
              Email (optional)
            </label>
            <input
              id="rental-guest-email"
              name="guestEmail"
              type="email"
              autoComplete="email"
              className="w-full rounded-card border border-surface-border bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>
      ) : null}

      {/* Additional Information Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Additional information</h3>
        <div className="space-y-1">
          <label htmlFor="rental-notes" className="text-sm font-medium text-gray-700">
            Additional requirements (optional)
          </label>
          <textarea
            id="rental-notes"
            name="notes"
            rows={3}
            className="w-full rounded-card border border-surface-border bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <Button type="submit" isLoading={isPending} className="w-full" disabled={isPending}>
          Confirm Rental Request
        </Button>
        <Link
          href="/rentals"
          className="block w-full text-center text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors"
        >
          Cancel and return to rentals
        </Link>
      </div>
    </form>
  );
}
