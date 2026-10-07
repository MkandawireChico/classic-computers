import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { type EmailOtpType } from "@supabase/supabase-js";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
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

  // 2. Handle OAuth & Authorization Code Flow
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const isEmailVerificationFlow = type === "signup" || type === "email" || type === "magiclink" || type === "otp";
      if (isEmailVerificationFlow) {
        return NextResponse.redirect(`${origin}/auth/verified?next=${encodeURIComponent(next)}`);
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
    // Log the error to server logs for debugging
    console.error("exchangeCodeForSession error:", error?.message);
    return NextResponse.redirect(`${origin}/sign-in?error=${encodeURIComponent(error?.message || "oauth_failed")}`);
  }

  // 3. Handle Email Confirmation, Password Recovery & Magic Links
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error) {
      const isEmailVerificationFlow = type === "signup" || type === "email" || type === "magiclink" || type === "otp";
      if (isEmailVerificationFlow) {
        return NextResponse.redirect(`${origin}/auth/verified?next=${encodeURIComponent(next)}`);
      }
      return NextResponse.redirect(`${origin}${next}`);
    }

    // Log the error to server logs for debugging
    console.error("verifyOtp error:", error?.message);
    return NextResponse.redirect(`${origin}/reset-password?error=${encodeURIComponent(error?.message || "invalid_token")}`);
  }

  return NextResponse.redirect(`${origin}/reset-password?error=missing_token`);
}