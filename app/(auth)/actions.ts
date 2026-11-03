"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signInSchema, signUpSchema } from "@/schemas/auth";
import { mergeGuestCartIntoCustomerCart } from "@/lib/services/cart";
import { getPermissionsForUser } from "@/lib/auth/permissions";
import { getPublicSiteOrigin } from "@/lib/auth/site-url";
import { getAuthRedirectUrl } from "@/lib/auth/site-url";

export type AuthActionState = {
  error: string | null;
  success?: boolean;
  message?: string;
  email?: string;
};

function getSafeRedirectTo(value: FormDataEntryValue | null, fallback = "/account") {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return fallback;
  }
  return value;
}

async function getPostLoginRedirectTarget(userId: string): Promise<string> {
  const permissions = await getPermissionsForUser(userId);
  return permissions.size > 0 ? "/admin" : "/account";
}

export async function signIn(_prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    if (error.code === "email_not_confirmed") {
      return { error: "Please confirm your email before signing in. Check your confirmation email or request another link from sign-up." };
    }
    // Deliberately generic — never confirm/deny whether an email is registered.
    return { error: "Invalid email or password." };
  }

  if (data.user) {
    await mergeGuestCartIntoCustomerCart(data.user.id);
  }

  const target = data.user ? await getPostLoginRedirectTarget(data.user.id) : "/account";
  const explicitRedirect = formData.get("redirectTo");
  if (typeof explicitRedirect === "string" && explicitRedirect.trim().length > 0) {
    const safeRedirect = getSafeRedirectTo(explicitRedirect);
    const redirectsToAdmin = safeRedirect === "/admin" || safeRedirect.startsWith("/admin/");
    const redirectsToAccount = safeRedirect === "/account" || safeRedirect.startsWith("/account/");
    const roleRedirectConflicts =
      (target === "/admin" && redirectsToAccount) ||
      (target === "/account" && redirectsToAdmin);

    redirect(roleRedirectConflicts ? target : safeRedirect);
  }

  redirect(target);
}

export async function signUp(_prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const parsed = signUpSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const referralCode = formData.get("referralCode")?.toString().trim();
  const siteUrl = getPublicSiteOrigin();
  const requestedRedirect = formData.get("redirectTo");
  const safeRedirect = getSafeRedirectTo(requestedRedirect, "/account");

  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${siteUrl}/auth/confirm?flow=signup&next=${encodeURIComponent(safeRedirect)}`,
      // full_name is read by handle_new_user() (0004); referral_code is
      // read by handle_referral_signup() (0041) — both are separate
      // triggers on the same auth.users insert.
      data: { full_name: parsed.data.fullName, referral_code: referralCode || null },
    },
  });

  if (error) {
    console.error("Supabase signup request failed:", { code: error.code, message: error.message });
    if (error.code === "over_email_send_rate_limit") {
      return { error: "Too many confirmation requests. Please wait before trying again." };
    }
    return { error: "Could not create the account. If you already registered, try signing in or resetting your password." };
  }

  if (data.user && !data.session) {
    return {
      error: null,
      success: true,
      message: "Supabase accepted the registration request. If this account needs confirmation, it will attempt to send an email; delivery is not confirmed here.",
      email: parsed.data.email,
    };
  }

  // If session exists, user is automatically signed in
  if (data.user && data.session) {
    await mergeGuestCartIntoCustomerCart(data.user.id);
    const target = await getPostLoginRedirectTarget(data.user.id);
    redirect(target);
  }

  return { error: "Could not create account. Please try again." };
}

export async function resendSignupConfirmation(email: string, redirectTo?: string): Promise<AuthActionState> {
  const parsedEmail = signInSchema.shape.email.safeParse(email);
  if (!parsedEmail.success) {
    return { error: "Enter a valid email address before requesting another confirmation link." };
  }

  const supabase = createClient();
  const safeRedirect = getSafeRedirectTo(redirectTo ?? null, "/account");
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: parsedEmail.data,
    options: {
      emailRedirectTo: `${getPublicSiteOrigin()}/auth/confirm?flow=signup&next=${encodeURIComponent(safeRedirect)}`,
    },
  });

  if (error) {
    console.error("Supabase confirmation resend failed:", { code: error.code, message: error.message });
    if (error.code === "over_email_send_rate_limit") {
      return { error: "Too many confirmation requests. Please wait before trying again." };
    }
    return { error: "Supabase could not accept the confirmation request. Please try again later." };
  }

  return {
    error: null,
    success: true,
    message: "Supabase accepted the request. If this account still needs confirmation, it will attempt to send an email; delivery is not confirmed here.",
  };
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function requestPasswordReset(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = formData.get("email");
  const parsed = signInSchema.shape.email.safeParse(email);
  if (!parsed.success) {
    return { error: "Enter a valid email address." };
  }

  const supabase = createClient();
  const siteUrl = getPublicSiteOrigin();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, {
    redirectTo: `${siteUrl}/auth/callback?next=/update-password`,
  });
  if (error) {
    console.error("Password reset request failed:", { code: error.code, message: error.message });
    if (error.code === "over_email_send_rate_limit") {
      return { error: "Too many reset requests. Please wait before trying again." };
    }
    return { error: "Supabase could not accept the reset request. Please try again later." };
  }

  return {
    error: null,
    success: true,
    email: parsed.data,
    message: "If an account exists for this address, Supabase accepted the request. Email delivery is not confirmed.",
  };
}

export async function updatePassword(_prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const password = formData.get("password");
  const confirmation = formData.get("confirmPassword");
  const parsed = signUpSchema.shape.password.safeParse(password);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid password." };
  }
  if (typeof confirmation !== "string" || confirmation !== parsed.data) {
    return { error: "The passwords do not match." };
  }

  const supabase = createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { error: "Your reset session has expired. Request a new password reset link." };
  }
  const { error } = await supabase.auth.updateUser({ password: parsed.data });
  if (error) {
    console.error("Password update failed:", { code: error.code, message: error.message });
    return { error: "Could not update your password. The reset link may have expired — request a new one." };
  }

  return { error: null, success: true };
}

export async function signInWithOAuth(provider: "google" | "github" | "apple" | "azure", redirectTo?: string) {
  const supabase = createClient();
  const safeRedirect = getSafeRedirectTo(redirectTo || null, "/account");

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: getAuthRedirectUrl(`/auth/callback?next=${encodeURIComponent(safeRedirect)}`),
    },
  });

  if (error) {
    console.error("OAuth sign-in error:", error);
    redirect(`/sign-in?error=${encodeURIComponent("Failed to sign in with " + provider)}`);
  }

  redirect(data.url);
}
