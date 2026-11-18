import { AuthVisualPanel } from "@/components/auth/auth-visual-panel";
import { ResetPasswordForm } from "./reset-password-form";

export default function ResetPasswordPage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <main className="min-h-screen bg-[#f4f6f7]">
      <div className="grid min-h-screen lg:grid-cols-[1.02fr_0.98fr]">
        <AuthVisualPanel
          eyebrow="Account access"
          title="Let’s get you back in."
          description="Request a secure password reset link and regain access to your Classic Computers account."
          points={["Use the email linked to your account", "Check your inbox and spam folder", "Choose a new password from the secure link"]}
        />
        <section className="flex items-center justify-center px-4 py-10 sm:px-8 lg:px-12">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-700">Account recovery</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#102033]">Reset your password</h2>
            <p className="mb-7 mt-2 text-sm leading-6 text-slate-600">We’ll send a password reset link to your email address.</p>
            <ResetPasswordForm initialError={searchParams.error} />
          </div>
        </section>
      </div>
    </main>
  );
}
