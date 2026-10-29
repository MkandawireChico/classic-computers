import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { getAuthRedirectUrl } from "@/lib/auth/site-url";

const SIGNUP_CONFIRMATION_ERROR =
  "Your email confirmation link is invalid or has expired. Please request a new confirmation email.";
const PASSWORD_RESET_ERROR = "Your password reset link is invalid or has expired. Please request a new one.";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  const defaultNext = type === "recovery" ? "/update-password" : "/sign-in";
  const requestedNext = searchParams.get("next");
  const next =
    requestedNext && requestedNext.startsWith("/") && !requestedNext.startsWith("//") && requestedNext !== "/"
      ? requestedNext
      : defaultNext;

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const isEmailVerificationFlow = type === "signup" || type === "email" || type === "magiclink" || type === "otp";
      if (isEmailVerificationFlow) {
        return NextResponse.redirect(getAuthRedirectUrl(`/auth/verified?next=${encodeURIComponent(next)}`));
      }
      return NextResponse.redirect(getAuthRedirectUrl(next));
    }

    console.error("exchangeCodeForSession error:", { message: error?.message, type });
    return NextResponse.redirect(getAuthRedirectUrl(`/sign-in?error=${encodeURIComponent(error?.message || "oauth_failed")}`));
  }

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error) {
      const isEmailVerificationFlow = type === "signup" || type === "email" || type === "magiclink" || type === "otp";
      if (isEmailVerificationFlow) {
        return NextResponse.redirect(getAuthRedirectUrl(`/auth/verified?next=${encodeURIComponent(next)}`));
      }
      return NextResponse.redirect(getAuthRedirectUrl(next));
    }

    console.error("verifyOtp error:", { message: error?.message, type });

    if (type === "recovery") {
      return NextResponse.redirect(getAuthRedirectUrl(`/reset-password?error=${encodeURIComponent(PASSWORD_RESET_ERROR)}`));
    }

    return NextResponse.redirect(getAuthRedirectUrl(`/sign-in?error=${encodeURIComponent(SIGNUP_CONFIRMATION_ERROR)}`));
  }

  return NextResponse.redirect(getAuthRedirectUrl(`/sign-in?error=${encodeURIComponent(SIGNUP_CONFIRMATION_ERROR)}`));
}