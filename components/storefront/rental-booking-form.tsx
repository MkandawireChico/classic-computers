"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { formatMoney } from "@/lib/format/money";
import { submitRentalBookingAction, checkAvailabilityAction } from "./actions";
import type { RentableProduct } from "@/lib/data/rental-tracking";

export function RentalBookingForm({
  products,
  isAuthenticated,
}: {
  products: RentableProduct[];
  isAuthenticated: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [rentalProductId, setRentalProductId] = useState(products[0]?.rentalProductId ?? "");
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
        No products are currently set up for rental. Please contact us directly to ask about
        availability.
      </Alert>
    );
  }

  if (result) {
    return (
      <Alert variant="success" className="space-y-2">
        <p className="font-medium">Rental request submitted.</p>
        <p>
          {isAuthenticated
            ? "You can check its status any time from your account under Rentals."
            : "Save this tracking code to check status later — we can't recover it for you:"}
        </p>
        {!isAuthenticated ? <p className="rounded bg-white/60 p-2 font-mono text-xs break-all">{result.trackingToken}</p> : null}
        <p className="text-xs">This is a request — our team will confirm availability and approve it.</p>
      </Alert>
    );
  }

  const selected = products.find((p) => p.rentalProductId === rentalProductId);

  return (
    <form action={handleSubmit} className="space-y-4">
      {error ? <Alert variant="danger">{error}</Alert> : null}

      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Product</label>
        <select
          value={rentalProductId}
          onChange={(e) => {
            setRentalProductId(e.target.value);
            setAvailability(null);
          }}
          className="w-full rounded-card border border-surface-border px-3 py-2 text-sm"
        >
          {products.map((p) => (
            <option key={p.rentalProductId} value={p.rentalProductId}>
              {p.productName}
            </option>
          ))}
        </select>
        {selected ? (
          <p className="text-xs text-gray-500">
            {selected.dailyRate ? `${formatMoney(selected.dailyRate)}/day` : ""}
            {selected.weeklyRate ? ` · ${formatMoney(selected.weeklyRate)}/week` : ""}
            {selected.monthlyRate ? ` · ${formatMoney(selected.monthlyRate)}/month` : ""}
            {selected.depositAmount ? ` · Deposit ${formatMoney(selected.depositAmount)}` : ""}
            {!selected.dailyRate && !selected.weeklyRate && !selected.monthlyRate
              ? " · Pricing to be confirmed — this is a rental enquiry"
              : ""}
          </p>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Start date</label>
          <input
            type="date"
            required
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              checkAvailability(e.target.value, endDate);
            }}
            className="w-full rounded-card border border-surface-border px-3 py-2 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">End date</label>
          <input
            type="date"
            required
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              checkAvailability(startDate, e.target.value);
            }}
            className="w-full rounded-card border border-surface-border px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Quantity</label>
        <input
          type="number"
          min={1}
          max={10}
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          className="w-24 rounded-card border border-surface-border px-3 py-2 text-sm"
        />
      </div>

      {availability !== null ? (
        <p className={`text-sm ${availability >= quantity ? "text-status-success" : "text-status-danger"}`}>
          {availability} unit(s) available for those dates.{" "}
          <span className="text-xs text-gray-400">(re-checked when you submit)</span>
        </p>
      ) : null}

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

      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Additional requirements (optional)</label>
        <textarea name="notes" rows={2} className="w-full rounded-card border border-surface-border px-3 py-2 text-sm" />
      </div>

      <Button type="submit" isLoading={isPending}>
        Request rental
      </Button>
    </form>
  );
}
