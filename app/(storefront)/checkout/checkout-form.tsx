"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { formatMoney } from "@/lib/format/money";
import { submitCheckoutAction } from "./actions";
import type { AddressRecord } from "@/lib/services/addresses";
import type { PaymentMethodsSetting } from "@/lib/data/site-settings";
import {
  BANK_PROVIDERS,
  MOBILE_MONEY_PROVIDERS,
  type BankProviderId,
  type ManualPaymentProviderId,
  type MobileMoneyProviderId,
} from "@/lib/payments/manual-payment";
import { CopyPaymentValue } from "@/components/storefront/copy-payment-value";
import { trackInterestEvent } from "@/lib/client/customer-interest-analytics";

const PAYMENT_PROVIDER_LOGOS: Record<ManualPaymentProviderId, string> = {
  national_bank: "/payment-providers/national-bank-malawi.png",
  fdh_bank: "/payment-providers/fdh-bank.webp",
  standard_bank: "/payment-providers/standard-bank-malawi.png",
  first_capital_bank: "/payment-providers/first-capital-bank.jpg",
  airtel_money: "/payment-providers/airtel-money.png",
  tnm_mpamba: "/payment-providers/tnm-mpamba.png",
};

const PAYMENT_LABELS = {
  pay_at_shop: "Pay at shop",
  bank_transfer: "Bank transfer",
  mobile_money: "Mobile money",
  cash_on_delivery: "Cash on delivery",
} as const;
type PaymentMethod = keyof typeof PAYMENT_LABELS;

const PAYMENT_DESCRIPTIONS: Record<PaymentMethod, string> = {
  pay_at_shop: "Pay in person at our shop.",
  bank_transfer: "Choose a bank and transfer to our account.",
  mobile_money: "Choose Airtel Money or TNM Mpamba.",
  cash_on_delivery: "Pay when your order is delivered.",
};

const PAYMENT_ACCENTS: Record<PaymentMethod, string> = {
  pay_at_shop: "border-brand-300 bg-brand-50 text-brand-950",
  bank_transfer: "border-brand-300 bg-brand-50 text-brand-950",
  mobile_money: "border-brand-300 bg-brand-50 text-brand-950",
  cash_on_delivery: "border-brand-300 bg-brand-50 text-brand-950",
};

