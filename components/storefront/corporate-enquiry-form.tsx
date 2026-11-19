"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { submitCorporateEnquiryAction } from "./actions";
import { getOrCreateSubmissionKey, markSubmissionComplete, renewSubmissionKey } from "@/lib/client/submission-key";
import { trackInterestEvent } from "@/lib/client/customer-interest-analytics";

export function CorporateEnquiryForm() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const submissionKey = useRef<string | null>(null);
  const startedEventSent = useRef(false);

  useEffect(() => {
    if (startedEventSent.current) return;
    startedEventSent.current = true;
    trackInterestEvent({ name: "quotation_request_started" });
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPending) return;
    setError(null);
    const formData = new FormData(event.currentTarget);
    setIsPending(true);
    try {
      submissionKey.current ??= getOrCreateSubmissionKey("corporate-enquiry");
      const result = await submitCorporateEnquiryAction({
        organisationName: formData.get("organisationName")?.toString() ?? "",
        contactPerson: formData.get("contactPerson")?.toString() ?? "",
        phone: formData.get("phone")?.toString() ?? "",
        email: formData.get("email")?.toString() ?? "",
        productsRequired: formData.get("productsRequired")?.toString() || undefined,
        quantity: formData.get("quantity")?.toString() || undefined,
        budget: formData.get("budget")?.toString() || undefined,
        deliveryLocation: formData.get("deliveryLocation")?.toString() || undefined,
        additionalRequirements: formData.get("additionalRequirements")?.toString() || undefined,
      }, submissionKey.current);
      if (!result.success) {
        setError(result.error);
        return;
      }
      try {
        trackInterestEvent({ name: "quotation_request_submitted" });
      } catch (analyticsError) {
        console.warn("Quotation analytics could not be recorded:", analyticsError);
      }
      try {
        markSubmissionComplete("corporate-enquiry");
      } catch (storageError) {
        console.warn("Quotation submission marker could not be saved:", storageError);
      }
      setSubmitted(true);
    } catch (submitError) {
      console.error("Corporate enquiry submission failed:", submitError);
      setError("We couldn't submit your enquiry. Please check your connection and try again.");
    } finally {
      setIsPending(false);
    }
  }

  if (submitted) {
    return (
      <div className="space-y-4">
        <Alert variant="success" className="space-y-3">
          <p className="font-medium">Corporate enquiry submitted</p>
          <p className="text-sm">
            Thank you — your corporate enquiry has been received. Our team will follow up using the
            contact details you provided.
          </p>
        </Alert>
        <Button type="button" variant="outline" className="w-full" onClick={() => {
          submissionKey.current = renewSubmissionKey("corporate-enquiry");
          setSubmitted(false);
        }}>
          Submit another request
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error ? <Alert variant="danger">{error}</Alert> : null}

      <section className="space-y-5 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-800">01</p>
          <h3 className="mt-1 text-lg font-bold text-slate-950">Organisation information</h3>
          <p className="mt-1 text-sm text-slate-600">
            How our team can reach you about this request.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label htmlFor="corporate-organisation" className="text-sm font-medium text-gray-700">
              Organisation name{" "}
              <span aria-hidden="true" className="text-rose-600">
                *
              </span>
            </label>
            <input
              id="corporate-organisation"
              name="organisationName"
              required
              maxLength={160}
              autoComplete="organization"
              className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="corporate-contact" className="text-sm font-medium text-gray-700">
              Contact person{" "}
              <span aria-hidden="true" className="text-rose-600">
                *
              </span>
            </label>
            <input
              id="corporate-contact"
              name="contactPerson"
              required
              maxLength={120}
              autoComplete="name"
              className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="corporate-phone" className="text-sm font-medium text-gray-700">
              Phone number{" "}
              <span aria-hidden="true" className="text-rose-600">
                *
              </span>
            </label>
            <input
              id="corporate-phone"
              name="phone"
              required
              type="tel"
              maxLength={30}
              autoComplete="tel"
              className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="corporate-email" className="text-sm font-medium text-gray-700">
              Email address{" "}
              <span aria-hidden="true" className="text-rose-600">
                *
              </span>
            </label>
            <input
              id="corporate-email"
              name="email"
              type="email"
              maxLength={254}
              required
              autoComplete="email"
              className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
            />
          </div>
        </div>
      </section>

      <section className="space-y-5 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-800">02</p>
          <h3 className="mt-1 text-lg font-bold text-slate-950">Requirements</h3>
          <p className="mt-1 text-sm text-slate-600">
            Describe the products, quantity, and delivery details you have in mind.
          </p>
        </div>
        <div className="space-y-1">
          <label htmlFor="corporate-products" className="text-sm font-bold text-slate-700">
            Equipment or products required <span aria-hidden="true" className="text-rose-600">*</span>
          </label>
          <textarea
            id="corporate-products"
            name="productsRequired"
            required
            minLength={5}
            rows={3}
            maxLength={1000}
            placeholder="e.g. 10 business laptops with 16GB RAM, 5 network printers, or a small office network setup"
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-1">
            <label htmlFor="corporate-quantity" className="text-sm font-bold text-slate-700">
              Quantity
            </label>
            <input
              id="corporate-quantity"
              name="quantity"
              type="number"
              min={1}
              max={1000000}
              placeholder="e.g. 10"
              className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="corporate-budget" className="text-sm font-bold text-slate-700">
              Budget (MWK, optional)
            </label>
            <input
              id="corporate-budget"
              name="budget"
              type="number"
              min={1}
              max={1000000000000}
              placeholder="e.g. 5000000"
              className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="corporate-location" className="text-sm font-bold text-slate-700">
              Delivery location
            </label>
            <input
              id="corporate-location"
              name="deliveryLocation"
              maxLength={200}
              placeholder="e.g. Blantyre"
              className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
            />
          </div>
        </div>
      </section>

      <section className="space-y-5 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-800">03</p>
          <h3 className="mt-1 text-lg font-bold text-slate-950">Additional information</h3>
          <p className="mt-1 text-sm text-slate-600">
            Add context that may help us understand your request.
          </p>
        </div>
        <div className="space-y-1">
          <label htmlFor="corporate-additional" className="text-sm font-bold text-slate-700">
            Additional requirements (optional)
          </label>
          <textarea
            id="corporate-additional"
            name="additionalRequirements"
            rows={3}
            maxLength={1000}
            placeholder="Any other requirements or specifications"
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
          />
        </div>
      </section>

      <div className="space-y-3 border-t border-slate-200 pt-6">
        <Button
          type="submit"
          isLoading={isPending}
          className="min-h-12 w-full rounded-xl bg-[#123653] text-sm font-extrabold shadow-sm transition-colors hover:bg-brand-800"
          disabled={isPending}
        >
          Submit Enquiry
        </Button>
        <Link
          href="/corporate"
          className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-100"
        >
          Cancel and return to corporate
        </Link>
      </div>
    </form>
  );
}
