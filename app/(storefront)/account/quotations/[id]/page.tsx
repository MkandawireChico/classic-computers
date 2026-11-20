import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatMoney } from "@/lib/format/money";
import { AccountPageHeader } from "@/components/storefront/account-page-header";
import { QuotationDecisionControls } from "@/components/storefront/quotation-decision-controls";

export default async function AccountQuotationDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: document } = await ((supabase as any).from("business_documents") as any)
    .select("id,document_type,document_number,source_type,status,customer_name,subtotal,discount_amount,discount_reason,taxable_amount,vat_rate,vat_amount,ppda_rate,ppda_amount,grand_total,notes,valid_until,issued_at,created_at")
    .eq("id", params.id)
    .eq("document_type", "quotation")
    .maybeSingle();
  if (!document) notFound();

  const [{ data: items }, { data: decision }] = await Promise.all([
    ((supabase as any).from("business_document_items") as any).select("description,quantity,unit_price,line_total,sort_order").eq("document_id", document.id).order("sort_order", { ascending: true }),
    ((supabase as any).from("business_document_decisions") as any).select("decision,comment,created_at").eq("document_id", document.id).maybeSingle(),
  ]);
  const expired = Boolean(document.valid_until && document.valid_until < new Date().toISOString().slice(0, 10));
  const awaitingResponse = document.status === "issued" && !expired;
  const date = new Date(document.issued_at ?? document.created_at).toLocaleDateString("en-GB", { timeZone: "Africa/Blantyre" });

  return (
    <div className="space-y-5">
      <AccountPageHeader eyebrow="My documents" title={`Quotation #${document.document_number}`} description="Review the itemised costs, charges and terms before responding." action={<Link href="/account/quotations" className="text-sm font-semibold text-brand-700 hover:underline">All quotations</Link>} />
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
        <div className="flex flex-wrap justify-between gap-3 border-b border-slate-200 pb-4">
          <div><p className="text-xs uppercase tracking-wide text-slate-500">Issued</p><p className="mt-1 font-semibold text-slate-950">{date}</p></div>
          <div className="text-right"><p className="text-xs uppercase tracking-wide text-slate-500">Status</p><p className="mt-1 font-bold capitalize text-slate-950">{document.status.replaceAll("_", " ")}</p>{expired ? <p className="text-xs text-rose-700">Expired</p> : null}</div>
        </div>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead><tr className="border-b border-slate-200 text-xs uppercase text-slate-500"><th className="py-2">Description</th><th className="px-2 py-2 text-right">Qty</th><th className="px-2 py-2 text-right">Unit price</th><th className="py-2 text-right">Total</th></tr></thead>
            <tbody>{(items ?? []).map((item: any) => <tr key={item.sort_order} className="border-b border-slate-100"><td className="py-3 pr-2">{item.description}</td><td className="px-2 py-3 text-right">{item.quantity}</td><td className="px-2 py-3 text-right">{formatMoney(Number(item.unit_price))}</td><td className="py-3 text-right font-medium">{formatMoney(Number(item.line_total))}</td></tr>)}</tbody>
          </table>
        </div>
        <div className="ml-auto mt-5 max-w-sm space-y-2 text-sm">
          <div className="flex justify-between"><span>Selling subtotal</span><span>{formatMoney(Number(document.subtotal))}</span></div>
          {Number(document.discount_amount) > 0 ? <div className="flex justify-between"><span>Discount</span><span>-{formatMoney(Number(document.discount_amount))}</span></div> : null}
          <div className="flex justify-between"><span>Taxable selling price</span><span>{formatMoney(Number(document.taxable_amount))}</span></div>
          <div className="flex justify-between"><span>VAT ({document.vat_rate}%)</span><span>{formatMoney(Number(document.vat_amount))}</span></div>
          <div className="flex justify-between"><span>PPDA ({document.ppda_rate}%)</span><span>{formatMoney(Number(document.ppda_amount))}</span></div>
          <div className="flex justify-between border-t border-slate-300 pt-3 text-base font-bold"><span>Total payable</span><span>{formatMoney(Number(document.grand_total))}</span></div>
        </div>
        {document.notes ? <div className="mt-5 border-t border-slate-100 pt-4 text-sm"><p className="font-semibold">Terms and notes</p><p className="mt-1 whitespace-pre-line text-slate-600">{document.notes}</p></div> : null}
      </div>
      {awaitingResponse ? <QuotationDecisionControls documentId={document.id} /> : null}
      {decision ? <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="font-semibold capitalize text-slate-950">You {decision.decision} this quotation</p><p className="mt-1 text-xs text-slate-500">{new Date(decision.created_at).toLocaleString("en-GB", { timeZone: "Africa/Blantyre" })}</p>{decision.comment ? <p className="mt-2 text-sm text-slate-700">{decision.comment}</p> : null}</div> : null}
    </div>
  );
}
