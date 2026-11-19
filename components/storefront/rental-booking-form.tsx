"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { formatMoney } from "@/lib/format/money";
import { getOrCreateSubmissionKey, markSubmissionComplete, renewSubmissionKey } from "@/lib/client/submission-key";
import { submitRentalBookingAction, checkAvailabilityAction } from "./actions";
import type { RentableProduct } from "@/lib/data/rental-tracking";
import { trackInterestEvent } from "@/lib/client/customer-interest-analytics";

type StepId = "equipment" | "period" | "customer" | "review";

const STEPS: Array<{ id: StepId; title: string }> = [
  { id: "equipment", title: "Equipment" },
  { id: "period", title: "Dates" },
  { id: "customer", title: "Your details" },
  { id: "review", title: "Review" },
];

export function RentalBookingForm({
  products,
  isAuthenticated,
  defaultRentalProductId,
}: {
  products: RentableProduct[];
  isAuthenticated: boolean;
  defaultRentalProductId?: string;
}) {
  const [isPending, setIsPending] = useState(false);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const availabilityRequestId = useRef(0);
  const [rentalProductId, setRentalProductId] = useState(
    defaultRentalProductId ?? products[0]?.rentalProductId ?? "",
  );
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [availability, setAvailability] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ trackingToken: string } | null>(null);
  const [currentStep, setCurrentStep] = useState<StepId>("equipment");
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const submissionKey = useRef<string | null>(null);
  const startedEventSent = useRef(false);

  useEffect(() => {
    if (startedEventSent.current) return;
    startedEventSent.current = true;
    trackInterestEvent({ name: "rental_request_started" });
  }, []);

  const [formData, setFormData] = useState({
    guestName: "",
    guestPhone: "",
    guestEmail: "",
    notes: "",
  });
  const adjustedSteps = isAuthenticated
    ? STEPS.filter((step) => step.id !== "customer")
    : STEPS;

  async function checkAvailability(nextStart: string, nextEnd: string) {
    const requestId = ++availabilityRequestId.current;
    setAvailability(null);
    if (!nextStart || !nextEnd || !rentalProductId) {
      setIsCheckingAvailability(false);
      return;
    }
    setIsCheckingAvailability(true);
    setError(null);
    try {
      const avail = await checkAvailabilityAction(rentalProductId, nextStart, nextEnd);
      if (requestId === availabilityRequestId.current) setAvailability(avail);
    } catch (availabilityError) {
      console.error("Rental availability check failed:", availabilityError);
      if (requestId === availabilityRequestId.current) {
        setError("We couldn't check availability for those dates. Please try again.");
      }
    } finally {
      if (requestId === availabilityRequestId.current) setIsCheckingAvailability(false);
    }
  }

  function validateStep(step: StepId): boolean {
    const errors: Record<string, string> = {};

    if (step === "equipment") {
      if (!rentalProductId) errors.rentalProductId = "Please select an equipment item";
    }

    if (step === "period") {
      if (!startDate) errors.startDate = "Start date is required";
      if (!endDate) errors.endDate = "End date is required";
      if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
        errors.endDate = "End date must be on or after start date";
      }
      if (startDate && new Date(startDate) < new Date(new Date().toDateString())) {
        errors.startDate = "Start date cannot be in the past";
      }
      if (quantity < 1) errors.quantity = "Quantity must be at least 1";
    }

    if (step === "customer" && !isAuthenticated) {
      if (!formData.guestName.trim()) errors.guestName = "Full name is required";
      if (!formData.guestPhone.trim()) errors.guestPhone = "Phone number is required";
      if (formData.guestPhone.trim().length < 6) errors.guestPhone = "Phone number is too short";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function nextStep() {
    if (!validateStep(currentStep)) return;

    const currentIndex = adjustedSteps.findIndex((step) => step.id === currentStep);
    const nextIndex = currentIndex + 1;
    const nextStep = adjustedSteps[nextIndex];
    if (nextStep) {
      setCurrentStep(nextStep.id);
    }
  }

  function previousStep() {
    const currentIndex = adjustedSteps.findIndex((step) => step.id === currentStep);
    const prevIndex = currentIndex - 1;
    const prevStep = adjustedSteps[prevIndex];
    if (prevStep) {
      setCurrentStep(prevStep.id);
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isPending || isCheckingAvailability) return;
    setError(null);
    if (!validateStep(currentStep)) return;
    setIsPending(true);
    try {
      submissionKey.current ??= getOrCreateSubmissionKey("rental-booking");
      const res = await submitRentalBookingAction(
        {
          rentalProductId,
          quantity,
          startDate,
          endDate,
          notes: formData.notes || undefined,
          guestName: isAuthenticated ? undefined : formData.guestName,
          guestPhone: isAuthenticated ? undefined : formData.guestPhone,
          guestEmail: isAuthenticated ? undefined : formData.guestEmail,
        },
        submissionKey.current,
      );
      if (!res.success) {
        setError(res.error);
        return;
      }
      try {
        trackInterestEvent({ name: "rental_request_submitted" });
      } catch (analyticsError) {
        console.warn("Rental analytics could not be recorded:", analyticsError);
      }
      try {
        markSubmissionComplete("rental-booking");
      } catch (storageError) {
        console.warn("Rental submission marker could not be saved:", storageError);
      }
      setResult({ trackingToken: res.trackingToken });
    } catch (submitError) {
      console.error("Rental request submission failed:", submitError);
      setError("We couldn't submit your rental request. Please check your connection and try again.");
    } finally {
      setIsPending(false);
    }
  }

  if (products.length === 0) {
    return (
      <Alert variant="warning">
        <p>No rental products are currently listed. Contact us to ask about availability.</p>
        <Link
          href="/contact"
          className="mt-2 inline-flex font-medium text-brand-700 underline underline-offset-2"
        >
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
            <p className="break-all rounded bg-white/60 p-3 font-mono text-xs">
              {result.trackingToken}
            </p>
          ) : null}
          <p className="text-xs text-gray-600">
            This is a request — our team will confirm availability and approve it.
          </p>
        </Alert>
        <Button type="button" variant="outline" className="w-full" onClick={() => {
          submissionKey.current = renewSubmissionKey("rental-booking");
          setResult(null);
          setStartDate("");
          setEndDate("");
          setQuantity(1);
          setAvailability(null);
          setError(null);
        }}>
          Make another rental request
        </Button>
      </div>
    );
  }

  const selected =
    products.find((p) => p.rentalProductId === rentalProductId) ?? products[0] ?? null;
  const adjustedStepIndex = adjustedSteps.findIndex((step) => step.id === currentStep);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error ? <Alert variant="danger">{error}</Alert> : null}

      {/* Progress Indicator */}
      <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
        {adjustedSteps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = step.id === currentStep;
          const isCompleted = adjustedStepIndex > index;

          return (
            <div key={step.id} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                    isCompleted
                      ? "bg-emerald-600 text-white"
                      : isActive
                      ? "bg-brand-700 text-white"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {isCompleted ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    stepNumber
                  )}
                </div>
                <p
                  className={`mt-2 text-xs font-medium ${
                    isActive ? "text-brand-700" : isCompleted ? "text-brand-700" : "text-slate-500"
                  }`}
                >
                  {step.title}
                </p>
              </div>
              {index < adjustedSteps.length - 1 && (
                <div
                  className={`mx-2 h-0.5 flex-1 ${
                    isCompleted ? "bg-emerald-600" : "bg-slate-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {currentStep === "equipment" && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Select equipment</h3>
            <div className="space-y-1">
              <label htmlFor="rental-product" className="text-sm font-medium text-slate-700">
                Product
              </label>
              <select
                id="rental-product"
                value={rentalProductId}
                onChange={(e) => {
                  setRentalProductId(e.target.value);
                  setAvailability(null);
                }}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {products.map((p) => (
                  <option key={p.rentalProductId} value={p.rentalProductId}>
                    {p.productName}
                    {p.variantName ? ` — ${p.variantName}` : ""}
                  </option>
                ))}
              </select>
              {selected ? (
                <p className="text-xs text-slate-500">
                  {selected.variantName ? `${selected.variantName} · ` : ""}
                  {selected.dailyRate ? `${formatMoney(selected.dailyRate)}/day` : ""}
                  {selected.weeklyRate ? ` · ${formatMoney(selected.weeklyRate)}/week` : ""}
                  {selected.monthlyRate ? ` · ${formatMoney(selected.monthlyRate)}/month` : ""}
                  {selected.depositAmount ? ` · Deposit ${formatMoney(selected.depositAmount)}` : ""}
                  {!selected.dailyRate && !selected.weeklyRate && !selected.monthlyRate
                    ? " · Pricing to be confirmed — this is a rental enquiry"
                    : ""}
                  {selected.availableQuantity > 0
                    ? ` · ${selected.availableQuantity} available`
                    : " · Currently unavailable"}
                </p>
              ) : null}
              {validationErrors.rentalProductId && (
                <p className="text-sm text-rose-600">{validationErrors.rentalProductId}</p>
              )}
            </div>
          </div>
        )}

        {currentStep === "period" && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Rental period</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label htmlFor="rental-start-date" className="text-sm font-medium text-slate-700">
                  Start date
                </label>
                <input
                  id="rental-start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    void checkAvailability(e.target.value, endDate);
                  }}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                {validationErrors.startDate && (
                  <p className="text-sm text-rose-600">{validationErrors.startDate}</p>
                )}
              </div>
              <div className="space-y-1">
                <label htmlFor="rental-end-date" className="text-sm font-medium text-slate-700">
                  End date
                </label>
                <input
                  id="rental-end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    void checkAvailability(startDate, e.target.value);
                  }}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                {validationErrors.endDate && (
                  <p className="text-sm text-rose-600">{validationErrors.endDate}</p>
                )}
              </div>
            </div>
            <div className="space-y-1">
              <label htmlFor="rental-quantity" className="text-sm font-medium text-slate-700">
                Quantity
              </label>
              <input
                id="rental-quantity"
                type="number"
                min={1}
                max={10}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                placeholder="e.g. 1"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              {validationErrors.quantity && (
                <p className="text-sm text-rose-600">{validationErrors.quantity}</p>
              )}
            </div>
            {isCheckingAvailability ? (
              <p className="text-sm text-slate-500" role="status">Checking availability for these dates…</p>
            ) : null}
            {availability !== null ? (
              <p
                className={`text-sm ${availability >= quantity ? "text-brand-700" : "text-rose-600"}`}
              >
                {availability} unit(s) available for those dates.{" "}
                <span className="text-xs text-slate-400">(re-checked when you submit)</span>
              </p>
            ) : null}
          </div>
        )}

        {currentStep === "customer" && !isAuthenticated && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Your information</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label htmlFor="rental-guest-name" className="text-sm font-medium text-slate-700">
                  Full name
                </label>
                <input
                  id="rental-guest-name"
                  type="text"
                  value={formData.guestName}
                  onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                  autoComplete="name"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                {validationErrors.guestName && (
                  <p className="text-sm text-rose-600">{validationErrors.guestName}</p>
                )}
              </div>
              <div className="space-y-1">
                <label htmlFor="rental-guest-phone" className="text-sm font-medium text-slate-700">
                  Phone number
                </label>
                <input
                  id="rental-guest-phone"
                  type="tel"
                  value={formData.guestPhone}
                  onChange={(e) => setFormData({ ...formData, guestPhone: e.target.value })}
                  autoComplete="tel"
                  placeholder="+265..."
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                {validationErrors.guestPhone && (
                  <p className="text-sm text-rose-600">{validationErrors.guestPhone}</p>
                )}
              </div>
            </div>
            <div className="space-y-1">
              <label htmlFor="rental-guest-email" className="text-sm font-medium text-slate-700">
                Email address (optional)
              </label>
              <input
                id="rental-guest-email"
                type="email"
                value={formData.guestEmail}
                onChange={(e) => setFormData({ ...formData, guestEmail: e.target.value })}
                autoComplete="email"
                placeholder="your@email.com"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
        )}

        {currentStep === "review" && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Review your request</h3>
            <div className="space-y-3 rounded-xl bg-slate-50 p-4 text-sm">
              <div>
                <p className="font-medium text-slate-900">Equipment</p>
                <p className="text-slate-600">{selected?.productName}</p>
                {selected?.variantName && <p className="text-slate-600">{selected.variantName}</p>}
              </div>
              <div>
                <p className="font-medium text-slate-900">Rental period</p>
                <p className="text-slate-600">
                  {startDate} to {endDate}
                </p>
                <p className="text-slate-600">Quantity: {quantity}</p>
              </div>
              {selected?.dailyRate && (
                <div>
                  <p className="font-medium text-slate-900">Rates</p>
                  <p className="text-slate-600">{formatMoney(selected.dailyRate)}/day </p>
                  {selected?.weeklyRate && <p className="text-slate-600">{formatMoney(selected.weeklyRate)}/week</p>}
                  {selected?.monthlyRate && <p className="text-slate-600">{formatMoney(selected.monthlyRate)}/month</p>}
                </div>
              )}
              {!isAuthenticated && (
                <div>
                  <p className="font-medium text-slate-900">Contact</p>
                  <p className="text-slate-600">{formData.guestName}</p>
                  <p className="text-slate-600">{formData.guestPhone}</p>
                  {formData.guestEmail && <p className="text-slate-600">{formData.guestEmail}</p>}
                </div>
              )}
              {formData.notes && (
                <div>
                  <p className="font-medium text-slate-900">Additional requirements</p>
                  <p className="text-slate-600">{formData.notes}</p>
                </div>
              )}
            </div>
            <div className="space-y-1">
              <label htmlFor="rental-notes" className="text-sm font-medium text-slate-700">
                Additional requirements (optional)
              </label>
              <textarea
                id="rental-notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                placeholder="Any special requirements or notes"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 pt-4">
          {adjustedStepIndex > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={previousStep}
              disabled={isPending || isCheckingAvailability}
              className="flex-1"
            >
              Back
            </Button>
          )}
          {adjustedStepIndex < adjustedSteps.length - 1 ? (
            <Button
              type="button"
              onClick={nextStep}
              disabled={isPending}
              className="flex-1 bg-brand-700 hover:bg-brand-800"
            >
              Continue
            </Button>
          ) : (
            <Button
              type="submit"
              isLoading={isPending || isCheckingAvailability}
              disabled={isPending}
              className="flex-1 bg-brand-700 hover:bg-brand-800"
            >
              Submit Request
            </Button>
          )}
        </div>
      </div>

      <Link
        href="/rentals"
        className="block text-center text-sm font-medium text-slate-600 transition-colors hover:text-brand-700"
      >
        Cancel and return to rentals
      </Link>
    </form>
  );
}
