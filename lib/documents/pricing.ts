export type DocumentLineInput = {
  description: string;
  quantity: number;
  unitPrice: number;
};

export type DocumentPricingInput = {
  lines: DocumentLineInput[];
  discountAmount?: number;
  vatRate?: number;
  ppdaRate?: number;
};

export type DocumentPricing = {
  subtotal: number;
  discountAmount: number;
  taxableAmount: number;
  vatRate: number;
  vatAmount: number;
  ppdaRate: number;
  ppdaAmount: number;
  grandTotal: number;
};

const roundMoney = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

export function calculateDocumentPricing(input: DocumentPricingInput): DocumentPricing {
  if (!input.lines.length) throw new Error("Add at least one quotation line.");
  for (const line of input.lines) {
    if (!line.description.trim()) throw new Error("Every line needs a description.");
    if (!Number.isFinite(line.quantity) || line.quantity <= 0) throw new Error("Quantity must be greater than zero.");
    if (!Number.isFinite(line.unitPrice) || line.unitPrice < 0) throw new Error("Unit selling price cannot be negative.");
  }

  const subtotal = roundMoney(input.lines.reduce(
    (sum, line) => sum + line.quantity * line.unitPrice, 0,
  ));
  const discountAmount = roundMoney(input.discountAmount ?? 0);
  const vatRate = input.vatRate ?? 17.5;
  const ppdaRate = input.ppdaRate ?? 1;

  if (!Number.isFinite(discountAmount) || discountAmount < 0 || discountAmount > subtotal) {
    throw new Error("Discount must be between zero and the selling subtotal.");
  }
  if (![vatRate, ppdaRate].every((rate) => Number.isFinite(rate) && rate >= 0 && rate <= 100)) {
    throw new Error("Tax rates must be between zero and 100 percent.");
  }

  const taxableAmount = roundMoney(subtotal - discountAmount);
  const vatAmount = roundMoney(taxableAmount * vatRate / 100);
  const ppdaAmount = roundMoney(taxableAmount * ppdaRate / 100);
  const grandTotal = roundMoney(taxableAmount + vatAmount + ppdaAmount);

  return { subtotal, discountAmount, taxableAmount, vatRate, vatAmount, ppdaRate, ppdaAmount, grandTotal };
}
