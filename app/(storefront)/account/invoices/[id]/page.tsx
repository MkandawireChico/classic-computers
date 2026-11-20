import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatMoney } from "@/lib/format/money";
import { AccountPageHeader } from "@/components/storefront/account-page-header";

export default async function AccountInvoiceDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: invoice } = await (supabase.from("business_documents") as any)
    .select("id,document_number,source_type,status,subtotal,discount_amount,taxable_amount,vat_rate,vat_amount,ppda_rate,ppda_amount,grand_total,notes,created_at,issued_at")
    .eq("id", params.id).eq("document_type", "invoice").maybeSingle();
  if (!invoice) notFound();

  const [{ data: items }, { data: transactions }] = await Promise.all([
    (supabase.from("business_document_items") as any).select("id,description,quantity,unit_price,line_total").eq("document_id", invoice.id).order("created_at", { ascending: true }),
    (supabase.from("business_document_transactions") as any).select("id,transaction_type,amount,provider,provider_reference,created_at").eq("document_id", invoice.id).order("created_at", { ascending: true }),
  ]);
  const paid = (transactions ?? []).filter((x: any) => x.transaction_type === "payment").reduce((sum: number, x: any) => sum + Number(x.amount), 0);
  const refunded = (transactions ?? []).filter((x: any) => x.transaction_type === "refund").reduce((sum: number, x: any) => sum + Number(x.amount), 0);
  const balance = Math.max(0, Number(invoice.grand_total) - paid);
  return (
    <div className="space-y-5">
      <AccountPageHeader eyebrow="My documents" title={`Invoice #${invoice.document_number}`} description="Review your invoice and verified payment history." />
      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
        <div className="flex flex-wrap justify-between gap-3 border-b border-slate-200 pb-4"><div><p className="text-xs text-slate-500">Issued</p><p className="mt-1 font-semibold">{new Date(invoice.issued_at ?? invoice.created_at).toLocaleDateString("en-GB", { timeZone: "Africa/Blantyre" })}</p></div><div className="text-right"><p className="text-xs text-slate-500">Status</p><p className="mt-1 font-bold capitalize">{invoice.status.replaceAll("_", " ")}</p></div></div>
        <div className="mt-4 space-y-3">{(items ?? []).map((item: any) => <div key={item.id} className="flex justify-between gap-4 border-b border-slate-100 pb-3 text-sm"><div><p className="font-semibold text-slate-900">{item.description}</p><p className="mt-1 text-xs text-slate-500">{item.quantity} × {formatMoney(Number(item.unit_price))}</p></div><p className="font-semibold">{formatMoney(Number(item.line_total))}</p></div>)}</div>
        <div className="ml-auto mt-5 max-w-sm space-y-2 text-sm">
          <div className="flex justify-between"><span>Selling subtotal</span><span>{formatMoney(Number(invoice.subtotal))}</span></div>
          {Number(invoice.discount_amount) > 0 ? <div className="flex justify-between"><span>Discount</span><span>-{formatMoney(Number(invoice.discount_amount))}</span></div> : null}
          <div className="flex justify-between"><span>Taxable selling price</span><span>{formatMoney(Number(invoice.taxable_amount))}</span></div>
          <div className="flex justify-between"><span>VAT ({invoice.vat_rate}%)</span><span>{formatMoney(Number(invoice.vat_amount))}</span></div>
          <div className="flex justify-between"><span>PPDA ({invoice.ppda_rate}%)</span><span>{formatMoney(Number(invoice.ppda_amount))}</span></div>
          <div className="flex justify-between border-t border-slate-300 pt-2 font-bold"><span>Invoice total</span><span>{formatMoney(Number(invoice.grand_total))}</span></div>
        </div>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
        <h2 className="font-bold text-slate-950">Payment summary</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3"><div><p className="text-xs text-slate-500">Verified received</p><p className="mt-1 font-bold">{formatMoney(paid)}</p></div><div><p className="text-xs text-slate-500">Refunded</p><p className="mt-1 font-bold">{formatMoney(refunded)}</p></div><div><p className="text-xs text-slate-500">Outstanding</p><p className="mt-1 font-bold">{formatMoney(balance)}</p></div></div>
        {transactions?.length ? <div className="mt-4 divide-y divide-slate-100 border-t border-slate-100">{transactions.map((row: any) => <div key={row.id} className="flex flex-wrap justify-between gap-3 py-3 text-sm"><div><p className="font-semibold capitalize">{row.transaction_type} · {row.provider}</p><p className="text-xs text-slate-500">{row.provider_reference} · {new Date(row.created_at).toLocaleDateString("en-GB", { timeZone: "Africa/Blantyre" })}</p></div><p className="font-bold">{row.transaction_type === "refund" ? "-" : ""}{formatMoney(Number(row.amount))}</p></div>)}</div> : <p className="mt-3 text-sm text-slate-500">No verified payments recorded yet.</p>}
      </section>
    </div>
  );
}
