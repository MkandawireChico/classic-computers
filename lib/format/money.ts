/**
 * All prices in the database are numeric(12,2) MWK amounts. This is the
 * single place that turns them into display strings — no component should
 * hand-roll its own currency formatting.
 */
export function formatMoney(amount: number | string): string {
  const value = typeof amount === "string" ? Number(amount) : amount;
  return new Intl.NumberFormat("en-MW", {
    style: "currency",
    currency: "MWK",
    maximumFractionDigits: 0,
  }).format(value);
}
