"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { submitGeneralEnquiryAction } from "./actions";

export function GeneralEnquiryForm({ isAuthenticated }: { isAuthenticated: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(formData: FormData) {
    setError(null);
    const phone = formData.get("phone")?.toString().trim() ?? "";
    const email = formData.get("email")?.toString().trim() ?? "";
    if (!phone && !email) {
      setError("Enter a phone number or email address so we can reply.");
      return;
    }

    startTransition(async () => {
      const result = await submitGeneralEnquiryAction({
        name: formData.get("name")?.toString() ?? "",
        phone: phone || undefined,
        email: email || undefined,
        topic: formData.get("topic")?.toString() ?? "other",
        message: formData.get("message")?.toString() ?? "",
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
        Thanks — we&apos;ve received your message
        {isAuthenticated ? " and you can see it any time under Enquiries in your account." : "."}
      </Alert>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-3">
      {error ? <Alert variant="danger">{error}</Alert> : null}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="enquiry-name" className="block text-sm font-medium text-gray-800">Full name <span aria-hidden="true">*</span></label>
          <input id="enquiry-name" name="name" required autoComplete="name" className="w-full rounded-card border border-surface-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
        </div>
        <div className="space-y-1">
          <label htmlFor="enquiry-phone" className="block text-sm font-medium text-gray-800">Phone number</label>
          <input id="enquiry-phone" name="phone" type="tel" autoComplete="tel" aria-describedby="enquiry-contact-requirement" className="w-full rounded-card border border-surface-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
        </div>
      </div>
      <div className="space-y-1">
        <label htmlFor="enquiry-email" className="block text-sm font-medium text-gray-800">Email address</label>
        <input id="enquiry-email" name="email" type="email" autoComplete="email" aria-describedby="enquiry-contact-requirement" className="w-full rounded-card border border-surface-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
        <p id="enquiry-contact-requirement" className="text-xs text-gray-500">Enter a phone number or email address so we can reply. At least one is required.</p>
      </div>
      <div className="space-y-1">
        <label htmlFor="enquiry-topic" className="block text-sm font-medium text-gray-800">Enquiry topic</label>
        <select id="enquiry-topic" name="topic" className="w-full rounded-card border border-surface-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500">
          <option value="product">Product</option>
          <option value="stock">Stock</option>
          <option value="pricing">Pricing</option>
          <option value="rental">Rental</option>
          <option value="repair">Repair</option>
          <option value="corporate">Corporate</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div className="space-y-1">
        <label htmlFor="enquiry-message" className="block text-sm font-medium text-gray-800">Message <span aria-hidden="true">*</span></label>
        <textarea id="enquiry-message" name="message" required rows={3} className="w-full rounded-card border border-surface-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
      </div>
      <Button type="submit" isLoading={isPending}>
        Send
      </Button>
    </form>
  );
}
