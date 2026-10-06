"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { submitCorporateEnquiryAction } from "./actions";

export function CorporateEnquiryForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
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
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setSubmitted(true);
    });
  }

  if (submitted) {
    return (
      <div className="space-y-4">
        <Alert variant="success" className="space-y-3">
          <p className="font-medium">Corporate enquiry submitted</p>
          <p className="text-sm">
            Thank you — your corporate enquiry has been received. Our team will follow up with you directly within 1-2 business days.
          </p>
        </Alert>
        <Link
          href="/corporate"
          className="inline-flex w-full items-center justify-center rounded-card border border-surface-border px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-surface-muted transition-colors"
        >
          Back to corporate
        </Link>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {error ? <Alert variant="danger">{error}</Alert> : null}

      {/* Organisation Information Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Organisation information</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label htmlFor="corporate-organisation" className="text-sm font-medium text-gray-700">
              Organisation name
            </label>
            <input
              id="corporate-organisation"
              name="organisationName"
              required
              autoComplete="organization"
              className="w-full rounded-card border border-surface-border bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="corporate-contact" className="text-sm font-medium text-gray-700">
              Contact person
            </label>
            <input
              id="corporate-contact"
              name="contactPerson"
              required
              autoComplete="name"
              className="w-full rounded-card border border-surface-border bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="corporate-phone" className="text-sm font-medium text-gray-700">
              Phone
            </label>
            <input
              id="corporate-phone"
              name="phone"
              required
              type="tel"
              autoComplete="tel"
              className="w-full rounded-card border border-surface-border bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="corporate-email" className="text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="corporate-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-card border border-surface-border bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>
      </div>

      {/* Requirements Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Requirements</h3>
        <div className="space-y-1">
          <label htmlFor="corporate-products" className="text-sm font-medium text-gray-700">
            Equipment or products required
          </label>
          <textarea
            id="corporate-products"
            name="productsRequired"
            rows={3}
            className="w-full rounded-card border border-surface-border bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-1">
            <label htmlFor="corporate-quantity" className="text-sm font-medium text-gray-700">
              Quantity
            </label>
            <input
              id="corporate-quantity"
              name="quantity"
              type="number"
              min={1}
              className="w-full rounded-card border border-surface-border bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="corporate-budget" className="text-sm font-medium text-gray-700">
              Budget (MWK, optional)
            </label>
            <input
              id="corporate-budget"
              name="budget"
              type="number"
              min={0}
              className="w-full rounded-card border border-surface-border bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="corporate-location" className="text-sm font-medium text-gray-700">
              Delivery location
            </label>
            <input
              id="corporate-location"
              name="deliveryLocation"
              className="w-full rounded-card border border-surface-border bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>
      </div>

      {/* Additional Information Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Additional information</h3>
        <div className="space-y-1">
          <label htmlFor="corporate-additional" className="text-sm font-medium text-gray-700">
            Additional requirements (optional)
          </label>
          <textarea
            id="corporate-additional"
            name="additionalRequirements"
            rows={3}
            className="w-full rounded-card border border-surface-border bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <Button type="submit" isLoading={isPending} className="w-full" disabled={isPending}>
          Submit Enquiry
        </Button>
        <Link
          href="/corporate"
          className="block w-full text-center text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors"
        >
          Cancel and return to corporate
        </Link>
      </div>
    </form>
  );
}
