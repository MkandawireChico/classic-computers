import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCartSummary } from "@/lib/data/cart";
import { listAddresses } from "@/lib/services/addresses";
import { getPaymentMethods } from "@/lib/data/site-settings";
import { CheckoutForm } from "./checkout-form";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default async function CheckoutPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const cart = await getCartSummary();
  const availableItems = cart.items.filter((i) => i.isAvailable);

  if (availableItems.length === 0) {
    redirect("/cart");
  }

  const [addresses, paymentMethods] = await Promise.all([
    user ? listAddresses() : Promise.resolve([]),
    getPaymentMethods(),
  ]);

  return (
    <main className="min-h-screen bg-[#f4f6f7]">
      <div className="section-shell max-w-4xl py-8 sm:py-12">
        <header className="mb-7 rounded-[1.5rem] bg-[#081827] p-6 text-center text-white shadow-xl shadow-slate-900/10 sm:mb-8 sm:p-9">
          <p className="mb-3 inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-cyan-200">
            Secure checkout
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Complete your <span className="text-cyan-300">order</span>
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
            Enter your contact details and choose how you&apos;d like to receive and pay for your order.
          </p>
        </header>
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-7 lg:p-8">
          <CheckoutForm
            isAuthenticated={Boolean(user)}
            userEmail={user?.email ?? null}
            subtotal={cart.subtotal}
            itemCount={availableItems.reduce((sum, i) => sum + i.quantity, 0)}
            addresses={addresses}
            paymentMethods={paymentMethods}
          />
        </div>
      </div>
    </main>
  );
}
