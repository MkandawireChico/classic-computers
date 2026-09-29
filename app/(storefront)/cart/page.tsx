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
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold text-gray-900">Your cart is empty</h1>
        <p className="mt-2 text-gray-600">Browse the shop to find something for your setup.</p>
        <Link
          href="/shop"
          className="mt-6 inline-flex h-11 items-center rounded-card bg-brand-500 px-6 text-sm font-semibold text-white hover:bg-brand-600"
        >
          Go to shop
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-gray-900">Your Cart</h1>

      <div className="mt-6 divide-y divide-surface-border rounded-card border border-surface-border">
        {availableItems.map((item) => (
          <div key={item.cartItemId} className="flex items-center gap-4 p-4">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-card bg-surface-muted">
              {item.imagePath ? (
                <Image
                  src={getPublicStorageUrl("product-images", item.imagePath)}
                  alt={item.imageAlt ?? item.productName}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              ) : null}
            </div>
            <div className="flex-1">
              <Link href={`/product/${item.productSlug}`} className="text-sm font-medium text-gray-900 hover:underline">
                {item.productName}
              </Link>
              {item.variantName ? <p className="text-xs text-gray-500">{item.variantName}</p> : null}
              <p className="mt-1 text-sm font-semibold text-gray-900">{formatMoney(item.unitPrice)}</p>
            </div>
            <CartItemControls cartItemId={item.cartItemId} quantity={item.quantity} />
          </div>
        ))}

        {unavailableItems.map((item) => (
          <div key={item.cartItemId} className="flex items-center gap-4 bg-surface-muted p-4 opacity-75">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700">{item.productName}</p>
              <p className="text-xs text-status-danger">No longer available — removed from your total</p>
            </div>
            <CartItemControls cartItemId={item.cartItemId} quantity={item.quantity} />
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between rounded-card border border-surface-border bg-surface p-4">
        <span className="text-sm font-medium text-gray-700">Subtotal</span>
        <span className="text-lg font-bold text-gray-900">{formatMoney(cart.subtotal)}</span>
      </div>
      <p className="mt-1 text-xs text-gray-500">
        Final total, including any applicable discounts, is calculated at checkout.
      </p>

      <div className="mt-6 flex justify-end">
        <Link
          href="/checkout"
          className={`inline-flex h-11 items-center rounded-card px-6 text-sm font-semibold text-white ${
            availableItems.length === 0
              ? "pointer-events-none bg-gray-300"
              : "bg-brand-500 hover:bg-brand-600"
          }`}
          aria-disabled={availableItems.length === 0}
        >
          Proceed to checkout
        </Link>
      </div>
    </div>
  );
}