export function CheckoutForm({
  isAuthenticated,
  userEmail,
  subtotal,
  addresses,
  paymentMethods,
}: {
  isAuthenticated: boolean;
  userEmail: string | null;
  subtotal: number;
  addresses: AddressRecord[];
  paymentMethods: PaymentMethodsSetting;
}) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fulfillmentType, setFulfillmentType] = useState<"pickup" | "delivery">("pickup");
  const defaultAddressId = addresses.find((a) => a.is_default)?.id ?? addresses[0]?.id;
  const enabledMethods = (Object.keys(PAYMENT_LABELS) as PaymentMethod[]).filter(
    (key) => paymentMethods[key as keyof PaymentMethodsSetting],
  );
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(
    enabledMethods[0] ?? "pay_at_shop",
  );
  const [selectedProvider, setSelectedProvider] = useState<
    BankProviderId | MobileMoneyProviderId | null
  >(null);
  const selectedBank = BANK_PROVIDERS.find((bank) => bank.id === selectedProvider);
  const selectedMobileProvider = MOBILE_MONEY_PROVIDERS.find(
    (provider) => provider.id === selectedProvider,
  );

  async function handleSubmit(formData: FormData) {
    if (isPending) return;
    setError(null);
    setIsPending(true);
    try {
        const result = await submitCheckoutAction({
          fulfillmentType,
          paymentMethod: formData.get("paymentMethod")?.toString(),
          paymentProvider: selectedProvider ?? undefined,
          paymentReference: formData.get("paymentReference")?.toString() || undefined,
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

        if (!result.success) {
          setError(result.error);
          return;
        }

        // Analytics must never prevent a successfully created order from
        // reaching its confirmation page.
        try {
          trackInterestEvent({ name: "order_placed" });
          for (const productId of result.productIds) {
            trackInterestEvent({ name: "order_product_placed", productId });
          }
        } catch (analyticsError) {
          console.warn("Order analytics could not be recorded:", analyticsError);
        }
        router.push(`/checkout/confirmation/${result.orderNumber}`);
    } catch (checkoutError) {
      console.error("Checkout submission failed:", checkoutError);
      setError("We could not submit your order. Please check your connection and try again. If you were charged or received an order number, contact us before placing another order.");
    } finally {
      setIsPending(false);
    }
  }

  if (enabledMethods.length === 0) {
    return (
      <Alert variant="warning" className="mt-6">
        No payment methods are currently configured. Please contact us to place an order.
      </Alert>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-6 sm:space-y-8">
      {error ? (
        <Alert variant="danger">
          {error}
          {error.startsWith("Stock changed while you were checking out") || error.startsWith("One or more items no longer have enough stock") ? (
            <Link href="/cart" className="ml-1 font-bold underline underline-offset-2">Review your cart</Link>
          ) : null}
        </Alert>
      ) : null}

      {!isAuthenticated ? (
        <fieldset className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
          <legend className="px-3 text-lg font-extrabold text-navy-950">Your details</legend>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="guestName" className="text-sm font-bold text-slate-700">
                Full name
              </label>
              <input
                id="guestName"
                name="guestName"
                maxLength={120}
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="guestPhone" className="text-sm font-bold text-slate-700">
                Phone
              </label>
              <input
                id="guestPhone"
                name="guestPhone"
                maxLength={30}
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label htmlFor="guestEmail" className="text-sm font-bold text-slate-700">
                Email (optional)
              </label>
              <input
                id="guestEmail"
                name="guestEmail"
                maxLength={254}
                type="email"
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </div>
          </div>
        </fieldset>
      ) : (
        <p className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-700">
          Ordering as <span className="font-extrabold text-navy-950">{userEmail}</span>
        </p>
      )}

      <fieldset className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <legend className="px-3 text-lg font-extrabold text-navy-950">Fulfillment</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <label
            className={`flex min-h-14 cursor-pointer items-center gap-4 rounded-xl border px-5 py-4 text-sm font-bold transition-all duration-300 ${fulfillmentType === "pickup" ? "border-brand-500 bg-brand-50 text-brand-950" : "border-slate-200 bg-white text-slate-700 hover:border-brand-300"}`}
          >
            <input
              type="radio"
              name="fulfillmentTypeChoice"
              checked={fulfillmentType === "pickup"}
              onChange={() => setFulfillmentType("pickup")}
              className="h-5 w-5 accent-brand-700 focus:ring-brand-500"
            />
            Pickup in-store
          </label>
          <label
            className={`flex min-h-14 cursor-pointer items-center gap-4 rounded-xl border px-5 py-4 text-sm font-bold transition-all duration-300 ${fulfillmentType === "delivery" ? "border-brand-500 bg-brand-50 text-brand-950" : "border-slate-200 bg-white text-slate-700 hover:border-brand-300"}`}
          >
            <input
              type="radio"
              name="fulfillmentTypeChoice"
              checked={fulfillmentType === "delivery"}
              onChange={() => setFulfillmentType("delivery")}
              className="h-5 w-5 accent-brand-700 focus:ring-brand-500"
            />
            Delivery
          </label>
        </div>

        {fulfillmentType === "delivery" ? (
          isAuthenticated ? (
            addresses.length > 0 ? (
              <div className="space-y-2">
                <label htmlFor="deliveryAddressId" className="text-sm font-bold text-slate-700">
                  Delivery address
                </label>
                <select
                  id="deliveryAddressId"
                  name="deliveryAddressId"
                  defaultValue={defaultAddressId}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
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
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="guestDeliveryLine1" className="text-sm font-bold text-slate-700">
                  Address line 1
                </label>
                <input
                  id="guestDeliveryLine1"
                  name="guestDeliveryLine1"
                  maxLength={200}
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="guestDeliveryLine2" className="text-sm font-bold text-slate-700">
                  Address line 2 (optional)
                </label>
                <input
                  id="guestDeliveryLine2"
                  name="guestDeliveryLine2"
                  maxLength={200}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="guestDeliveryCity" className="text-sm font-bold text-slate-700">
                    City
                  </label>
                  <input
                    id="guestDeliveryCity"
                    name="guestDeliveryCity"
                    maxLength={100}
                    required
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="guestDeliveryDistrict"
                    className="text-sm font-bold text-slate-700"
                  >
                    District (optional)
                  </label>
                  <input
                    id="guestDeliveryDistrict"
                    name="guestDeliveryDistrict"
                    maxLength={100}
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                  />
                </div>
              </div>
            </div>
          )
        ) : null}
      </fieldset>

      <fieldset className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <legend className="px-3 text-lg font-extrabold text-navy-950">Payment method</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          {enabledMethods.map((method) => (
            <label
              key={method}
              className={`flex min-h-[100px] cursor-pointer items-start gap-4 rounded-2xl border p-4 transition-colors focus-within:ring-2 focus-within:ring-brand-500 focus-within:ring-offset-2 ${
                selectedMethod === method
                  ? PAYMENT_ACCENTS[method] + " shadow-sm"
                  : "border-slate-200 bg-white text-slate-800 hover:border-brand-300"
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={method}
                checked={selectedMethod === method}
                onChange={() => {
                  setSelectedMethod(method);
                  setSelectedProvider(null);
                  try {
                    trackInterestEvent({ name: "payment_method_selected", paymentMethod: method });
                  } catch (analyticsError) {
                    console.warn("Payment-method analytics could not be recorded:", analyticsError);
                  }
                }}
                required
                className="mt-1 h-5 w-5 shrink-0 accent-brand-700 focus:ring-brand-500"
              />
              <span>
                <span className="block text-base font-extrabold">{PAYMENT_LABELS[method]}</span>
                <span className="mt-1 block text-sm leading-relaxed text-slate-600">
                  {PAYMENT_DESCRIPTIONS[method]}
                </span>
              </span>
            </label>
          ))}
        </div>

        {selectedMethod === "bank_transfer" ? (
          <ProviderPanel title="Choose a bank" accent="emerald">
            <div className="grid gap-3 sm:grid-cols-2">
              {BANK_PROVIDERS.map((bank) => (
                <ProviderChoice
                  key={bank.id}
                  name={bank.name}
                  logo={PAYMENT_PROVIDER_LOGOS[bank.id]}
                  selected={selectedProvider === bank.id}
                  onClick={() => setSelectedProvider(bank.id)}
                  accent="emerald"
                />
              ))}
            </div>
            {selectedBank ? (
              <BankDetails provider={selectedBank} subtotal={subtotal} key={selectedProvider} />
            ) : (
              <p className="text-base text-slate-600">
                Select a bank to view its account details and transfer instructions.
              </p>
            )}
          </ProviderPanel>
        ) : null}

        {selectedMethod === "mobile_money" ? (
          <ProviderPanel title="Choose a mobile-money provider" accent="rose">
            <div className="grid gap-3 sm:grid-cols-2">
              {MOBILE_MONEY_PROVIDERS.map((provider) => (
                <ProviderChoice
                  key={provider.id}
                  name={provider.name}
                  logo={PAYMENT_PROVIDER_LOGOS[provider.id]}
                  selected={selectedProvider === provider.id}
                  onClick={() => setSelectedProvider(provider.id)}
                  accent="rose"
                />
              ))}
            </div>
            {selectedMobileProvider ? (
              <MobileMoneyDetails
                provider={selectedMobileProvider}
                subtotal={subtotal}
                key={selectedProvider}
              />
            ) : (
              <p className="text-base text-slate-600">
                Select a provider to view the correct wallet details and instructions.
              </p>
            )}
          </ProviderPanel>
        ) : null}
      </fieldset>

      {enabledMethods.length === 0 ? (
        <Alert variant="warning">
          No payment methods are currently available. Please <Link href="/contact" className="font-bold underline">contact Classic Computers</Link> before placing your order.
        </Alert>
      ) : null}

      <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <label htmlFor="notes" className="text-sm font-bold text-navy-950">
          Order notes (optional)
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
      </div>

      <Button
        type="submit"
        isLoading={isPending}
        disabled={
          isPending ||
          enabledMethods.length === 0 ||
          ((selectedMethod === "bank_transfer" || selectedMethod === "mobile_money") &&
            !selectedProvider) ||
          (fulfillmentType === "delivery" && isAuthenticated && addresses.length === 0)
        }
        className="min-h-14 w-full rounded-2xl bg-[#123653] px-8 py-4 text-base font-extrabold text-white shadow-sm transition-colors hover:bg-brand-800"
      >
        Place order
      </Button>
    </form>
  );
}

function ProviderPanel({
  title,
  accent,
  children,
}: {
  title: string;
  accent: "emerald" | "rose";
  children: React.ReactNode;
}) {
  const styles =
    accent === "emerald"
      ? "border-slate-200 bg-white"
      : "border-slate-200 bg-white";

  return (
    <div className={`space-y-5 rounded-xl border p-5 ${styles} sm:p-7`}>
      <h3 className="text-base font-extrabold text-slate-900">{title}</h3>
      {children}
    </div>
  );
}

function ProviderChoice({
  name,
  logo,
  selected,
  onClick,
  accent,
}: {
  name: string;
  logo: string;
  selected: boolean;
  onClick: () => void;
  accent: "emerald" | "rose";
}) {
  const selectedStyle =
    accent === "emerald"
      ? "border-brand-500 bg-brand-50 text-brand-950 ring-1 ring-brand-200"
      : "border-brand-500 bg-brand-50 text-brand-950 ring-1 ring-brand-200";

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`flex min-h-16 items-center justify-between gap-4 rounded-xl border px-5 py-4 text-left text-sm font-bold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${
        selected
          ? selectedStyle + " hover:border-brand-300"
          : "border-slate-200 bg-white/90 text-slate-800 hover:border-slate-300 hover:shadow-md"
      }`}
    >
      <span className="flex min-w-0 items-center gap-3">
        <span className="relative flex h-12 w-20 shrink-0 items-center justify-center rounded-xl bg-white p-2">
          <Image src={logo} alt="" fill sizes="80px" className="object-contain p-2" />
        </span>
        <span className="min-w-0">{name}</span>
      </span>
      {selected ? (
        <span className="text-xs font-extrabold uppercase tracking-wider text-brand-800">
          Selected
        </span>
      ) : null}
    </button>
  );
}

function BankDetails({
  provider,
  subtotal,
}: {
  provider: (typeof BANK_PROVIDERS)[number];
  subtotal: number;
}) {
  const paymentDetails = [
    provider.name,
    `Account holder: ${provider.accountHolder}`,
    `Account number: ${provider.accountNumber}`,
    `Branch: ${provider.branch}`,
    `Current cart subtotal: ${formatMoney(subtotal)}`,
  ].join("\n");

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-800">
          Bank transfer details
        </p>
        <h4 className="mt-1 text-lg font-extrabold text-slate-900">{provider.name}</h4>
      </div>
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <PaymentDetail label="Account holder" value={provider.accountHolder} />
        <PaymentDetail label="Account number" value={provider.accountNumber} />
        <PaymentDetail label="Branch" value={provider.branch} />
        <PaymentDetail label="Current cart subtotal" value={formatMoney(subtotal)} />
      </dl>
      <p className="rounded-xl bg-brand-50 p-3 text-sm leading-relaxed text-brand-950">
        Place your order first. Then transfer the exact final total shown on the order confirmation
        and keep your bank transaction reference. Your order remains unpaid until the transfer is
        verified.
      </p>
      <div className="flex flex-wrap gap-2">
        <CopyPaymentValue value={provider.accountNumber} label="account number" />
        <CopyPaymentValue value={paymentDetails} label="payment details" />
      </div>
      <div className="space-y-1">
        <label htmlFor="paymentReference" className="text-sm font-semibold text-slate-700">
          Transaction reference (optional, if already transferred)
        </label>
        <input
          id="paymentReference"
          name="paymentReference"
          maxLength={120}
          autoComplete="off"
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
      </div>
    </div>
  );
}

function MobileMoneyDetails({
  provider,
  subtotal,
}: {
  provider: (typeof MOBILE_MONEY_PROVIDERS)[number];
  subtotal: number;
}) {
  const paymentDetails = [
    provider.name,
    `Wallet number: ${provider.walletNumber}`,
    `Account holder: ${provider.accountHolder}`,
    `Current cart subtotal: ${formatMoney(subtotal)}`,
  ].join("\n");

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-800">
          Mobile-money details
        </p>
        <h4 className="mt-1 text-lg font-extrabold text-slate-900">{provider.name}</h4>
      </div>
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <PaymentDetail label="Wallet number" value={provider.walletNumber} />
        <PaymentDetail label="Account holder" value={provider.accountHolder} />
        <PaymentDetail label="Current cart subtotal" value={formatMoney(subtotal)} />
      </dl>
      <p className="rounded-xl bg-brand-50 p-3 text-sm leading-relaxed text-brand-950">
        Place your order, then use your provider&apos;s normal transfer process to send the exact
        final total shown on the confirmation page. Keep your transaction ID. Your order remains
        unpaid until the payment is verified.
      </p>
      <div className="flex flex-wrap gap-2">
        <CopyPaymentValue value={provider.walletNumber} label="wallet number" />
        <CopyPaymentValue value={paymentDetails} label="payment details" />
      </div>
      <div className="space-y-1">
        <label htmlFor="paymentReference" className="text-sm font-semibold text-slate-700">
          Transaction ID (optional, if already transferred)
        </label>
        <input
          id="paymentReference"
          name="paymentReference"
          maxLength={120}
          autoComplete="off"
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
      </div>
    </div>
  );
}

function PaymentDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-lg bg-slate-50 p-3">
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd className="mt-1 break-words font-bold text-slate-900">{value}</dd>
    </div>
  );
}
