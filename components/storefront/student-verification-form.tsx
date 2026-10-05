"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { submitStudentVerificationAction } from "./actions";

export function StudentVerificationForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await submitStudentVerificationAction(formData);
      if (!result.success) setError(result.error);
      else router.refresh();
    });
  }

  return (
    <form action={handleSubmit} className="max-w-md space-y-3">
      {error ? <Alert variant="danger">{error}</Alert> : null}
      <div className="space-y-1">
        <label htmlFor="student-full-name" className="text-sm font-medium text-gray-700">Full name</label>
        <input id="student-full-name" name="fullName" required className="w-full rounded-card border border-surface-border px-3 py-2 text-sm" />
      </div>
      <div className="space-y-1">
        <label htmlFor="student-institution" className="text-sm font-medium text-gray-700">Institution</label>
        <input id="student-institution" name="institution" required className="w-full rounded-card border border-surface-border px-3 py-2 text-sm" />
      </div>
      <div className="space-y-1">
        <label htmlFor="student-id-number" className="text-sm font-medium text-gray-700">Student ID number</label>
        <input id="student-id-number" name="studentIdNumber" required className="w-full rounded-card border border-surface-border px-3 py-2 text-sm" />
      </div>
      <div className="space-y-1">
        <label htmlFor="student-phone" className="text-sm font-medium text-gray-700">Phone</label>
        <input id="student-phone" name="phone" required className="w-full rounded-card border border-surface-border px-3 py-2 text-sm" />
      </div>
      <div className="space-y-1">
        <label htmlFor="student-email" className="text-sm font-medium text-gray-700">Institution email</label>
        <input id="student-email" name="email" type="email" required className="w-full rounded-card border border-surface-border px-3 py-2 text-sm" />
        <p className="text-xs text-gray-500">Use an email address where our team can contact you. Verification is confirmed by our team.</p>
      </div>
      <div className="space-y-1">
        <label htmlFor="student-document" className="text-sm font-medium text-gray-700">Supporting document (optional)</label>
        <input id="student-document" name="document" type="file" accept="image/jpeg,image/png,application/pdf" className="text-sm" />
        <p className="text-xs text-gray-500">JPEG, PNG, or PDF. Max 5MB. Kept private — only reviewed by authorized staff.</p>
      </div>
      <Button type="submit" isLoading={isPending}>
        Submit for verification
      </Button>
    </form>
  );
}
