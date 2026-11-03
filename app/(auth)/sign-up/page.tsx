import Link from "next/link";
import { SignUpForm } from "./sign-up-form";

export default function SignUpPage({ searchParams }: { searchParams: { ref?: string; redirectTo?: string } }) {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/50">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Branding Panel */}
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-700 via-brand-700 to-slate-900 px-8 py-12 sm:px-12 sm:py-16 lg:px-16 lg:py-20">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/30 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-brand-500/20 via-transparent to-transparent" />
          
          <div className="relative z-10 flex h-full flex-col justify-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <p className="text-sm font-bold uppercase tracking-[0.25em] text-emerald-200">Classic Computers LLC</p>
                <h1 className="text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
                  Create your account
                </h1>
                <p className="max-w-lg text-lg leading-relaxed text-emerald-100 sm:text-xl">
                  Join Classic Computers to track orders, manage repairs, rentals and enjoy a personalized shopping experience.
                </p>
              </div>

              <div className="space-y-6 pt-8">
                <div className="flex items-center gap-4 text-emerald-200">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M22 10v6M2 10l10-7 10 7-10 7-10-7Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.6" />
                  </svg>
                  <span className="text-base font-medium">Track your orders</span>
                </div>
                <div className="flex items-center gap-4 text-emerald-200">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="text-base font-medium">Manage repairs & rentals</span>
                </div>
                <div className="flex items-center gap-4 text-emerald-200">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.6" />
                  </svg>
                  <span className="text-base font-medium">Save your details for faster checkout</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sign-up Panel */}
        <div className="flex items-center justify-center px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <div className="w-full max-w-md">
            <div className="mb-8 space-y-2">
              <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">Create an account</h2>
              <p className="text-base text-slate-600">Enter your details to get started</p>
            </div>

            <SignUpForm initialReferralCode={searchParams.ref} redirectTo={searchParams.redirectTo} />

            <p className="mt-6 text-center text-base text-slate-600">
              Already have an account?{" "}
              <Link href="/sign-in" className="font-extrabold text-brand-700 hover:text-brand-600 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
