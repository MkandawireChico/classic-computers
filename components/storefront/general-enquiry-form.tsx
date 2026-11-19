"use client";

import { useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { submitGeneralEnquiryAction } from "./actions";
import {
  getOrCreateSubmissionKey,
  markSubmissionComplete,
  renewSubmissionKey,
} from "@/lib/client/submission-key";

export function GeneralEnquiryForm({ isAuthenticated }: { isAuthenticated: boolean }) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const submissionKey = useRef<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPending) return;
    const form = event.currentTarget;
    const formData = new FormData(form);
    setError(null);
    const phone = formData.get("phone")?.toString().trim() ?? "";
    const email = formData.get("email")?.toString().trim() ?? "";
    if (!phone && !email) {
      setError("Enter a phone number or email address so we can reply.");
      return;
    }

    setIsPending(true);
    try {
      submissionKey.current ??= getOrCreateSubmissionKey("general-enquiry");
      const result = await submitGeneralEnquiryAction(
        {
          name: formData.get("name")?.toString() ?? "",
          phone: phone || undefined,
          email: email || undefined,
          topic: formData.get("topic")?.toString() ?? "other",
          message: formData.get("message")?.toString() ?? "",
        },
        submissionKey.current,
      );
      if (!result.success) {
        setError(result.error);
        return;
      }
      try {
        markSubmissionComplete("general-enquiry");
      } catch (storageError) {
        console.warn("Enquiry submission marker could not be saved:", storageError);
      }
      form.reset();
      setSubmitted(true);
    } catch {
      setError("We couldn't send your message. Check your connection and try again.");
    } finally {
      setIsPending(false);
    }
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
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => {
            submissionKey.current = renewSubmissionKey("general-enquiry");
            setSubmitted(false);
          }}
        >
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error ? <div role="alert" aria-live="assertive"><Alert variant="danger">{error}</Alert></div> : null}

      {/* Your Information Section */}
      <div className="space-y-5">
        <h3 className="text-lg font-extrabold text-slate-900">Your information</h3>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="enquiry-name" className="text-sm font-bold text-slate-700">
              Full name
            </label>
            <input
              id="enquiry-name"
              name="name"
              required
              autoComplete="name"
              className="w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-medium transition-all focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="enquiry-phone" className="text-sm font-bold text-slate-700">
              Phone number
            </label>
            <input
              id="enquiry-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              aria-describedby="enquiry-contact-requirement"
              placeholder="+265..."
              className="w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-medium transition-all focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label htmlFor="enquiry-email" className="text-sm font-bold text-slate-700">
            Email address
          </label>
          <input
            id="enquiry-email"
            name="email"
            type="email"
            autoComplete="email"
            aria-describedby="enquiry-contact-requirement"
            placeholder="your@email.com"
            className="w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-medium transition-all focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100"
          />
          <p id="enquiry-contact-requirement" className="text-sm text-slate-500">
            Enter a phone number or email address so we can reply. At least one is required.
          </p>
        </div>
      </div>

      {/* Enquiry Details Section */}
      <div className="space-y-5">
        <h3 className="text-lg font-extrabold text-slate-900">Enquiry details</h3>
        <div className="space-y-2">
          <label htmlFor="enquiry-topic" className="text-sm font-bold text-slate-700">
            Enquiry topic
          </label>
          <select
            id="enquiry-topic"
            name="topic"
            defaultValue="product"
            className="w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-medium transition-all focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100"
          >
            <option value="product">Product enquiry</option>
            <option value="stock">Product availability and stock</option>
            <option value="pricing">Pricing</option>
            <option value="rental">Laptop rental</option>
            <option value="corporate">Corporate supply</option>
            <option value="repair">Repairs and technical support</option>
            <option value="order_assistance">Order assistance</option>
            <option value="other">General enquiry</option>
          </select>
        </div>
        <div className="space-y-2">
          <label htmlFor="enquiry-message" className="text-sm font-bold text-slate-700">
            Message
          </label>
          <textarea
            id="enquiry-message"
            name="message"
            required
            rows={5}
            maxLength={2000}
            placeholder="How can we help you?"
            className="w-full resize-none rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-medium transition-all focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-4">
        <Button
          type="submit"
          isLoading={isPending}
          className="min-h-12 w-full rounded-2xl bg-brand-700 px-6 py-4 text-base font-extrabold text-white shadow-lg shadow-brand-900/10 transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-800 hover:shadow-xl"
          disabled={isPending}
        >
          Send Message
        </Button>
      </div>
    </form>
  );
}
