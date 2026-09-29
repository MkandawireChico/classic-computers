"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { changePassword, type ChangePasswordState } from "./actions";

const initialState: ChangePasswordState = { error: null };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isLoading={pending}>
      Change password
    </Button>
  );
}

export function ChangePasswordForm() {
  const [state, formAction] = useFormState(changePassword, initialState);

  return (
    <form action={formAction} className="max-w-sm space-y-4">
      {state.error ? <Alert variant="danger">{state.error}</Alert> : null}
      {state.success ? <Alert variant="success">Password updated.</Alert> : null}

      <div className="space-y-1">
        <label htmlFor="currentPassword" className="text-sm font-medium text-gray-700">
          Current password
        </label>
        <input
          id="currentPassword"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
          className="w-full rounded-card border border-surface-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
          New password
        </label>
        <input
          id="newPassword"
          name="newPassword"
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
