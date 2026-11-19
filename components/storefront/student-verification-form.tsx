"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { submitStudentVerificationAction } from "./actions";
import { getOrCreateSubmissionKey, markSubmissionComplete } from "@/lib/client/submission-key";

export function StudentVerificationForm() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submissionKey = useRef<string | null>(null);

  async function handleSubmit(formData: FormData) {
    if (isPending) return;

    setError(null);
    setIsPending(true);

    try {
      submissionKey.current ??= getOrCreateSubmissionKey("student-verification");
      formData.set("submissionKey", submissionKey.current);

      const result = await submitStudentVerificationAction(formData);
      if (!result.success) {
        setError(result.error);
        return;
      }

      markSubmissionComplete("student-verification");
      router.refresh();
    } catch {
      setError("We couldn't submit your application. Check your connection and try again.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {error ? <Alert variant="danger">{error}</Alert> : null}

      {/* Personal Information */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Personal information</h3>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label htmlFor="student-full-name" className="text-sm font-medium text-slate-700">
              Full name
            </label>
            <input
              id="student-full-name"
              name="fullName"
              required
              autoComplete="name"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="student-phone" className="text-sm font-medium text-slate-700">
              Phone number
            </label>
            <input
              id="student-phone"
              name="phone"
              type="tel"
              required
              autoComplete="tel"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Institution Information */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Institution details</h3>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label htmlFor="student-institution" className="text-sm font-medium text-slate-700">
              Institution name
            </label>
            <input
              id="student-institution"
              name="institution"
              required
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="student-id-number" className="text-sm font-medium text-slate-700">
              Student ID number
            </label>
            <input
              id="student-id-number"
              name="studentIdNumber"
              required
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="student-email" className="text-sm font-medium text-slate-700">
              Institution email
            </label>
            <input
              id="student-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
            />
            <p className="mt-2 text-xs text-slate-500">
              Use an email address where our team can contact you. Verification is confirmed by our team.
            </p>
          </div>
        </div>
      </div>

      {/* Supporting Document */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Supporting document (optional)</h3>
        <div className="space-y-1.5">
          <label htmlFor="student-document" className="text-sm font-medium text-slate-700">
            Upload document
          </label>
          <input
            id="student-document"
            name="document"
            type="file"
            accept="image/jpeg,image/png,application/pdf"
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 file:mr-4 file:rounded-lg file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
          />
          <p className="mt-2 text-xs text-slate-500">
            JPEG, PNG, or PDF. Max 5MB. Kept private — only reviewed by authorized staff.
          </p>
        </div>
      </div>

      <Button type="submit" isLoading={isPending} disabled={isPending} className="w-full rounded-xl">
        Submit for verification
      </Button>
    </form>
  );
}
