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
      <input name="fullName" required placeholder="Full name" className="w-full rounded-card border border-surface-border px-3 py-2 text-sm" />
      <input name="institution" required placeholder="Institution" className="w-full rounded-card border border-surface-border px-3 py-2 text-sm" />
      <input name="studentIdNumber" required placeholder="Student ID number" className="w-full rounded-card border border-surface-border px-3 py-2 text-sm" />
      <input name="phone" required placeholder="Phone" className="w-full rounded-card border border-surface-border px-3 py-2 text-sm" />
      <div className="space-y-1">
        <input name="email" type="email" required placeholder="Institution email" className="w-full rounded-card border border-surface-border px-3 py-2 text-sm" />
        <p className="text-xs text-gray-500">Use your MUBAS, MUST, CU, UNIMA, or LUANAR email. Verification is still confirmed by our team.</p>
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Supporting document (optional)</label>
        <input name="document" type="file" accept="image/jpeg,image/png,application/pdf" className="text-sm" />
        <p className="text-xs text-gray-500">JPEG, PNG, or PDF. Max 5MB. Kept private — only reviewed by authorized staff.</p>
      </div>
      <Button type="submit" isLoading={isPending}>
        Submit for verification
      </Button>
    </form>
  );
}
