"use client";

import React, { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { AuthProviderButtons } from "@/components/auth-provider-buttons";
import { resendSignupConfirmation, signUp } from "../actions";
import { createBrowserClient } from "@supabase/ssr";
import { getAuthRedirectUrl } from "@/lib/auth/site-url";

const initialState = { error: null as string | null };

function SignUpSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isLoading={pending} disabled={pending} className="min-h-12 w-full rounded-2xl bg-[#0b2238] px-6 py-4 text-base font-bold text-white shadow-lg shadow-slate-900/10 transition-all duration-300 hover:bg-cyan-800 hover:shadow-xl hover:-translate-y-0.5">
      {pending ? "Creating account..." : "Create account"}
    </Button>
  );
}

function maskEmail(email: string): string {
  const [localPart, domain] = email.split("@");
  if (!localPart || !domain) return email;
  return `${localPart.slice(0, 1)}***@${domain}`;
}

export function SignUpForm({ initialReferralCode, redirectTo }: { initialReferralCode?: string; redirectTo?: string }) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [successEmail, setSuccessEmail] = useState<string | null>(null);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (resendCooldown === 0) return;
    const timer = window.setTimeout(() => setResendCooldown((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [resendCooldown]);

  const handleResend = async () => {
    if (!successEmail || resendCooldown > 0 || resending) return;
    setResending(true);
    setResendError(null);
    setResendMessage(null);
    setResendCooldown(30);

    try {
      const result = await resendSignupConfirmation(successEmail, redirectTo);
      if (result.error) {
        setResendError(result.error);
      } else {
        setResendMessage(result.message ?? "The request was accepted; email delivery is not confirmed.");
      }
    } catch {
      setResendError("Could not request another confirmation link. Check your connection and try again.");
    } finally {
      setResending(false);
    }
  };

  const handleOAuthSignIn = async (provider: "google" | "azure" | "apple") => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const safeRedirect = redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//") ? redirectTo : "/account";

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: getAuthRedirectUrl(`/auth/callback?next=${encodeURIComponent(safeRedirect)}`),
      },
    });

    if (error) {
      console.error("OAuth sign-in error:", error);
      window.location.href = `/sign-up?error=${encodeURIComponent("Failed to sign in with " + provider)}`;
      return;
    }

    if (data.url) {
      window.location.href = data.url;
    }
  };

  if (successMessage) {
    const email = successEmail ? maskEmail(successEmail) : "your email address";
    return (
      <div className="space-y-4">
        <Alert variant="success" className="space-y-2">
          <p className="font-medium">Registration request accepted</p>
          <p className="text-sm">{successMessage} Address: <span className="font-semibold">{email}</span></p>
        </Alert>
        <p className="text-sm text-slate-600">If an email arrives, check your inbox and spam folder. Confirmation links expire; you can request another below.</p>
        {resendError ? <Alert variant="danger">{resendError}</Alert> : null}
        {resendMessage ? <Alert variant="info">{resendMessage}</Alert> : null}
        <Button
          type="button"
          onClick={handleResend}
          disabled={resending || resendCooldown > 0 || !successEmail}
          isLoading={resending}
          className="w-full"
        >
          {resendCooldown > 0 ? `Resend link in ${resendCooldown}s` : "Resend confirmation link"}
        </Button>
        <Link
          href="/sign-in"
          className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
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
          <span className="w-full border-t-2 border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-3 text-sm font-bold text-slate-500">Or continue with email</span>
        </div>
      </div>

      <form action={formAction} className="space-y-5" noValidate>
        {redirectTo ? <input type="hidden" name="redirectTo" value={redirectTo} /> : null}
        {state.error ? <Alert variant="danger">{state.error}</Alert> : null}

      <div className="space-y-2">
        <label htmlFor="fullName" className="text-sm font-bold text-slate-700">
          Full name
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          autoComplete="name"
          required
          className="w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-medium focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-100 transition-all"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-bold text-slate-700">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-medium focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-100 transition-all"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-bold text-slate-700">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-medium focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-100 transition-all"
        />
        <p className="text-sm text-slate-500">At least 8 characters.</p>
      </div>

      <div className="space-y-2">
        <label htmlFor="referralCode" className="text-sm font-bold text-slate-700">
          Referral code (optional)
        </label>
        <input
          id="referralCode"
          name="referralCode"
          type="text"
          defaultValue={initialReferralCode}
          className="w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-medium focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-100 transition-all"
        />
      </div>

      <SignUpSubmitButton />
    </form>
    </div>
  );
}
