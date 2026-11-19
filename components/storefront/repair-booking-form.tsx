"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { submitRepairBookingAction } from "./actions";
import { getOrCreateSubmissionKey, markSubmissionComplete, renewSubmissionKey } from "@/lib/client/submission-key";
import { trackInterestEvent } from "@/lib/client/customer-interest-analytics";

const STEPS = [
  { id: "device", title: "Your device" },
  { id: "problem", title: "What's wrong?" },
  { id: "contact", title: "Your details" },
  { id: "review", title: "Review" },
] as const;

type StepId = typeof STEPS[number]["id"];

export function RepairBookingForm({ isAuthenticated }: { isAuthenticated: boolean }) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ ticketNumber: string; trackingToken: string } | null>(null);
  const [currentStep, setCurrentStep] = useState<StepId>("device");
  const submissionKey = useRef<string | null>(null);
  const startedEventSent = useRef(false);

  useEffect(() => {
    if (startedEventSent.current) return;
    startedEventSent.current = true;
    trackInterestEvent({ name: "repair_request_started" });
  }, []);

  const [formData, setFormData] = useState({
    deviceType: "",
    brand: "",
    model: "",
    serialNumber: "",
    problemDescription: "",
    accessoriesReceived: "",
    guestName: "",
    guestPhone: "",
    guestEmail: "",
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const visibleSteps = isAuthenticated ? STEPS.filter((step) => step.id !== "contact") : STEPS;
  const currentStepIndex = visibleSteps.findIndex((step) => step.id === currentStep);


  function validateStep(stepId: StepId): boolean {
    const errors: Record<string, string> = {};

    if (stepId === "device") {
      if (!formData.deviceType.trim()) errors.deviceType = "Device type is required";
    }

    if (stepId === "problem") {
      if (!formData.problemDescription.trim()) errors.problemDescription = "Please describe the problem";
      if (formData.problemDescription.trim().length < 10) errors.problemDescription = "Please provide more detail (at least 10 characters)";
    }

    if (stepId === "contact" && !isAuthenticated) {
      if (!formData.guestName.trim()) errors.guestName = "Name is required";
      if (!formData.guestPhone.trim()) errors.guestPhone = "Phone number is required";
      if (formData.guestPhone.trim().length < 6) errors.guestPhone = "Please enter a valid phone number";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function nextStep() {
    if (!validateStep(currentStep)) return;

    const nextIndex = currentStepIndex + 1;
    const nextStep = visibleSteps[nextIndex];
    if (nextStep) {
      setCurrentStep(nextStep.id);
    }
  }

  function previousStep() {
    const prevIndex = currentStepIndex - 1;
    const prevStep = visibleSteps[prevIndex];
    if (prevStep) {
      setCurrentStep(prevStep.id);
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isPending) return;
    setError(null);
    setIsPending(true);
    try {
      submissionKey.current ??= getOrCreateSubmissionKey("repair-booking");
      const res = await submitRepairBookingAction({
        deviceType: formData.deviceType,
        brand: formData.brand || undefined,
        model: formData.model || undefined,
        serialNumber: formData.serialNumber || undefined,
        problemDescription: formData.problemDescription,
        accessoriesReceived: formData.accessoriesReceived || undefined,
        guestName: formData.guestName || undefined,
        guestPhone: formData.guestPhone || undefined,
        guestEmail: formData.guestEmail || undefined,
      }, submissionKey.current);
      if (!res.success) {
        setError(res.error);
        return;
      }
      try {
        trackInterestEvent({ name: "repair_request_submitted" });
      } catch (analyticsError) {
        console.warn("Repair analytics could not be recorded:", analyticsError);
      }
      try {
        markSubmissionComplete("repair-booking");
      } catch (storageError) {
        console.warn("Repair submission marker could not be saved:", storageError);
      }
      setResult({ ticketNumber: res.ticketNumber, trackingToken: res.trackingToken });
    } catch (submitError) {
      console.error("Repair request submission failed:", submitError);
      setError("We couldn't submit your repair request. Please check your connection and try again.");
    } finally {
      setIsPending(false);
    }
  }

  if (result) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center rounded-2xl border border-emerald-200 bg-brand-50 p-12 text-center">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-4 text-brand-700">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <path d="M22 4L12 14.01l-3-3" />
          </svg>
          <h2 className="text-2xl font-extrabold text-slate-900">Your repair request has been received!</h2>
          <p className="mt-3 text-base text-slate-600">
            Thank you for contacting Classic Computers. Our team will review the information you submitted and follow up regarding the next steps.
          </p>
          <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-700">Repair reference</p>
            <p className="mt-1 text-2xl font-extrabold text-brand-700">{result.ticketNumber}</p>
            {!isAuthenticated ? (
              <>
                <p className="mt-4 text-sm font-semibold text-slate-700">Tracking code</p>
                <p className="mt-1 break-all font-mono text-sm text-slate-900">{result.trackingToken}</p>
                <p className="mt-2 text-xs text-slate-500">Save this code to check your repair status later.</p>
              </>
            ) : null}
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            {isAuthenticated ? (
              <Link
                href="/account/repairs"
                className="inline-flex min-h-12 items-center justify-center rounded-xl bg-brand-600 px-6 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-black/15 transition-colors hover:bg-brand-500"
              >
                View repair request
              </Link>
            ) : (
              <Link
                href="/repairs/track"
                className="inline-flex min-h-12 items-center justify-center rounded-xl bg-brand-600 px-6 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-black/15 transition-colors hover:bg-brand-500"
              >
                Track repair
              </Link>
            )}
            <Link
              href="/repairs"
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-200 px-6 py-3 text-sm font-bold text-slate-800 transition-colors hover:bg-slate-50"
            >
              Return to repairs
            </Link>
          </div>
          <Button type="button" variant="outline" className="mt-4" onClick={() => {
            submissionKey.current = renewSubmissionKey("repair-booking");
            setResult(null);
            setCurrentStep("device");
            setValidationErrors({});
            setError(null);
            setFormData({
              deviceType: "",
              brand: "",
              model: "",
              serialNumber: "",
              problemDescription: "",
              accessoriesReceived: "",
              guestName: "",
              guestPhone: "",
              guestEmail: "",
            });
          }}>
            Start another repair request
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error ? <Alert variant="danger">{error}</Alert> : null}

      {/* Progress Indicator */}
      <div className="flex items-center justify-between">
        {visibleSteps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = step.id === currentStep;
          const isCompleted = currentStepIndex > index;

          return (
            <div key={step.id} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                    isActive
                      ? "bg-brand-600 text-white"
                      : isCompleted
                      ? "bg-brand-100 text-brand-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {isCompleted ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  ) : (
                    stepNumber
                  )}
                </div>
                <p
                  className={`mt-2 text-xs font-semibold ${
                    isActive ? "text-brand-700" : isCompleted ? "text-brand-700" : "text-slate-500"
                  }`}
                >
                  {step.title}
                </p>
              </div>
              {index < visibleSteps.length - 1 && (
                <div className="flex-1 h-0.5 mx-2 bg-slate-200" />
              )}
            </div>
          );
        })}
      </div>

      {/* Step 1: Device Information */}
      {currentStep === "device" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Tell us about your device</h2>
            <p className="mt-2 text-sm text-slate-600">
              Provide the device details so our team can better understand what needs attention.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="deviceType" className="text-sm font-semibold text-slate-700">
                Device type <span className="text-red-500">*</span>
              </label>
              <input
                id="deviceType"
                type="text"
                maxLength={80}
                value={formData.deviceType}
                onChange={(e) => setFormData({ ...formData, deviceType: e.target.value })}
                placeholder="e.g. Laptop, Desktop, Tablet"
                className={`w-full rounded-xl border px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all ${
                  validationErrors.deviceType ? "border-red-300 focus:border-red-500" : "border-slate-300 focus:border-brand-500"
                }`}
              />
              {validationErrors.deviceType && (
                <p className="text-xs text-red-600">{validationErrors.deviceType}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="brand" className="text-sm font-semibold text-slate-700">
                  Brand
                </label>
                <input
                  id="brand"
                  type="text"
                  maxLength={100}
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  placeholder="e.g. Dell, HP, Lenovo"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="model" className="text-sm font-semibold text-slate-700">
                  Model
                </label>
                <input
                  id="model"
                  type="text"
                  maxLength={100}
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  placeholder="e.g. Latitude 7420"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="serialNumber" className="text-sm font-semibold text-slate-700">
                Serial number (optional)
              </label>
              <input
                id="serialNumber"
                type="text"
                maxLength={100}
                value={formData.serialNumber}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                placeholder="e.g. Service tag or serial number"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="button"
              onClick={nextStep}
              className="rounded-xl"
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Problem Description */}
      {currentStep === "problem" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">What's happening with your device?</h2>
            <p className="mt-2 text-sm text-slate-600">
              Tell us as much as you can about the problem so our team can better understand what needs attention.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="problemDescription" className="text-sm font-semibold text-slate-700">
                Describe the problem <span className="text-red-500">*</span>
              </label>
              <textarea
                id="problemDescription"
                maxLength={2000}
                value={formData.problemDescription}
                onChange={(e) => setFormData({ ...formData, problemDescription: e.target.value })}
                rows={5}
                placeholder="Describe what's wrong with your device. Include any symptoms, error messages, or when the problem occurs..."
                className={`w-full rounded-xl border px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all resize-none ${
                  validationErrors.problemDescription ? "border-red-300 focus:border-red-500" : "border-slate-300 focus:border-brand-500"
                }`}
              />
              {validationErrors.problemDescription && (
                <p className="text-xs text-red-600">{validationErrors.problemDescription}</p>
              )}
              <p className="text-xs text-slate-500">
                {formData.problemDescription.length} / 2,000 characters · 10 minimum
              </p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="accessoriesReceived" className="text-sm font-semibold text-slate-700">
                Accessories included (optional)
              </label>
              <input
                id="accessoriesReceived"
                type="text"
                maxLength={300}
                value={formData.accessoriesReceived}
                onChange={(e) => setFormData({ ...formData, accessoriesReceived: e.target.value })}
                placeholder="e.g. charger, bag, cables"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
              />
            </div>
          </div>

          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={previousStep}
              className="rounded-xl"
            >
              Back
            </Button>
            <Button
              type="button"
              onClick={nextStep}
              className="rounded-xl"
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Contact Information (guests only) */}
      {currentStep === "contact" && !isAuthenticated && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Your contact information</h2>
            <p className="mt-2 text-sm text-slate-600">
              Provide your details so we can follow up about your repair request.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="guestName" className="text-sm font-semibold text-slate-700">
                Full name <span className="text-red-500">*</span>
              </label>
              <input
                id="guestName"
                type="text"
                maxLength={120}
                value={formData.guestName}
                onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                autoComplete="name"
                className={`w-full rounded-xl border px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all ${
                  validationErrors.guestName ? "border-red-300 focus:border-red-500" : "border-slate-300 focus:border-brand-500"
                }`}
              />
              {validationErrors.guestName && (
                <p className="text-xs text-red-600">{validationErrors.guestName}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="guestPhone" className="text-sm font-semibold text-slate-700">
                Phone number <span className="text-red-500">*</span>
              </label>
              <input
                id="guestPhone"
                type="tel"
                maxLength={30}
                value={formData.guestPhone}
                onChange={(e) => setFormData({ ...formData, guestPhone: e.target.value })}
                autoComplete="tel"
                placeholder="+265..."
                className={`w-full rounded-xl border px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all ${
                  validationErrors.guestPhone ? "border-red-300 focus:border-red-500" : "border-slate-300 focus:border-brand-500"
                }`}
              />
              {validationErrors.guestPhone && (
                <p className="text-xs text-red-600">{validationErrors.guestPhone}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="guestEmail" className="text-sm font-semibold text-slate-700">
                Email address (optional)
              </label>
              <input
                id="guestEmail"
                type="email"
                maxLength={254}
                value={formData.guestEmail}
                onChange={(e) => setFormData({ ...formData, guestEmail: e.target.value })}
                autoComplete="email"
                placeholder="your@email.com"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
              />
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-600">
                Your information is used solely to contact you about your repair request. We respect your privacy and will not share your details with third parties.
              </p>
            </div>
          </div>

          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={previousStep}
              className="rounded-xl"
            >
              Back
            </Button>
            <Button
              type="button"
              onClick={nextStep}
              className="rounded-xl"
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Review */}
      {(currentStep === "review" || (currentStep === "contact" && isAuthenticated)) && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Review your repair request</h2>
            <p className="mt-2 text-sm text-slate-600">
              Please review the information below before submitting. You can go back to make changes.
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Device information</h3>
                <button
                  type="button"
                  onClick={() => setCurrentStep("device")}
                  className="text-xs font-semibold text-brand-700 hover:text-brand-700"
                >
                  Edit
                </button>
              </div>
              <dl className="mt-4 space-y-3">
                <div className="flex justify-between">
                  <dt className="text-sm text-slate-600">Device type</dt>
                  <dd className="text-sm font-semibold text-slate-900">{formData.deviceType}</dd>
                </div>
                {formData.brand && (
                  <div className="flex justify-between">
                    <dt className="text-sm text-slate-600">Brand</dt>
                    <dd className="text-sm font-semibold text-slate-900">{formData.brand}</dd>
                  </div>
                )}
                {formData.model && (
                  <div className="flex justify-between">
                    <dt className="text-sm text-slate-600">Model</dt>
                    <dd className="text-sm font-semibold text-slate-900">{formData.model}</dd>
                  </div>
                )}
                {formData.serialNumber && (
                  <div className="flex justify-between">
                    <dt className="text-sm text-slate-600">Serial number</dt>
                    <dd className="text-sm font-semibold text-slate-900">{formData.serialNumber}</dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Problem description</h3>
                <button
                  type="button"
                  onClick={() => setCurrentStep("problem")}
                  className="text-xs font-semibold text-brand-700 hover:text-brand-700"
                >
                  Edit
                </button>
              </div>
              <p className="mt-4 text-sm text-slate-900">{formData.problemDescription}</p>
              {formData.accessoriesReceived && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <p className="text-xs text-slate-600">Accessories: {formData.accessoriesReceived}</p>
                </div>
              )}
            </div>

            {!isAuthenticated && (
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Contact information</h3>
                  <button
                    type="button"
                    onClick={() => setCurrentStep("contact")}
                    className="text-xs font-semibold text-brand-700 hover:text-brand-700"
                  >
                    Edit
                  </button>
                </div>
                <dl className="mt-4 space-y-3">
                  <div className="flex justify-between">
                    <dt className="text-sm text-slate-600">Name</dt>
                    <dd className="text-sm font-semibold text-slate-900">{formData.guestName}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-slate-600">Phone</dt>
                    <dd className="text-sm font-semibold text-slate-900">{formData.guestPhone}</dd>
                  </div>
                  {formData.guestEmail && (
                    <div className="flex justify-between">
                      <dt className="text-sm text-slate-600">Email</dt>
                      <dd className="text-sm font-semibold text-slate-900">{formData.guestEmail}</dd>
                    </div>
                  )}
                </dl>
              </div>
            )}
          </div>

          <div className="rounded-xl bg-amber-50 p-4">
            <p className="text-sm text-amber-900">
              <strong>Note:</strong> Submitting this request creates a repair ticket for our team to review. It does not automatically confirm a diagnosis, repair price, or completion date. Our team will follow up with next steps.
            </p>
          </div>

          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={previousStep}
              className="rounded-xl"
            >
              Back
            </Button>
            <Button
              type="submit"
              isLoading={isPending}
              className="rounded-xl"
              disabled={isPending}
            >
              Submit repair request
            </Button>
          </div>
        </div>
      )}

      <Link
        href="/repairs"
        className="block text-center text-sm font-medium text-slate-600 transition-colors hover:text-brand-700"
      >
        Cancel and return to repairs
      </Link>
    </form>
  );
}
