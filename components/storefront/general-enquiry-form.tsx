"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
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
      <div className="space-y-4">
        <Alert variant="success" className="space-y-3">
          <p className="font-medium">Message sent</p>
          <p className="text-sm">
            Thanks — we've received your message
            {isAuthenticated
              ? " and you can see it any time under Enquiries in your account."
              : "."}
          </p>
        </Alert>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-8">
      {error ? <Alert variant="danger">{error}</Alert> : null}

      {/* Your Information Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Your information</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label htmlFor="enquiry-name" className="text-sm font-medium text-gray-700">
              Full name
            </label>
            <input
              id="enquiry-name"
              name="name"
              required
              autoComplete="name"
              className="w-full rounded-card border border-surface-border bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="enquiry-phone" className="text-sm font-medium text-gray-700">
              Phone number
            </label>
            <input
              id="enquiry-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              aria-describedby="enquiry-contact-requirement"
              placeholder="+265..."
              className="w-full rounded-card border border-surface-border bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>
        <div className="space-y-1">
          <label htmlFor="enquiry-email" className="text-sm font-medium text-gray-700">
            Email address
          </label>
          <input
            id="enquiry-email"
            name="email"
            type="email"
            autoComplete="email"
            aria-describedby="enquiry-contact-requirement"
            placeholder="your@email.com"
            className="w-full rounded-card border border-surface-border bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
          <p id="enquiry-contact-requirement" className="text-xs text-gray-500">
            Enter a phone number or email address so we can reply. At least one is required.
          </p>
        </div>
      </div>

      {/* Enquiry Details Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Enquiry details</h3>
        <div className="space-y-1">
          <label htmlFor="enquiry-topic" className="text-sm font-medium text-gray-700">
            Enquiry topic
          </label>
          <select
            id="enquiry-topic"
            name="topic"
            className="w-full rounded-card border border-surface-border bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="product">Product enquiry</option>
            <option value="stock">Stock availability</option>
            <option value="pricing">Pricing information</option>
            <option value="rental">Rental enquiry</option>
            <option value="repair">Repair enquiry</option>
            <option value="corporate">Corporate supply</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="space-y-1">
          <label htmlFor="enquiry-message" className="text-sm font-medium text-gray-700">
            Message
          </label>
          <textarea
            id="enquiry-message"
            name="message"
            required
            rows={4}
            placeholder="How can we help you?"
            className="w-full rounded-card border border-surface-border bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <Button type="submit" isLoading={isPending} className="w-full" disabled={isPending}>
          Send Message
        </Button>
        <Link
          href="/"
          className="block w-full text-center text-sm font-medium text-gray-600 transition-colors hover:text-brand-600"
        >
          Cancel and return to homepage
        </Link>
      </div>
    </form>
  );
}
