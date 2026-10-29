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
    <div className="min-h-screen bg-gradient-to-br from-amber-50/70 via-white to-emerald-50/60">
      <div className="section-shell max-w-4xl py-8 sm:py-12">
        <div className="mb-6 text-center sm:mb-8">
          <p className="mb-3 inline-flex rounded-full border border-emerald-200 bg-white/80 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-emerald-800 shadow-sm">
            Secure checkout
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Complete your <span className="text-emerald-700">order</span>
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
            Enter your contact details and choose how you&apos;d like to receive and pay for your order.
          </p>
        </div>
        <div className="rounded-3xl border border-emerald-100 bg-white/90 p-4 shadow-xl shadow-emerald-950/5 sm:p-7 lg:p-8">
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
    </div>
  );
}
