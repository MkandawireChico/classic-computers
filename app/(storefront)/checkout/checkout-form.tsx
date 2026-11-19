"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
  pay_at_shop: "border-cyan-300 bg-cyan-50 text-cyan-900",
  bank_transfer: "border-cyan-300 bg-cyan-50 text-cyan-900",
  mobile_money: "border-rose-300 bg-rose-50 text-rose-900",
  cash_on_delivery: "border-amber-300 bg-amber-50 text-amber-950",
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

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
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

      if (result.success) {
        trackInterestEvent({ name: "order_placed" });
        for (const productId of result.productIds) {
          trackInterestEvent({ name: "order_product_placed", productId });
        }
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
    <form action={handleSubmit} className="space-y-6 sm:space-y-8">
      {error ? <Alert variant="danger">{error}</Alert> : null}

      <div className="rounded-3xl border-2 border-amber-200 bg-gradient-to-r from-amber-50 via-white to-amber-50/50 p-6 shadow-lg shadow-amber-900/5 sm:p-8">
        <p className="text-lg font-extrabold text-slate-900 sm:text-xl">
          <span className="text-cyan-800">
            {itemCount} item{itemCount === 1 ? "" : "s"}
          </span>
          <span className="mx-2 text-amber-600" aria-hidden="true">
            ·
          </span>
          subtotal {formatMoney(subtotal)}
        </p>
        <p className="mt-2 text-base leading-relaxed text-slate-600 sm:text-lg">
          Discounts (if applicable) and the final total are calculated when your order is placed.
        </p>
      </div>

      {!isAuthenticated ? (
        <fieldset className="space-y-5 rounded-3xl border-2 border-cyan-200 bg-gradient-to-br from-cyan-50/50 via-white to-cyan-50/30 p-6 shadow-lg shadow-cyan-900/5 sm:p-8">
          <legend className="px-3 text-lg font-extrabold text-cyan-900">Your details</legend>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="guestName" className="text-sm font-bold text-slate-700">
                Full name
              </label>
              <input
                id="guestName"
                name="guestName"
                required
                className="w-full rounded-2xl border-2 border-cyan-200 bg-white px-4 py-3 text-sm font-medium transition-all focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-100"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="guestPhone" className="text-sm font-bold text-slate-700">
                Phone
              </label>
              <input
                id="guestPhone"
                name="guestPhone"
                required
                className="w-full rounded-2xl border-2 border-cyan-200 bg-white px-4 py-3 text-sm font-medium transition-all focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-100"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label htmlFor="guestEmail" className="text-sm font-bold text-slate-700">
                Email (optional)
              </label>
              <input
                id="guestEmail"
                name="guestEmail"
                type="email"
                className="w-full rounded-2xl border-2 border-cyan-200 bg-white px-4 py-3 text-sm font-medium transition-all focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-100"
              />
            </div>
          </div>
        </fieldset>
      ) : (
        <p className="rounded-3xl border-2 border-cyan-200 bg-gradient-to-r from-cyan-50/50 to-white p-6 text-base text-slate-700 shadow-lg shadow-cyan-900/5 sm:p-8">
          Ordering as <span className="font-extrabold text-cyan-900">{userEmail}</span>
        </p>
      )}

      <fieldset className="space-y-4 rounded-3xl border-2 border-cyan-200 bg-gradient-to-br from-cyan-50/50 via-white to-cyan-50/30 p-6 shadow-lg shadow-cyan-900/5 sm:p-8">
        <legend className="px-3 text-lg font-extrabold text-cyan-900">Fulfillment</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <label
            className={`flex min-h-14 cursor-pointer items-center gap-4 rounded-2xl border-2 px-5 py-4 text-sm font-bold transition-all duration-300 ${fulfillmentType === "pickup" ? "border-cyan-500 bg-cyan-50 text-cyan-950 shadow-md shadow-cyan-900/10" : "border-slate-200 bg-white text-slate-700 hover:border-cyan-300 hover:shadow-md"}`}
          >
            <input
              type="radio"
              name="fulfillmentTypeChoice"
              checked={fulfillmentType === "pickup"}
              onChange={() => setFulfillmentType("pickup")}
              className="h-5 w-5 accent-cyan-700 focus:ring-cyan-500"
            />
            Pickup in-store
          </label>
          <label
            className={`flex min-h-14 cursor-pointer items-center gap-4 rounded-2xl border-2 px-5 py-4 text-sm font-bold transition-all duration-300 ${fulfillmentType === "delivery" ? "border-cyan-500 bg-cyan-50 text-cyan-950 shadow-md shadow-cyan-900/10" : "border-slate-200 bg-white text-slate-700 hover:border-cyan-300 hover:shadow-md"}`}
          >
            <input
              type="radio"
              name="fulfillmentTypeChoice"
              checked={fulfillmentType === "delivery"}
              onChange={() => setFulfillmentType("delivery")}
              className="h-5 w-5 accent-cyan-700 focus:ring-cyan-500"
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
                  className="w-full rounded-2xl border-2 border-cyan-200 bg-white px-4 py-3 text-sm font-medium transition-all focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-100"
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
                  required
                  className="w-full rounded-2xl border-2 border-cyan-200 bg-white px-4 py-3 text-sm font-medium transition-all focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-100"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="guestDeliveryLine2" className="text-sm font-bold text-slate-700">
                  Address line 2 (optional)
                </label>
                <input
                  id="guestDeliveryLine2"
                  name="guestDeliveryLine2"
                  className="w-full rounded-2xl border-2 border-cyan-200 bg-white px-4 py-3 text-sm font-medium transition-all focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-100"
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
                    required
                    className="w-full rounded-2xl border-2 border-cyan-200 bg-white px-4 py-3 text-sm font-medium transition-all focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-100"
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
                    className="w-full rounded-2xl border-2 border-cyan-200 bg-white px-4 py-3 text-sm font-medium transition-all focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-100"
                  />
                </div>
              </div>
            </div>
          )
        ) : null}
      </fieldset>

      <fieldset className="space-y-5 rounded-3xl border-2 border-amber-200 bg-gradient-to-br from-amber-50/50 via-white to-amber-50/30 p-6 shadow-lg shadow-amber-900/5 sm:p-8">
        <legend className="px-3 text-lg font-extrabold text-amber-900">Payment method</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          {enabledMethods.map((method) => (
            <label
              key={method}
              className={`flex min-h-[100px] cursor-pointer items-start gap-4 rounded-2xl border-2 p-5 transition-all duration-300 focus-within:ring-4 focus-within:ring-amber-500 focus-within:ring-offset-2 ${
                selectedMethod === method
                  ? PAYMENT_ACCENTS[method] + " shadow-lg shadow-slate-900/5 hover:-translate-y-0.5"
                  : "border-slate-200 bg-white text-slate-800 hover:border-amber-300 hover:shadow-md"
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
                  trackInterestEvent({ name: "payment_method_selected", paymentMethod: method });
                }}
                required
                className="mt-1 h-5 w-5 shrink-0 accent-amber-700 focus:ring-amber-500"
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

      <div className="space-y-2 rounded-3xl border-2 border-rose-200 bg-gradient-to-br from-rose-50/50 via-white to-rose-50/30 p-6 shadow-lg shadow-rose-900/5 sm:p-8">
        <label htmlFor="notes" className="text-sm font-bold text-rose-900">
          Order notes (optional)
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          className="w-full rounded-2xl border-2 border-rose-200 bg-white px-4 py-3 text-sm font-medium transition-all focus:border-rose-500 focus:outline-none focus:ring-4 focus:ring-rose-100"
        />
      </div>

      <Button
        type="submit"
        isLoading={isPending}
        disabled={
          ((selectedMethod === "bank_transfer" || selectedMethod === "mobile_money") &&
            !selectedProvider) ||
          (fulfillmentType === "delivery" && isAuthenticated && addresses.length === 0)
        }
        className="min-h-14 w-full rounded-2xl bg-cyan-700 px-8 py-4 text-lg font-extrabold text-white shadow-xl shadow-cyan-900/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-cyan-800 hover:shadow-2xl"
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
      ? "border-cyan-300 bg-gradient-to-br from-cyan-50/80 to-white"
      : "border-rose-300 bg-gradient-to-br from-rose-50/80 to-white";

  return (
    <div className={`space-y-5 rounded-3xl border-2 p-6 shadow-lg ${styles} sm:p-7`}>
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
      ? "border-cyan-500 bg-white text-cyan-950 ring-2 ring-cyan-200 shadow-md shadow-cyan-900/10"
      : "border-rose-500 bg-white text-rose-950 ring-2 ring-rose-200 shadow-md shadow-rose-900/10";

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`flex min-h-16 items-center justify-between gap-4 rounded-2xl border-2 px-5 py-4 text-left text-sm font-bold transition-all duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-700 focus-visible:ring-offset-2 ${
        selected
          ? selectedStyle + " hover:-translate-y-0.5"
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
        <span className="text-xs font-extrabold uppercase tracking-wider text-cyan-700">
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
    <div className="space-y-4 rounded-2xl border border-cyan-200 bg-white p-4 sm:p-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-cyan-800">
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
      <p className="rounded-xl bg-cyan-50 p-3 text-sm leading-relaxed text-cyan-950">
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
          className="w-full rounded-xl border border-cyan-200 bg-white px-3 py-2.5 text-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-100"
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
    <div className="space-y-4 rounded-2xl border border-rose-200 bg-white p-4 sm:p-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-rose-800">
          Mobile-money details
        </p>
        <h4 className="mt-1 text-lg font-extrabold text-slate-900">{provider.name}</h4>
      </div>
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <PaymentDetail label="Wallet number" value={provider.walletNumber} />
        <PaymentDetail label="Account holder" value={provider.accountHolder} />
        <PaymentDetail label="Current cart subtotal" value={formatMoney(subtotal)} />
      </dl>
      <p className="rounded-xl bg-rose-50 p-3 text-sm leading-relaxed text-rose-950">
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
          className="w-full rounded-xl border border-rose-200 bg-white px-3 py-2.5 text-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-100"
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
