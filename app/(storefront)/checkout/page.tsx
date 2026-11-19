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
      <div className="section-shell max-w-5xl py-8 sm:py-12">
        <header className="mb-7 border-b border-slate-200 pb-6 sm:mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-800">
            Checkout
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#102033] sm:text-4xl">
            Complete your order
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            Add your contact details, select pickup or delivery, then choose a payment method.
          </p>
        </header>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-7 lg:p-8">
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
