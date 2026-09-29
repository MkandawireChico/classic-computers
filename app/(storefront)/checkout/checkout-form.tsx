"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { formatMoney } from "@/lib/format/money";
import { submitCheckoutAction } from "./actions";
import type { AddressRecord } from "@/lib/services/addresses";
import type { PaymentMethodsSetting } from "@/lib/data/site-settings";

const PAYMENT_LABELS: Record<string, string> = {
  pay_at_shop: "Pay at shop",
  bank_transfer: "Bank transfer",
  mobile_money: "Mobile money",
  cash_on_delivery: "Cash on delivery",
};

export function CheckoutForm({
  isAuthenticated,
  userEmail,
  subtotal,
  itemCount,
  addresses,
  paymentMethods,
}: {
  isAuthenticated: boolean;
  userEmail: string | null;
  subtotal: number;
  itemCount: number;
  addresses: AddressRecord[];
  paymentMethods: PaymentMethodsSetting;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fulfillmentType, setFulfillmentType] = useState<"pickup" | "delivery">("pickup");
  const defaultAddressId = addresses.find((a) => a.is_default)?.id ?? addresses[0]?.id;

  const enabledMethods = (Object.keys(PAYMENT_LABELS) as Array<keyof typeof PAYMENT_LABELS>).filter(
    (key) => paymentMethods[key as keyof PaymentMethodsSetting],
  );

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await submitCheckoutAction({
        fulfillmentType,
        paymentMethod: formData.get("paymentMethod")?.toString(),
        notes: formData.get("notes")?.toString() || undefined,
        deliveryAddressId: formData.get("deliveryAddressId")?.toString() || undefined,
        guestName: formData.get("guestName")?.toString() || undefined,
        guestPhone: formData.get("guestPhone")?.toString() || undefined,
        guestEmail: formData.get("guestEmail")?.toString() || undefined,
        guestDeliveryLine1: formData.get("guestDeliveryLine1")?.toString() || undefined,
        guestDeliveryLine2: formData.get("guestDeliveryLine2")?.toString() || undefined,
        guestDeliveryCity: formData.get("guestDeliveryCity")?.toString() || undefined,
        guestDeliveryDistrict: formData.get("guestDeliveryDistrict")?.toString() || undefined,
      });

      if (result.success) {
        router.push(`/checkout/confirmation/${result.orderNumber}`);
      } else {
        setError(result.error);
      }
    });
  }

  if (enabledMethods.length === 0) {
    return (
      <Alert variant="warning" className="mt-6">
        No payment methods are currently configured. Please contact us to place an order.
      </Alert>
    );
  }

  return (
    <form action={handleSubmit} className="mt-6 space-y-6">
      {error ? <Alert variant="danger">{error}</Alert> : null}

      <div className="rounded-card border border-surface-border bg-surface p-4">
        <p className="text-sm text-gray-700">
          {itemCount} item{itemCount === 1 ? "" : "s"} — subtotal {formatMoney(subtotal)}
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Discounts (if applicable) and the final total are calculated when your order is placed.
        </p>
      </div>

      {!isAuthenticated ? (
        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold text-gray-900">Your details</legend>
          <div className="space-y-1">
            <label htmlFor="guestName" className="text-sm font-medium text-gray-700">
              Full name
            </label>
            <input
              id="guestName"
              name="guestName"
              required
              className="w-full rounded-card border border-surface-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="guestPhone" className="text-sm font-medium text-gray-700">
              Phone
            </label>
            <input
              id="guestPhone"
              name="guestPhone"
              required
              className="w-full rounded-card border border-surface-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="guestEmail" className="text-sm font-medium text-gray-700">
              Email (optional)
            </label>
            <input
              id="guestEmail"
              name="guestEmail"
              type="email"
              className="w-full rounded-card border border-surface-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </fieldset>
      ) : (
        <p className="text-sm text-gray-600">Ordering as {userEmail}</p>
      )}

      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold text-gray-900">Fulfillment</legend>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="radio"
              name="fulfillmentTypeChoice"
              checked={fulfillmentType === "pickup"}
              onChange={() => setFulfillmentType("pickup")}
              className="h-4 w-4 text-brand-500 focus:ring-brand-500"
            />
            Pickup in-store
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="radio"
              name="fulfillmentTypeChoice"
              checked={fulfillmentType === "delivery"}
              onChange={() => setFulfillmentType("delivery")}
              className="h-4 w-4 text-brand-500 focus:ring-brand-500"
            />
            Delivery
          </label>
        </div>

        {fulfillmentType === "delivery" ? (
          isAuthenticated ? (
            addresses.length > 0 ? (
              <div className="space-y-1">
                <label htmlFor="deliveryAddressId" className="text-sm font-medium text-gray-700">
                  Delivery address
                </label>
                <select
                  id="deliveryAddressId"
                  name="deliveryAddressId"
                  defaultValue={defaultAddressId}
                  className="w-full rounded-card border border-surface-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                >
                  {addresses.map((address) => (
                    <option key={address.id} value={address.id}>
                      {address.label ? `${address.label} — ` : ""}
                      {address.line1}, {address.city}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <Alert variant="warning">
                You have no saved addresses yet. Add one in{" "}
                <a href="/account/addresses" className="underline">
                  your account
                </a>{" "}
                first, or choose pickup instead.
              </Alert>
            )
          ) : (
            <div className="space-y-3">
              <div className="space-y-1">
                <label htmlFor="guestDeliveryLine1" className="text-sm font-medium text-gray-700">
                  Address line 1
                </label>
                <input
                  id="guestDeliveryLine1"
                  name="guestDeliveryLine1"
                  required
                  className="w-full rounded-card border border-surface-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="guestDeliveryLine2" className="text-sm font-medium text-gray-700">
                  Address line 2 (optional)
                </label>
                <input
                  id="guestDeliveryLine2"
                  name="guestDeliveryLine2"
                  className="w-full rounded-card border border-surface-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="guestDeliveryCity" className="text-sm font-medium text-gray-700">
                    City
                  </label>
                  <input
                    id="guestDeliveryCity"
                    name="guestDeliveryCity"
                    required
                    className="w-full rounded-card border border-surface-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="guestDeliveryDistrict" className="text-sm font-medium text-gray-700">
                    District (optional)
                  </label>
                  <input
                    id="guestDeliveryDistrict"
                    name="guestDeliveryDistrict"
                    className="w-full rounded-card border border-surface-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>
            </div>
          )
        ) : null}
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold text-gray-900">Payment method</legend>
        {enabledMethods.map((key, index) => (
          <label key={key} className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="radio"
              name="paymentMethod"
              value={key}
              defaultChecked={index === 0}
              required
              className="h-4 w-4 text-brand-500 focus:ring-brand-500"
            />
            {PAYMENT_LABELS[key]}
          </label>
        ))}
      </fieldset>

      <div className="space-y-1">
        <label htmlFor="notes" className="text-sm font-medium text-gray-700">
          Order notes (optional)
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={2}
          className="w-full rounded-card border border-surface-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </div>

      <Button type="submit" isLoading={isPending} className="w-full">
        Place order
      </Button>
    </form>
  );
}
