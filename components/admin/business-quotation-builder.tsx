"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/format/money";
import { calculateDocumentPricing } from "@/lib/documents/pricing";
import { createBusinessQuotationAction } from "@/app/admin/documents/actions";

type Option = { id: string; label: string; description: string; unitPrice: number; sourceId?: string };
type Customer = { id: string; name: string; phone: string | null };
type Line = { description: string; quantity: number; unitPrice: number; optionId: string };

export function BusinessQuotationBuilder({ products, rentals, customers }: { products: Option[]; rentals: Option[]; customers: Customer[] }) {
  const router = useRouter();
  const [sourceType, setSourceType] = useState<"order" | "rental">("order");
  const [customerId, setCustomerId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [lines, setLines] = useState<Line[]>([{ description: "", quantity: 1, unitPrice: 0, optionId: "" }]);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountReason, setDiscountReason] = useState("");
  const [notes, setNotes] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const options = sourceType === "order" ? products : rentals;
  const sourceId = sourceType === "rental" ? lines.map((line) => options.find((option) => option.id === line.optionId)?.sourceId).find(Boolean) : undefined;
  const totals = useMemo(() => {
    try {
      return calculateDocumentPricing({ lines, discountAmount, vatRate: 17.5, ppdaRate: 1 });
    } catch {
      return null;
    }
  }, [lines, discountAmount]);

  function updateLine(index: number, patch: Partial<Line>) {
    setLines((current) => current.map((line, i) => i === index ? { ...line, ...patch } : line));
  }

  function chooseCustomer(id: string) {
    setCustomerId(id);
    const customer = customers.find((item) => item.id === id);
    if (customer) {
      setCustomerName(customer.name);
      setCustomerPhone(customer.phone ?? "");
    }
  }

  function chooseOption(index: number, optionId: string) {
    const option = options.find((item) => item.id === optionId);
    updateLine(index, option
      ? { optionId, description: option.description, unitPrice: option.unitPrice }
      : { optionId: "", description: "", unitPrice: 0 });
  }

  function issue() {
    setError(null);
    startTransition(async () => {
      try {
        const result = await createBusinessQuotationAction({
          sourceType, ...(sourceId ? { sourceId } : {}),
          ...(customerId ? { customerId } : {}),
          customerName, customerEmail, customerPhone, billingAddress,
          lines: lines.map(({ description, quantity, unitPrice }) => ({ description, quantity, unitPrice })),
          discountAmount, discountReason, notes,
          ...(validUntil ? { validUntil } : {}),
        });
        if (!result.success) {
          setError(result.error);
          return;
        }
        if (result.documentId) router.push(`/admin/documents/${result.documentId}`);
      } catch {
        setError("The quotation could not be created. Refresh and try again.");
      }
    });
  }

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="font-bold text-slate-950">Quotation type</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button type="button" size="sm" variant={sourceType === "order" ? "primary" : "outline"} onClick={() => { setSourceType("order"); setLines([{ description: "", quantity: 1, unitPrice: 0, optionId: "" }]); }}>Product sales</Button>
          <Button type="button" size="sm" variant={sourceType === "rental" ? "primary" : "outline"} onClick={() => { setSourceType("rental"); setLines([{ description: "", quantity: 1, unitPrice: 0, optionId: "" }]); }}>Equipment rental</Button>
        </div>
        <p className="mt-2 text-xs text-slate-500">Catalogue prices and rental rates are VAT-exclusive. Tax is added below.</p>
      </section>

      <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="font-bold text-slate-950">Customer details</h2>
        {customers.length ? <label className="block text-xs font-semibold text-slate-600">Registered customer (optional)
          <select value={customerId} onChange={(e) => chooseCustomer(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
            <option value="">Guest / enter customer manually</option>
            {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}{customer.phone ? ` · ${customer.phone}` : ""}</option>)}
          </select>
        </label> : null}
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-xs font-semibold text-slate-600">Customer / organisation<input value={customerName} onChange={(e) => setCustomerName(e.target.value)} maxLength={160} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></label>
          <label className="text-xs font-semibold text-slate-600">Phone<input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} maxLength={40} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></label>
          <label className="text-xs font-semibold text-slate-600">Email<input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} maxLength={254} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></label>
          <label className="text-xs font-semibold text-slate-600">Billing address<input value={billingAddress} onChange={(e) => setBillingAddress(e.target.value)} maxLength={500} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></label>
        </div>
        {customerId ? <p className="text-xs text-emerald-700">This quotation will appear in the customer's account for online approval.</p> : <p className="text-xs text-slate-500">For guest customers, staff will record approval received by phone or in person.</p>}
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div><h2 className="font-bold text-slate-950">Items and selling prices</h2><p className="mt-1 text-xs text-slate-500">{sourceType === "order" ? "Choose products from the published catalogue or enter a custom line." : "Choose a rental product and rate period, or enter a custom rental line."}</p></div>
        {lines.map((line, index) => (
          <div key={index} className="space-y-2 rounded-xl border border-slate-200 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Line {index + 1}</p><Button type="button" size="sm" variant="ghost" disabled={lines.length === 1 || pending} onClick={() => setLines((current) => current.filter((_, i) => i !== index))}>Remove</Button></div>
            <select value={line.optionId} onChange={(e) => chooseOption(index, e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
              <option value="">Custom line / choose catalogue item</option>
              {options.map((option) => <option key={option.id} value={option.id}>{option.label} · {formatMoney(option.unitPrice)}</option>)}
            </select>
            <input value={line.description} onChange={(e) => updateLine(index, { description: e.target.value })} maxLength={240} placeholder="Item description" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="text-xs font-semibold text-slate-600">{sourceType === "rental" ? "Number of rate periods" : "Quantity"}<input type="number" min="0.01" step="0.01" value={line.quantity} onChange={(e) => updateLine(index, { quantity: Number(e.target.value) })} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></label>
              <label className="text-xs font-semibold text-slate-600">Unit selling price (MWK, excl. VAT)<input type="number" min="0" step="0.01" value={line.unitPrice} onChange={(e) => updateLine(index, { unitPrice: Number(e.target.value) })} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></label>
            </div>
          </div>
        ))}
        <Button type="button" size="sm" variant="outline" disabled={pending || lines.length >= 40} onClick={() => setLines((current) => [...current, { description: "", quantity: 1, unitPrice: 0, optionId: "" }])}>Add item</Button>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="font-bold text-slate-950">Discount and terms</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="text-xs font-semibold text-slate-600">Authorised discount (MWK)<input type="number" min="0" step="0.01" value={discountAmount} onChange={(e) => setDiscountAmount(Number(e.target.value))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></label>
          <label className="text-xs font-semibold text-slate-600">Discount reason<input value={discountReason} onChange={(e) => setDiscountReason(e.target.value)} maxLength={300} placeholder="Required when discount is applied" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></label>
          <label className="text-xs font-semibold text-slate-600">Valid until<input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></label>
          <label className="text-xs font-semibold text-slate-600">Notes / terms<input value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={2000} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></label>
        </div>
        {totals ? <div className="ml-auto mt-5 max-w-sm space-y-2 border-t border-slate-200 pt-3 text-sm">
          <div className="flex justify-between"><span>Selling subtotal</span><span>{formatMoney(totals.subtotal)}</span></div>
          <div className="flex justify-between"><span>Discount</span><span>-{formatMoney(totals.discountAmount)}</span></div>
          <div className="flex justify-between"><span>Taxable selling price</span><span>{formatMoney(totals.taxableAmount)}</span></div>
          <div className="flex justify-between"><span>VAT (17.5%)</span><span>{formatMoney(totals.vatAmount)}</span></div>
          <div className="flex justify-between"><span>PPDA (1%)</span><span>{formatMoney(totals.ppdaAmount)}</span></div>
          <div className="flex justify-between border-t border-slate-300 pt-2 text-base font-bold"><span>Grand total</span><span>{formatMoney(totals.grandTotal)}</span></div>
        </div> : <p className="mt-4 text-sm text-rose-700">Add valid item descriptions, quantities and prices.</p>}
        {error ? <p role="alert" className="mt-3 text-sm text-rose-700">{error}</p> : null}
        <div className="mt-4 flex justify-end"><Button type="button" disabled={pending || !totals || customerName.trim().length < 2 || (discountAmount > 0 && discountReason.trim().length < 3)} isLoading={pending} onClick={issue}>Issue quotation</Button></div>
      </section>
    </div>
  );
}
