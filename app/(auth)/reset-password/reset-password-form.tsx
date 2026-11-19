"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { requestPasswordReset } from "../actions";

export function ResetPasswordForm({ initialError }: { initialError?: string }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;

    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.set("email", email.trim());

    try {
      const result = await requestPasswordReset({ error: null }, formData);
      if (result.error) {
        setError(result.error);
        return;
      }

      setSubmittedEmail(email.trim());
      setSuccessMessage(
        result.message ?? "If an account exists for this address, a reset email will be sent."
      );
    } catch {
      setError(
        "We couldn't confirm the request reached the server. Check your inbox and spam folder before requesting another link."
      );
    } finally {
      setLoading(false);
    }
  };

  if (successMessage && submittedEmail) {
    return (
      <div className="space-y-4" aria-live="polite">
        <Alert variant="success" className="space-y-2">
          <p className="font-medium">Check your email</p>
          <p className="text-sm">
            {successMessage} Check the inbox and spam folder for{" "}
            <span className="font-semibold">{submittedEmail}</span>.
          </p>
        </Alert>
        <button
          type="button"
          onClick={() => {
            setSuccessMessage(null);
            setSubmittedEmail(null);
            setError(null);
          }}
          className="text-sm font-semibold text-cyan-800 underline underline-offset-4"
        >
          Use a different email address
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {error ? <Alert variant="danger">{error}</Alert> : null}
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
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-card border border-surface-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </div>
      <Button type="submit" isLoading={loading} disabled={loading} className="w-full">
        {loading ? "Sending reset link..." : "Send reset link"}
      </Button>
    </form>
  );
}
