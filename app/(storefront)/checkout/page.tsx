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
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-gray-900">Checkout</h1>
      <CheckoutForm
        isAuthenticated={Boolean(user)}
        userEmail={user?.email ?? null}
        subtotal={cart.subtotal}
        itemCount={availableItems.reduce((sum, i) => sum + i.quantity, 0)}
        addresses={addresses}
        paymentMethods={paymentMethods}
      />
    </div>
  );
}
