"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signInSchema, signUpSchema } from "@/schemas/auth";
import { mergeGuestCartIntoCustomerCart } from "@/lib/services/cart";

export type AuthActionState = {
  error: string | null;
  success?: boolean;
};

function getSafeRedirectTo(value: FormDataEntryValue | null, fallback = "/account") {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return fallback;
  }
  return value;
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

  redirect(getSafeRedirectTo(formData.get("redirectTo")));
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
  const redirectTo = getSafeRedirectTo(formData.get("redirectTo"));

  const supabase = createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      // full_name is read by handle_new_user() (0004); referral_code is
      // read by handle_referral_signup() (0041) — both are separate
      // triggers on the same auth.users insert.
      data: { full_name: parsed.data.fullName, referral_code: referralCode || null },
    },
  });

  if (error) {
    return { error: "Could not create account. Please try again." };
  }

  redirect(`/sign-in?verify=1&redirectTo=${encodeURIComponent(redirectTo)}`);
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
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  // Errors are intentionally not surfaced here beyond a generic message —
  // confirming or denying whether an email is registered via this form
  // would let someone enumerate customer accounts.
  await supabase.auth.resetPasswordForEmail(parsed.data, {
    redirectTo: `${siteUrl}/auth/callback?next=/update-password`,
  });

  return { error: null, success: true };
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

  redirect("/account");
}
