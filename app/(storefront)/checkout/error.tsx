"use client";

import Link from "next/link";

export default function CheckoutError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="min-h-[60vh] bg-[#f4f6f7] px-4 py-16">
      <section className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-sm sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-800">Secure checkout</p>
        <h1 className="mt-3 text-2xl font-bold text-navy-950">Checkout is temporarily unavailable</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">We couldn't verify your order details. Your order has not been submitted from this page. Return to your cart or try loading checkout again.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={() => reset()} className="min-h-11 rounded-lg bg-[#123653] px-5 text-sm font-bold text-white hover:bg-brand-800">Try again</button>
          <Link href="/cart" className="inline-flex min-h-11 items-center rounded-lg border border-slate-300 px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Review cart</Link>
        </div>
      </section>
    </main>
  );
}
