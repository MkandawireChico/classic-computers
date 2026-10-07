"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { updatePassword, type AuthActionState } from "../actions";

const initialState: AuthActionState = { error: null };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isLoading={pending} className="w-full">
      Update password
    </Button>
  );
}

export function UpdatePasswordForm() {
  const [state, formAction] = useFormState(updatePassword, initialState);

  if (state.success) {
    return (
      <div className="space-y-4">
        <Alert variant="success" className="space-y-2">
          <p className="font-medium">Password updated successfully</p>
          <p className="text-sm">Your password has been changed. You can now sign in with your new password.</p>
        </Alert>
        <Link
          href="/sign-in"
          className="inline-flex w-full items-center justify-center rounded-card border border-surface-border px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-surface-muted transition-colors"
        >
          Go to sign in
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {state.error ? <Alert variant="danger">{state.error}</Alert> : null}
      <div className="space-y-1">
        <label htmlFor="password" className="text-sm font-medium text-gray-700">
          New password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="w-full rounded-card border border-surface-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </div>
      <SubmitButton />
    </form>
  );
}
