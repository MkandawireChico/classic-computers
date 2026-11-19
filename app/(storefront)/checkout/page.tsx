import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCartSummary } from "@/lib/data/cart";
import { listAddresses } from "@/lib/services/addresses";
import { getPaymentMethods } from "@/lib/data/site-settings";
import { CheckoutForm } from "./checkout-form";
import { formatMoney } from "@/lib/format/money";
import { getPublicStorageUrl } from "@/lib/storage";

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
      <div className="section-shell max-w-6xl py-8 sm:py-12">
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
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_350px] lg:gap-8">
          <aside className="order-1 h-fit rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:order-2 lg:sticky lg:top-28" aria-labelledby="checkout-summary-heading">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-4">
              <h2 id="checkout-summary-heading" className="text-lg font-extrabold text-[#10243a]">Your order</h2>
              <Link href="/cart" className="text-xs font-bold text-brand-800 underline underline-offset-4 hover:text-brand-950">Edit cart</Link>
            </div>
            <ul className="divide-y divide-slate-100">
              {availableItems.map((item) => {
                const imageUrl = item.imagePath ? getPublicStorageUrl("product-images", item.imagePath) : null;
                return (
                  <li key={item.cartItemId} className="flex gap-3 py-4">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                      {imageUrl ? (
                        <Image src={imageUrl} alt={item.imageAlt ?? item.productName} fill sizes="64px" className="object-contain p-1" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[10px] font-semibold text-slate-400">No image</div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      {item.productSlug ? (
                        <Link href={"/product/" + item.productSlug} className="line-clamp-2 text-sm font-bold leading-5 text-[#10243a] hover:text-brand-800">{item.productName}</Link>
                      ) : (
                        <p className="line-clamp-2 text-sm font-bold leading-5 text-[#10243a]">{item.productName}</p>
                      )}
                      {item.variantName ? <p className="mt-1 text-xs text-slate-500">{item.variantName}</p> : null}
                      <p className="mt-1 text-xs text-slate-500">Qty {item.quantity} · {formatMoney(item.unitPrice)} each</p>
                    </div>
                    <p className="shrink-0 text-sm font-bold tabular-nums text-slate-900">{formatMoney(item.unitPrice * item.quantity)}</p>
                  </li>
                );
              })}
            </ul>
            <div className="border-t border-slate-200 pt-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-slate-600">Items subtotal</span>
                <span className="text-lg font-extrabold tabular-nums text-[#10243a]">{formatMoney(cart.subtotal)}</span>
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-500">Any delivery arrangement and applicable charge will be confirmed with your order.</p>
            </div>
          </aside>
          <div className="order-2 min-w-0 lg:order-1">
            <CheckoutForm
              isAuthenticated={Boolean(user)}
              userEmail={user?.email ?? null}
              subtotal={cart.subtotal}
              addresses={addresses}
              paymentMethods={paymentMethods}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
