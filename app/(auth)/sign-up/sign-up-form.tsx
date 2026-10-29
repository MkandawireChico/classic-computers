"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { AuthProviderButtons } from "@/components/auth-provider-buttons";
import { signUp, signInWithOAuth } from "../actions";

export function SignUpForm({ initialReferralCode, redirectTo }: { initialReferralCode?: string; redirectTo?: string }) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [successEmail, setSuccessEmail] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    try {
      const res = await signUp({ error: null }, formData);

      if (res?.error) {
        setError(res.error);
      } else if (res?.success && res?.message) {
        setSuccessMessage(res.message);
        setSuccessEmail(res.email || null);
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = (provider: "google" | "apple" | "azure") => {
    signInWithOAuth(provider, redirectTo);
  };

  if (successMessage) {
    const email = successEmail || "your email";
    return (
      <div className="space-y-4">
        <Alert variant="success" className="space-y-2">
          <p className="font-medium">Account created successfully</p>
          <p className="text-sm">We've sent a confirmation link to <span className="font-semibold">{email}</span>. Please check your inbox and confirm your email before signing in.</p>
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
    <div className="space-y-6">
      <AuthProviderButtons onProviderSelect={handleOAuthSignIn} />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-surface-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-500">Or continue with email</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {redirectTo ? <input type="hidden" name="redirectTo" value={redirectTo} /> : null}
        {error ? <Alert variant="danger">{error}</Alert> : null}

      <div className="space-y-1">
        <label htmlFor="fullName" className="text-sm font-medium text-gray-700">
          Full name
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          autoComplete="name"
          required
          className="w-full rounded-card border border-surface-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </div>

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

      <div className="space-y-1">
        <label htmlFor="password" className="text-sm font-medium text-gray-700">
          Password
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
        <p className="text-xs text-gray-500">At least 8 characters.</p>
      </div>

      <div className="space-y-1">
        <label htmlFor="referralCode" className="text-sm font-medium text-gray-700">
          Referral code (optional)
        </label>
        <input
          id="referralCode"
          name="referralCode"
          type="text"
          defaultValue={initialReferralCode}
          className="w-full rounded-card border border-surface-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </div>

      <Button type="submit" isLoading={loading} className="w-full">
        {loading ? "Creating account..." : "Create account"}
      </Button>
    </form>
    </div>
  );
}
