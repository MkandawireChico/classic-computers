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
        <input name="organisationName" required placeholder="Organisation name" className="rounded-card border border-surface-border px-3 py-2 text-sm" />
        <input name="contactPerson" required placeholder="Contact person" className="rounded-card border border-surface-border px-3 py-2 text-sm" />
        <input name="phone" required placeholder="Phone" className="rounded-card border border-surface-border px-3 py-2 text-sm" />
        <input name="email" type="email" required placeholder="Email" className="rounded-card border border-surface-border px-3 py-2 text-sm" />
      </div>

      <textarea name="productsRequired" rows={3} placeholder="Equipment/products required" className="w-full rounded-card border border-surface-border px-3 py-2 text-sm" />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <input name="quantity" type="number" min={1} placeholder="Quantity" className="rounded-card border border-surface-border px-3 py-2 text-sm" />
        <input name="budget" type="number" min={0} placeholder="Budget (MWK, optional)" className="rounded-card border border-surface-border px-3 py-2 text-sm" />
        <input name="deliveryLocation" placeholder="Delivery location" className="rounded-card border border-surface-border px-3 py-2 text-sm" />
      </div>

      <textarea name="additionalRequirements" rows={2} placeholder="Additional requirements (optional)" className="w-full rounded-card border border-surface-border px-3 py-2 text-sm" />

      <Button type="submit" isLoading={isPending}>
        Submit enquiry
      </Button>
    </form>
  );
}
