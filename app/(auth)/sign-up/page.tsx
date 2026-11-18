import Link from "next/link";
import { Alert } from "@/components/ui/alert";
import { AuthVisualPanel } from "@/components/auth/auth-visual-panel";
import { SignUpForm } from "./sign-up-form";

export default function SignUpPage({
  searchParams,
}: {
  searchParams: { ref?: string; redirectTo?: string; error?: string };
}) {
  return (
    <main className="min-h-screen bg-[#f4f6f7]">
      <div className="grid min-h-screen lg:grid-cols-[1.02fr_0.98fr]">
        <AuthVisualPanel
          eyebrow="Join Classic Computers"
          title="Your account. A smoother tech experience."
          description="Create an account to keep purchases, repairs and rental requests organised in one place."
          points={["Keep track of your orders", "Manage repairs and rental requests", "Save your details for next time"]}
        />

        <section className="flex items-center justify-center px-4 py-10 sm:px-8 sm:py-14 lg:px-12 xl:px-16">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
            <div className="mb-7">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-700">Customer account</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#102033] sm:text-4xl">Create your account</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">Add your details below to get started.</p>
            </div>

            {searchParams.error ? (
              <Alert variant="danger" className="mb-6">
                {searchParams.error}
              </Alert>
            ) : null}

            <SignUpForm initialReferralCode={searchParams.ref} redirectTo={searchParams.redirectTo} />

            <p className="mt-7 border-t border-slate-100 pt-6 text-center text-sm text-slate-600">
              Already have an account?{" "}
              <Link
                href={searchParams.redirectTo ? `/sign-in?redirectTo=${encodeURIComponent(searchParams.redirectTo)}` : "/sign-in"}
                className="font-bold text-cyan-800 underline-offset-4 transition hover:text-cyan-600 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
