export const BANK_PROVIDERS = [
  {
    id: "national_bank",
    name: "National Bank of Malawi",
    accountNumber: "1014334986",
    accountHolder: "Classic Computers LLC",
    branch: "Henderson Street",
  },
  {
    id: "fdh_bank",
    name: "FDH Bank",
    accountNumber: "1850105867244",
    accountHolder: "Classic Computers LLC",
    branch: "Umoyo House Branch",
  },
  {
    id: "standard_bank",
    name: "Standard Bank",
    accountNumber: "9100007675396",
    accountHolder: "Classic Computers LLC",
    branch: "Blantyre Branch",
  },
  {
    id: "first_capital_bank",
    name: "First Capital Bank",
    accountNumber: "0003704009856",
    accountHolder: "Classic Computers LLC",
    branch: "Blantyre Branch",
  },
] as const;

export const MOBILE_MONEY_PROVIDERS = [
  {
    id: "airtel_money",
    name: "Airtel Money",
    walletNumber: "1000736",
    accountHolder: "Hammad Blam",
  },
  {
    id: "tnm_mpamba",
    name: "TNM Mpamba",
    walletNumber: "481094",
    accountHolder: "Hammad Blam",
  },
] as const;

export type BankProviderId = (typeof BANK_PROVIDERS)[number]["id"];
export type MobileMoneyProviderId = (typeof MOBILE_MONEY_PROVIDERS)[number]["id"];
export type ManualPaymentProviderId = BankProviderId | MobileMoneyProviderId;
export type ManualPaymentMethod = "bank_transfer" | "mobile_money";

const isBankProvider = (id: string): id is BankProviderId =>
  BANK_PROVIDERS.some((provider) => provider.id === id);

const isMobileMoneyProvider = (id: string): id is MobileMoneyProviderId =>
  MOBILE_MONEY_PROVIDERS.some((provider) => provider.id === id);

export function getManualPaymentProvider(
  method: string,
  providerId: string,
): (typeof BANK_PROVIDERS)[number] | (typeof MOBILE_MONEY_PROVIDERS)[number] | null {
  if (method === "bank_transfer" && isBankProvider(providerId)) {
    return BANK_PROVIDERS.find((provider) => provider.id === providerId) ?? null;
  }
  if (method === "mobile_money" && isMobileMoneyProvider(providerId)) {
    return MOBILE_MONEY_PROVIDERS.find((provider) => provider.id === providerId) ?? null;
  }
  return null;
}

const SELECTION_MARKER = /^\[CC_PAYMENT_SELECTION_V1:(bank_transfer|mobile_money):([a-z_]+)\]$/;

export function appendManualPaymentSelection(
  notes: string | null,
  method: ManualPaymentMethod,
  providerId: ManualPaymentProviderId,
  reference?: string,
): string {
  const provider = getManualPaymentProvider(method, providerId);
  if (!provider) {
    throw new Error("Invalid manual payment provider selection.");
  }

  const entries = [
    notes?.trim() || null,
    reference ? `Payment transaction reference supplied by customer: ${reference.trim()}` : null,
    `[CC_PAYMENT_SELECTION_V1:${method}:${provider.id}]`,
  ].filter((entry): entry is string => Boolean(entry));

  return entries.join("\n");
}

export function getManualPaymentProviderFromNotes(
  method: string,
  notes: string | null,
): (typeof BANK_PROVIDERS)[number] | (typeof MOBILE_MONEY_PROVIDERS)[number] | null {
  if (!notes) return null;
  const lines = notes.trim().split(/\r?\n/);
  const lastLine = lines[lines.length - 1];
  if (!lastLine) return null;
  const match = SELECTION_MARKER.exec(lastLine);
  if (!match || match[1] !== method || !match[2]) return null;
  return getManualPaymentProvider(method, match[2]);
}
