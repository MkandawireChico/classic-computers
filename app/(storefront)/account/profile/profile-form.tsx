"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { updateProfile, type ProfileActionState } from "./actions";

const initialState: ProfileActionState = { error: null };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isLoading={pending} className="w-full">
      Save changes
    </Button>
  );
}

export function ProfileForm({
  initialFullName,
  initialPhone,
}: {
  initialFullName: string;
  initialPhone: string;
}) {
  const [state, formAction] = useFormState(updateProfile, initialState);

  return (
    <form action={formAction} className="max-w-sm space-y-6">
      {state.error ? <Alert variant="danger">{state.error}</Alert> : null}
      {state.success ? <Alert variant="success">Profile updated successfully.</Alert> : null}

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Personal information</h3>
        <div className="space-y-1">
          <label htmlFor="fullName" className="text-sm font-medium text-gray-700">
            Full name
          </label>
          <input
            id="fullName"
            name="fullName"
            defaultValue={initialFullName}
            required
            autoComplete="name"
            className="w-full rounded-card border border-surface-border bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="phone" className="text-sm font-medium text-gray-700">
            Phone number
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={initialPhone}
            autoComplete="tel"
            className="w-full rounded-card border border-surface-border bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
      </div>

      <SubmitButton />
    </form>
  );
}
