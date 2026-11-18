import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AuthVisualPanel } from "@/components/auth/auth-visual-panel";
import { UpdatePasswordForm } from "./update-password-form";

export default async function UpdatePasswordPage({ searchParams }: { searchParams: { error?: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // No session means this page was reached without a valid reset link
  // (expired, already used, or navigated to directly) — send back to
  // request a fresh one rather than showing a form that will just fail.
  if (!user) redirect(`/reset-password?error=${encodeURIComponent(searchParams.error ?? "Your password reset link is invalid or has expired. Request a new one.")}`);

  return (
    <main className="min-h-screen bg-[#f4f6f7]">
      <div className="grid min-h-screen lg:grid-cols-[1.02fr_0.98fr]">
        <AuthVisualPanel
          eyebrow="Account security"
          title="Choose a new password."
          description="Set a new password for your account. Use a password you do not use on other websites."
          points={["Choose at least eight characters", "Keep your password private", "Sign in again with your new password"]}
        />
        <section className="flex items-center justify-center px-4 py-10 sm:px-8 lg:px-12">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-700">Account recovery</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#102033]">Set a new password</h2>
            <p className="mb-7 mt-2 text-sm leading-6 text-slate-600">Choose a new password for your account.</p>
            <UpdatePasswordForm />
          </div>
        </section>
      </div>
    </main>
  );
}
