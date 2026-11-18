import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getCartSummary } from "@/lib/data/cart";
import { getPublicStorageUrl } from "@/lib/storage";
import { formatMoney } from "@/lib/format/money";
import { CartItemControls } from "@/components/storefront/cart-item-controls";

export const metadata: Metadata = { title: "Your Cart", robots: { index: false } };

export default async function CartPage() {
  const cart = await getCartSummary();
  const availableItems = cart.items.filter((i) => i.isAvailable);
  const unavailableItems = cart.items.filter((i) => !i.isAvailable);

  if (cart.items.length === 0) {
    return (
      <main className="min-h-screen bg-[#f4f6f7]"><div className="section-shell max-w-4xl py-12 sm:py-16"><div className="mx-auto max-w-2xl rounded-[1.5rem] border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
        <h1 className="text-2xl font-semibold tracking-tight text-[#102033] sm:text-3xl">Your cart is empty</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">Browse the shop to find something for your setup.</p>
        <Link
          href="/shop"
          className="mt-7 inline-flex min-h-12 items-center justify-center rounded-xl bg-[#0b2238] px-6 text-sm font-bold text-white transition hover:bg-cyan-800"
        >
          Go to shop
        </Link>
      </div></div></main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f6f7]">
    <div className="section-shell max-w-4xl py-10 sm:py-14">
      <header className="mb-7 rounded-[1.5rem] bg-[#081827] p-6 text-white sm:p-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-300">Your selection</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">Your cart</h1>
        <p className="mt-2 text-sm text-slate-300">Review your items and quantities before checkout.</p>
      </header>

      <div className="mt-6 divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {availableItems.map((item) => (
          <div key={item.cartItemId} className="flex flex-wrap items-center gap-4 p-4 sm:p-5">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100">
              {item.imagePath ? (
                <Image
                  src={getPublicStorageUrl("product-images", item.imagePath)}
                  alt={item.imageAlt ?? item.productName}
                  fill
                  sizes="64px"
                  className="object-contain p-1"
                />
              ) : null}
            </div>
            <div className="flex-1">
              <Link href={`/product/${item.productSlug}`} className="text-sm font-bold text-[#102033] hover:text-brand-700 hover:underline">
                {item.productName}
              </Link>
              {item.variantName ? <p className="mt-1 text-xs text-slate-500">{item.variantName}</p> : null}
              <p className="mt-1 text-sm font-bold text-slate-900">{formatMoney(item.unitPrice)}</p>
            </div>
            <CartItemControls cartItemId={item.cartItemId} quantity={item.quantity} />
          </div>
        ))}

        {unavailableItems.map((item) => (
          <div key={item.cartItemId} className="flex items-center gap-4 bg-slate-50 p-4 opacity-75">
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-600">{item.productName}</p>
              <p className="text-xs text-status-danger">No longer available — removed from your total</p>
            </div>
            <CartItemControls cartItemId={item.cartItemId} quantity={item.quantity} />
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <span className="text-sm font-medium text-gray-700">Subtotal</span>
        <span className="text-xl font-extrabold text-[#102033]">{formatMoney(cart.subtotal)}</span>
      </div>
      <p className="mt-2 text-xs leading-5 text-slate-500">
        Final total, including any applicable discounts, is calculated at checkout.
      </p>

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href="/checkout"
          className={`inline-flex min-h-12 items-center justify-center rounded-xl px-6 text-sm font-bold text-white transition ${
            availableItems.length === 0
              ? "pointer-events-none cursor-not-allowed bg-slate-300"
              : "bg-[#0b2238] hover:bg-cyan-800"
          }`}
          aria-disabled={availableItems.length === 0}
        >
          Proceed to checkout
        </Link>
      </div>
    </div>
    </main>
  );
}
