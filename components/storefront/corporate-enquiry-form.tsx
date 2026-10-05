"use client";

import { useState, useTransition } from "react";
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
      <Alert variant="success">
        Thank you — your corporate enquiry has been received. Our team will follow up with you
        directly.
      </Alert>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {error ? <Alert variant="danger">{error}</Alert> : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="space-y-1 text-sm font-medium text-gray-700" htmlFor="corporate-organisation">Organisation name<input id="corporate-organisation" name="organisationName" required autoComplete="organization" className="block w-full rounded-card border border-surface-border px-3 py-2 text-sm font-normal" /></label>
        <label className="space-y-1 text-sm font-medium text-gray-700" htmlFor="corporate-contact">Contact person<input id="corporate-contact" name="contactPerson" required autoComplete="name" className="block w-full rounded-card border border-surface-border px-3 py-2 text-sm font-normal" /></label>
        <label className="space-y-1 text-sm font-medium text-gray-700" htmlFor="corporate-phone">Phone<input id="corporate-phone" name="phone" required type="tel" autoComplete="tel" className="block w-full rounded-card border border-surface-border px-3 py-2 text-sm font-normal" /></label>
        <label className="space-y-1 text-sm font-medium text-gray-700" htmlFor="corporate-email">Email<input id="corporate-email" name="email" type="email" required autoComplete="email" className="block w-full rounded-card border border-surface-border px-3 py-2 text-sm font-normal" /></label>
      </div>

      <label className="block space-y-1 text-sm font-medium text-gray-700" htmlFor="corporate-products">Equipment or products required<textarea id="corporate-products" name="productsRequired" rows={3} className="w-full rounded-card border border-surface-border px-3 py-2 text-sm font-normal" /></label>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="space-y-1 text-sm font-medium text-gray-700" htmlFor="corporate-quantity">Quantity<input id="corporate-quantity" name="quantity" type="number" min={1} className="block w-full rounded-card border border-surface-border px-3 py-2 text-sm font-normal" /></label>
        <label className="space-y-1 text-sm font-medium text-gray-700" htmlFor="corporate-budget">Budget (MWK, optional)<input id="corporate-budget" name="budget" type="number" min={0} className="block w-full rounded-card border border-surface-border px-3 py-2 text-sm font-normal" /></label>
        <label className="space-y-1 text-sm font-medium text-gray-700" htmlFor="corporate-location">Delivery location<input id="corporate-location" name="deliveryLocation" className="block w-full rounded-card border border-surface-border px-3 py-2 text-sm font-normal" /></label>
      </div>

      <label className="block space-y-1 text-sm font-medium text-gray-700" htmlFor="corporate-additional">Additional requirements (optional)<textarea id="corporate-additional" name="additionalRequirements" rows={2} className="w-full rounded-card border border-surface-border px-3 py-2 text-sm font-normal" /></label>

      <Button type="submit" isLoading={isPending}>
        Submit enquiry
      </Button>
    </form>
  );
}
