"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { submitCorporateEnquiryAction } from "./actions";
import { getOrCreateSubmissionKey, markSubmissionComplete, renewSubmissionKey } from "@/lib/client/submission-key";
import { trackInterestEvent } from "@/lib/client/customer-interest-analytics";

export function CorporateEnquiryForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const submissionKey = useRef<string | null>(null);
  const startedEventSent = useRef(false);

  useEffect(() => {
    if (startedEventSent.current) return;
    startedEventSent.current = true;
    trackInterestEvent({ name: "quotation_request_started" });
  }, []);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
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
      trackInterestEvent({ name: "quotation_request_submitted" });
      markSubmissionComplete("corporate-enquiry");
      setSubmitted(true);
    });
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
    <form action={handleSubmit} className="space-y-6">
      {error ? <Alert variant="danger">{error}</Alert> : null}

      <section className="space-y-5 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-800">01</p>
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
              autoComplete="organization"
              className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
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
              autoComplete="name"
              className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
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
              autoComplete="tel"
              className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
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
              required
              autoComplete="email"
              className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
            />
          </div>
        </div>
      </section>

      <section className="space-y-5 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-800">02</p>
          <h3 className="mt-1 text-lg font-bold text-slate-950">Requirements</h3>
          <p className="mt-1 text-sm text-slate-600">
            Describe the products, quantity, and delivery details you have in mind.
          </p>
        </div>
        <div className="space-y-1">
          <label htmlFor="corporate-products" className="text-sm font-bold text-slate-700">
            Equipment or products required
          </label>
          <textarea
            id="corporate-products"
            name="productsRequired"
            rows={3}
            placeholder="e.g. 10 laptops, 5 printers, networking equipment"
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
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
              placeholder="e.g. 10"
              className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
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
              min={0}
              placeholder="e.g. 5000000"
              className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="corporate-location" className="text-sm font-bold text-slate-700">
              Delivery location
            </label>
            <input
              id="corporate-location"
              name="deliveryLocation"
              placeholder="e.g. Blantyre"
              className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
            />
          </div>
        </div>
      </section>

      <section className="space-y-5 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-800">03</p>
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
            placeholder="Any other requirements or specifications"
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
          />
        </div>
      </section>

      <div className="space-y-3 border-t border-slate-200 pt-6">
        <Button
          type="submit"
          isLoading={isPending}
          className="min-h-12 w-full rounded-xl bg-emerald-700 text-sm font-extrabold shadow-lg shadow-emerald-900/10 transition hover:-translate-y-0.5 hover:bg-emerald-800"
          disabled={isPending}
        >
          Submit Enquiry
        </Button>
        <Link
          href="/corporate"
          className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-100"
        >
          Cancel and return to corporate
        </Link>
      </div>
    </form>
  );
}
