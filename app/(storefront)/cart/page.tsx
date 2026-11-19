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
  const availableItems = cart.items.filter((item) => item.isAvailable);
  const unavailableItems = cart.items.filter((item) => !item.isAvailable);
  const itemCount = availableItems.reduce((sum, item) => sum + item.quantity, 0);

  if (cart.items.length === 0) {
    return (
      <main className="min-h-screen bg-[#f5f7fa]">
        <div className="section-shell max-w-5xl py-12 sm:py-16">
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm sm:px-12">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-800">Classic Computers</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#102033]">Your cart is empty</h1>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">
              Your next upgrade starts in the shop. Browse our available computers, accessories and ICT equipment.
            </p>
            <Link href="/shop" className="mt-7 inline-flex min-h-12 items-center justify-center rounded-xl bg-[#123653] px-6 text-sm font-bold text-white transition hover:bg-cyan-800">
              Browse the shop
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f7fa]">
      <div className="section-shell max-w-6xl py-8 sm:py-12">
        <header className="mb-7 flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-800">Your selection</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#102033] sm:text-4xl">Shopping cart</h1>
            <p className="mt-2 text-sm text-slate-600">
              {itemCount} available item{itemCount === 1 ? "" : "s"} ready for checkout
            </p>
          </div>
          <Link href="/shop" className="text-sm font-semibold text-cyan-800 underline-offset-4 hover:underline">
            Continue shopping
          </Link>
        </header>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section aria-label="Cart items" className="space-y-4">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              {availableItems.map((item, index) => (
                <article key={item.cartItemId} className={`flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5 ${index > 0 ? "border-t border-slate-100" : ""}`}>
                  <Link href={`/product/${item.productSlug}`} className="relative h-24 w-full shrink-0 overflow-hidden rounded-xl bg-slate-50 sm:h-24 sm:w-28" aria-label={`View ${item.productName}`}>
                    {item.imagePath ? (
                      <Image
                        src={getPublicStorageUrl("product-images", item.imagePath)}
                        alt={item.imageAlt ?? item.productName}
                        fill
                        sizes="(max-width: 640px) 100vw, 112px"
                        className="object-contain p-2"
                      />
                    ) : (
                      <span className="flex h-full items-center justify-center text-xs font-medium text-slate-400">Image unavailable</span>
                    )}
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link href={`/product/${item.productSlug}`} className="text-sm font-bold leading-5 text-[#102033] hover:text-cyan-800 hover:underline">
                      {item.productName}
                    </Link>
                    {item.variantName ? <p className="mt-1 text-xs text-slate-500">{item.variantName}</p> : null}
                    <p className="mt-2 text-sm font-semibold text-slate-900">{formatMoney(item.unitPrice)} <span className="font-normal text-slate-500">each</span></p>
                    <p className={`mt-1 text-xs font-medium ${item.inventoryStatus === "low_stock" ? "text-amber-700" : "text-emerald-700"}`}>
                      {item.inventoryStatus === "low_stock" ? "Limited stock" :
                        item.inventoryStatus === "in_stock" ? "In stock" :
                        item.inventoryStatus === "out_of_stock" ? "Out of stock" :
                        item.inventoryStatus === "coming_soon" ? "Coming soon" :
                        item.inventoryStatus === "discontinued" ? "Discontinued" :
                        "Availability unconfirmed"}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-3 sm:min-w-44 sm:flex-col sm:items-end sm:border-0 sm:pt-0">
                    <CartItemControls cartItemId={item.cartItemId} quantity={item.quantity} />
                    <p className="text-sm font-bold tabular-nums text-[#102033]">{formatMoney(item.unitPrice * item.quantity)}</p>
                  </div>
                </article>
              ))}
              {availableItems.length === 0 ? (
                <div className="p-6 text-sm text-slate-600">No available products are ready for checkout.</div>
              ) : null}
            </div>

            {unavailableItems.length > 0 ? (
              <section className="overflow-hidden rounded-2xl border border-amber-200 bg-amber-50/70" aria-labelledby="unavailable-items-heading">
                <div className="border-b border-amber-200 px-4 py-3 sm:px-5">
                  <h2 id="unavailable-items-heading" className="text-sm font-bold text-amber-950">Items needing attention</h2>
                  <p className="mt-1 text-xs leading-5 text-amber-900">These products are no longer available. They are excluded from your subtotal and checkout.</p>
                </div>
                {unavailableItems.map((item) => (
                  <div key={item.cartItemId} className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-100 px-4 py-4 last:border-0 sm:px-5">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800">{item.productName}</p>
                      <p className="mt-1 text-xs text-amber-900">{item.inventoryStatus === "out_of_stock" ? "Out of stock" :
                        item.inventoryStatus === "coming_soon" ? "Coming soon" :
                        item.inventoryStatus === "discontinued" ? "Discontinued" :
                        item.inventoryStatus === null ? "Stock status unavailable" :
                        "Product or configuration unavailable"} · Remove this item or leave it in your cart.</p>
                    </div>
                    <CartItemControls cartItemId={item.cartItemId} quantity={item.quantity} />
                  </div>
                ))}
              </section>
            ) : null}
          </section>

          <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-24">
            <h2 className="text-lg font-bold text-[#102033]">Order summary</h2>
            <div className="mt-5 flex items-center justify-between text-sm text-slate-600">
              <span>Available items</span>
              <span className="font-semibold tabular-nums text-slate-900">{itemCount}</span>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-4">
              <span className="text-sm font-semibold text-slate-700">Subtotal</span>
              <span className="text-xl font-extrabold tabular-nums text-[#102033]">{formatMoney(cart.subtotal)}</span>
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-500">
              Delivery charges and any applicable discounts are confirmed during checkout.
            </p>
            {availableItems.length > 0 ? (
              <Link
                href="/checkout"
                className="mt-6 flex min-h-12 w-full items-center justify-center rounded-xl bg-[#123653] px-5 text-sm font-bold text-white transition hover:bg-cyan-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              >
                Continue to checkout
              </Link>
            ) : (
              <button
                type="button"
                disabled
                aria-describedby="checkout-unavailable-reason"
                className="mt-6 flex min-h-12 w-full cursor-not-allowed items-center justify-center rounded-xl bg-slate-200 px-5 text-sm font-bold text-slate-500"
              >
                Continue to checkout
              </button>
            )}
            {availableItems.length === 0 ? (
              <p id="checkout-unavailable-reason" className="mt-2 text-xs leading-5 text-slate-600">
                Checkout becomes available when your cart contains an available product.
              </p>
            ) : null}
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
              <span aria-hidden="true">●</span>
              <span>Order details are checked again before placement</span>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
