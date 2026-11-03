"use client";

import { useFormState, useFormStatus } from "react-dom";
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

export function ResetPasswordForm({ initialError }: { initialError?: string }) {
  const [state, formAction] = useFormState(requestPasswordReset, initialState);

  if (state.success && state.email) {
    return (
      <div className="space-y-4">
        <Alert variant="success" className="space-y-2">
          <p className="font-medium">Password reset request accepted</p>
          <p className="text-sm">
            {state.message} If an email arrives, check the inbox and spam folder for{" "}
            <span className="font-semibold">{state.email}</span>.
          </p>
        </Alert>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {state.error || initialError ? <Alert variant="danger">{state.error ?? initialError}</Alert> : null}
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
