"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { requestPasswordReset, type AuthActionState } from "../actions";

const initialState: AuthActionState = { error: null };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isLoading={pending} className="w-full">
      Send reset link
    </Button>
  );
}

export function ResetPasswordForm() {
  const [state, formAction] = useFormState(requestPasswordReset, initialState);

  if (state.success && state.email) {
    return (
      <div className="space-y-4">
        <Alert variant="success" className="space-y-2">
          <p className="font-medium">Password reset link sent</p>
          <p className="text-sm">We've sent a password reset link to <span className="font-semibold">{state.email}</span>. Check your inbox and follow the link to create a new password.</p>
        </Alert>
        <Link
          href="/sign-in"
          className="inline-flex w-full items-center justify-center rounded-card border border-surface-border px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-surface-muted transition-colors"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {state.error ? <Alert variant="danger">{state.error}</Alert> : null}
      <div className="space-y-1">
        <label htmlFor="email" className="text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="w-full rounded-card border border-surface-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </div>
      <SubmitButton />
    </form>
  );
}
