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
  const safeRedirect = getSafeRedirectTo(requestedRedirect, "/sign-in");

  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${siteUrl}/auth/confirm?next=${encodeURIComponent(safeRedirect)}`,
      // full_name is read by handle_new_user() (0004); referral_code is
      // read by handle_referral_signup() (0041) — both are separate
      // triggers on the same auth.users insert.
      data: { full_name: parsed.data.fullName, referral_code: referralCode || null },
    },
  });

  if (error) {
    // Log the exact error for debugging
    console.error("Supabase signUp error:", error.message, error);
    return { error: error.message || "Could not create account. Please try again." };
  }

  // If user is returned but session is null, email confirmation is required
  if (data.user && !data.session) {
    return {
      error: null,
      success: true,
      message: "We have sent a verification link to your email. Please check your inbox or spam folder.",
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

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/sign-in");
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
  // Errors are intentionally not surfaced here beyond a generic message —
  // confirming or denying whether an email is registered via this form
  // would let someone enumerate customer accounts.
  await supabase.auth.resetPasswordForEmail(parsed.data, {
    redirectTo: `${siteUrl}/auth/callback?next=/update-password`,
  });

  return { error: null, success: true, email: parsed.data };
}

export async function updatePassword(_prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const password = formData.get("password");
  const parsed = signUpSchema.shape.password.safeParse(password);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid password." };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data });
  if (error) {
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
