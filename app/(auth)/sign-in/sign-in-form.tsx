"use client";

import { useEffect, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { AuthProviderButtons } from "@/components/auth-provider-buttons";
import { resendSignupConfirmation, signIn, type AuthActionState } from "../actions";
import { createBrowserClient } from "@supabase/ssr";
import { getAuthRedirectUrl } from "@/lib/auth/site-url";

const initialState: AuthActionState = { error: null };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isLoading={pending} className="min-h-12 w-full rounded-2xl bg-[#0b2238] px-6 py-4 text-base font-bold text-white shadow-lg shadow-slate-900/10 transition-all duration-300 hover:bg-cyan-800 hover:shadow-xl hover:-translate-y-0.5">
      Sign in
    </Button>
  );
}

export function SignInForm({ redirectTo }: { redirectTo?: string }) {
  const [state, formAction] = useFormState(signIn, initialState);
  const emailInput = useRef<HTMLInputElement>(null);
  const [resendError, setResendError] = useState<string | null>(null);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown === 0) return;
    const timer = window.setTimeout(() => setResendCooldown((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [resendCooldown]);

  const handleResend = async () => {
    const email = emailInput.current?.value ?? "";
    setResending(true);
    setResendError(null);
    setResendMessage(null);
    setResendCooldown(30);
    try {
      const result = await resendSignupConfirmation(email, redirectTo);
      if (result.error) setResendError(result.error);
      else {
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
      window.location.href = `/sign-in?error=${encodeURIComponent("Failed to sign in with " + provider)}`;
      return;
    }

    if (data.url) {
      window.location.href = data.url;
    }
  };

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
        {state.error?.startsWith("Please confirm your email") ? (
          <div className="space-y-3">
            {resendError ? <Alert variant="danger">{resendError}</Alert> : null}
            {resendMessage ? <Alert variant="info">{resendMessage}</Alert> : null}
            <Button
              type="button"
              onClick={handleResend}
              disabled={resending || resendCooldown > 0}
              isLoading={resending}
              className="w-full"
            >
              {resendCooldown > 0 ? `Resend link in ${resendCooldown}s` : "Resend confirmation link"}
            </Button>
          </div>
        ) : null}

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-bold text-slate-700">
            Email
          </label>
          <input
            id="email"
            ref={emailInput}
            name="email"
            type="email"
            autoComplete="email"
            required
            className="w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-medium focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-100 transition-all"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-bold text-slate-700">
              Password
            </label>
            <a href="/reset-password" className="text-sm font-bold text-cyan-800 hover:text-cyan-600 transition-colors">
              Forgot password?
            </a>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-medium focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-100 transition-all"
          />
        </div>

        <SubmitButton />
      </form>
    </div>
  );
}
