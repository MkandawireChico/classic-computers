import Link from "next/link";
import { Alert } from "@/components/ui/alert";
import { AuthVisualPanel } from "@/components/auth/auth-visual-panel";
import { SignInForm } from "./sign-in-form";

export default function SignInPage({
  searchParams,
}: {
  searchParams: { verify?: string; redirectTo?: string; error?: string };
}) {
  return (
    <main className="min-h-screen bg-[#f4f6f7]">
      <div className="grid min-h-screen lg:grid-cols-[1.02fr_0.98fr]">
        <AuthVisualPanel
          eyebrow="Classic Computers LLC"
          title="Good to have you back."
          description="Your account keeps your technology purchases and support requests together. Sign in to pick up where you left off."
          points={["Track orders and payments", "Follow repairs and rentals", "Keep your account details up to date"]}
        />

        <section className="flex items-center justify-center px-4 py-10 sm:px-8 sm:py-14 lg:px-12 xl:px-16">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
            <div className="mb-8">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-700">Customer account</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#102033] sm:text-4xl">Sign in</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">Enter your details to access your Classic Computers account.</p>
            </div>

            {searchParams.verify ? (
              <Alert variant="info" className="mb-6">
                Check your email to confirm your account before signing in.
              </Alert>
            ) : null}

            {searchParams.error ? (
              <Alert variant="danger" className="mb-6">
                {searchParams.error}
              </Alert>
            ) : null}

            <SignInForm redirectTo={searchParams.redirectTo} />

            <p className="mt-7 border-t border-slate-100 pt-6 text-center text-sm text-slate-600">
              New to Classic Computers?{" "}
              <Link
                href={searchParams.redirectTo ? `/sign-up?redirectTo=${encodeURIComponent(searchParams.redirectTo)}` : "/sign-up"}
                className="font-bold text-cyan-800 underline-offset-4 transition hover:text-cyan-600 hover:underline"
              >
                Create an account
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
