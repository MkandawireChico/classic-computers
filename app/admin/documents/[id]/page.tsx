import { notFound } from "next/navigation";
import { getMyPermissions } from "@/lib/auth/permissions";
import { ConvertQuotationToInvoiceButton } from "@/components/admin/convert-quotation-to-invoice-button";
import { InvoiceTransactionControls } from "@/components/admin/invoice-transaction-controls";
import { StaffQuotationDecisionControls } from "@/components/admin/staff-quotation-decision-controls";
import { createClient } from "@/lib/supabase/server";
import { formatMoney } from "@/lib/format/money";
import { PrintDocumentButton } from "@/components/admin/print-document-button";

export default async function AdminBusinessDocumentPage({ params }: { params: { id: string } }) {
  const permissions = await getMyPermissions();
  const supabase = createClient();
  const { data: document } = await ((supabase.from("business_documents") as any) as any)
    .select("id,document_type,document_number,source_type,source_id,customer_name,customer_email,customer_phone,billing_address,status,subtotal,discount_amount,discount_reason,discount_authorized_by,taxable_amount,vat_rate,vat_amount,ppda_rate,ppda_amount,grand_total,notes,terms,valid_until,issued_at,created_at")
    .eq("id", params.id)
    .maybeSingle();
  if (!document) notFound();
  const requiredRead = document.source_type === "order" ? "orders.read"
    : document.source_type === "rental" ? "rentals.read"
    : document.source_type === "repair" ? "repairs.read" : null;
  if (requiredRead ? !permissions.has(requiredRead) : !["orders.read", "repairs.read", "rentals.read"].some((key) => permissions.has(key))) notFound();
  const canConvert = document.document_type === "quotation" && document.status === "accepted" && (
    document.source_type === "order" ? permissions.has("orders.write")
    : document.source_type === "rental" ? permissions.has("rentals.write")
    : permissions.has("repairs.write")
  );

  const { data: discountApprover } = document.discount_authorized_by
    ? await (supabase.from("profiles") as any).select("full_name").eq("id", document.discount_authorized_by).maybeSingle()
    : { data: null };
  const { data: items } = await ((supabase.from("business_document_items") as any) as any)
    .select("description,quantity,unit_price,line_total,sort_order")
    .eq("document_id", document.id)
    .order("sort_order", { ascending: true });
  const { data: decision } = document.document_type === "quotation"
    ? await (supabase.from("business_document_decisions") as any)
      .select("decision,decision_channel,comment,created_at")
      .eq("document_id", document.id)
      .maybeSingle()
    : { data: null };
  const { data: transactions } = document.document_type === "invoice"
    ? await (supabase.from("business_document_transactions") as any)
      .select("id,transaction_type,amount,provider,provider_reference,notes,created_at")
      .eq("document_id", document.id)
      .order("created_at", { ascending: false })
    : { data: [] };
  const paid = (transactions ?? []).filter((row: any) => row.transaction_type === "payment").reduce((sum: number, row: any) => sum + Number(row.amount), 0);
  const refunded = (transactions ?? []).filter((row: any) => row.transaction_type === "refund").reduce((sum: number, row: any) => sum + Number(row.amount), 0);
  const outstanding = Math.max(0, Number(document.grand_total) - paid);
  const refundable = Math.max(0, paid - refunded);
  const canRecordTransactions = document.document_type === "invoice" && (
    document.source_type === "order" ? permissions.has("orders.write")
    : document.source_type === "rental" ? permissions.has("rentals.write")
    : permissions.has("repairs.write")
  );
  const canRecordDecision = document.document_type === "quotation" && document.status === "issued" && (
    document.source_type === "order" ? permissions.has("orders.write")
    : document.source_type === "rental" ? permissions.has("rentals.write")
    : permissions.has("repairs.write")
  );
  const isQuotation = document.document_type === "quotation";
  const date = new Date(document.issued_at ?? document.created_at).toLocaleDateString("en-GB", { timeZone: "Africa/Blantyre" });

  return (
    <main className="mx-auto max-w-4xl space-y-5 bg-white p-4 text-slate-900 sm:p-8 print:max-w-none print:p-0">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <p className="text-sm text-slate-500">Document preview · {document.status}</p>
        <PrintDocumentButton />
      </div>

      <article className="border border-slate-200 bg-white print:border-0">
        <header className="grid gap-5 bg-[#08265f] px-6 py-7 text-white sm:grid-cols-[1.2fr_1fr] sm:px-9">
          <div className="flex flex-col justify-center">
            <p className="text-xl font-bold tracking-wide">CLASSIC COMPUTERS LLC</p>
            <p className="mt-2 text-xs uppercase tracking-[0.22em] text-blue-200">Technology · Sales · Rentals · Repairs</p>
            <p className="mt-5 text-sm font-semibold">"Durable and Quality Computer for Everyone"</p>
          </div>
          <div className="text-xs leading-5 text-blue-100">
            <p>Glyn Jones Road, Shop #4, Shree Satyanarayan Building</p>
            <p>Opposite First Capital Bank, Blantyre, Malawi</p>
            <p>Cell: +265 (0) 995837735 / 0 880287483</p>
            <p>Email: info@classiccomputers.mw</p>
            <p>Website: www.classiccomputers.mw</p>
            <p className="mt-2 font-semibold text-white">TPIN: 70357738</p>
          </div>
        </header>

        <div className="px-5 py-7 sm:px-9">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <h1 className="text-2xl font-bold uppercase tracking-wide text-[#df8a42]">{isQuotation ? "Quotation" : "Invoice"}</h1>
              <p className="mt-2 text-sm font-semibold">{isQuotation ? "QUOTATION" : "INVOICE"} No: {document.document_number}</p>
              <p className="mt-1 text-xs text-slate-500">Date: {date}</p>
              {document.valid_until ? <p className="mt-1 text-xs text-slate-500">Valid until: {new Date(document.valid_until).toLocaleDateString("en-GB", { timeZone: "Africa/Blantyre" })}</p> : null}
            </div>
            <div className="min-w-52 text-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Billed to</p>
              <p className="mt-2 font-semibold">{document.customer_name}</p>
              {document.customer_phone ? <p className="mt-1 text-xs text-slate-600">{document.customer_phone}</p> : null}
              {document.customer_email ? <p className="mt-1 break-all text-xs text-slate-600">{document.customer_email}</p> : null}
              {document.billing_address ? <p className="mt-1 whitespace-pre-line text-xs text-slate-600">{document.billing_address}</p> : null}
            </div>
          </div>

          <div className="mt-6 overflow-hidden">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="bg-emerald-600 text-white">
                <tr>
                  <th className="border border-emerald-700 px-2 py-2">QTY</th>
                  <th className="border border-emerald-700 px-2 py-2">DESCRIPTION</th>
                  <th className="border border-emerald-700 px-2 py-2 text-right">UNIT PRICE (MWK)</th>
                  <th className="border border-emerald-700 px-2 py-2 text-right">TOTAL (MWK)</th>
                </tr>
              </thead>
              <tbody>
                {(items ?? []).map((item: any, index: number) => (
                  <tr key={index}>
                    <td className="border border-slate-300 px-2 py-2 align-top">{item.quantity}</td>
                    <td className="border border-slate-300 px-2 py-2">{item.description}</td>
                    <td className="border border-slate-300 px-2 py-2 text-right">{formatMoney(Number(item.unit_price))}</td>
                    <td className="border border-slate-300 px-2 py-2 text-right">{formatMoney(Number(item.line_total))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-5 flex justify-end">
            <div className="w-full max-w-sm space-y-2 text-sm">
              <div className="flex justify-between"><span>Selling subtotal</span><span>{formatMoney(Number(document.subtotal))}</span></div>
              {Number(document.discount_amount) > 0 ? <div className="flex justify-between text-emerald-700"><span>Authorised discount</span><span>-{formatMoney(Number(document.discount_amount))}</span></div> : null}
              {Number(document.discount_amount) > 0 && document.discount_reason ? <p className="text-right text-xs text-slate-500">Discount reason: {document.discount_reason}{discountApprover?.full_name ? ` · Authorised by ${discountApprover.full_name}` : ""}</p> : null}
              <div className="flex justify-between"><span>Taxable selling price</span><span>{formatMoney(Number(document.taxable_amount))}</span></div>
              <div className="flex justify-between"><span>VAT ({Number(document.vat_rate)}%)</span><span>{formatMoney(Number(document.vat_amount))}</span></div>
              <div className="flex justify-between"><span>PPDA ({Number(document.ppda_rate)}%)</span><span>{formatMoney(Number(document.ppda_amount))}</span></div>
              <div className="flex justify-between border-t-2 border-slate-800 pt-2 text-base font-bold"><span>GRAND TOTAL</span><span>{formatMoney(Number(document.grand_total))}</span></div>
            </div>
          </div>

          {document.notes ? <div className="mt-7 border-t border-slate-200 pt-4 text-xs"><p className="font-semibold">Notes / Terms</p><p className="mt-2 whitespace-pre-line">{document.notes}</p></div> : null}

          <footer className="mt-8 grid gap-5 border-t border-slate-200 pt-4 text-xs sm:grid-cols-2">
            <div>
              <p className="font-bold uppercase">Account details</p>
              <p className="mt-2">Bank: Standard Bank, Blantyre Branch</p>
              <p>Account name: Classic Computers</p>
              <p>Account number: 9100007675396</p>
            </div>
            <div className="sm:text-right">
              <p className="font-semibold">Thank you for your business.</p>
              <p className="mt-2 text-slate-500">All prices are in Malawi Kwacha (MWK).</p>
            </div>
          </footer>
        </div>
      </article>
      {decision ? <section className="rounded-2xl border border-slate-200 bg-white p-4 print:hidden"><p className="font-bold capitalize text-slate-950">Customer {decision.decision}</p><p className="mt-1 text-xs text-slate-500">{decision.decision_channel === "staff_recorded" ? "Recorded by staff" : "Customer account response"} · {new Date(decision.created_at).toLocaleString("en-GB", { timeZone: "Africa/Blantyre" })}</p>{decision.comment ? <p className="mt-2 text-sm text-slate-700">{decision.comment}</p> : null}</section> : null}
      {canRecordDecision ? <div className="print:hidden"><StaffQuotationDecisionControls documentId={document.id} /></div> : null}
      {document.document_type === "invoice" ? (
        <section className="space-y-4 print:hidden">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="font-bold text-slate-950">Payment summary</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <div><p className="text-xs text-slate-500">Verified received</p><p className="mt-1 font-bold tabular-nums">{formatMoney(paid)}</p></div>
              <div><p className="text-xs text-slate-500">Refunded</p><p className="mt-1 font-bold tabular-nums">{formatMoney(refunded)}</p></div>
              <div><p className="text-xs text-slate-500">Outstanding</p><p className="mt-1 font-bold tabular-nums">{formatMoney(outstanding)}</p></div>
            </div>
            {transactions?.length ? <div className="mt-4 divide-y divide-slate-100 border-t border-slate-100">
              {transactions.map((row: any) => <div key={row.id} className="flex flex-wrap justify-between gap-3 py-3 text-sm">
                <div><p className="font-semibold capitalize text-slate-800">{row.transaction_type} · {row.provider}</p><p className="text-xs text-slate-500">{row.provider_reference} · {new Date(row.created_at).toLocaleString("en-GB", { timeZone: "Africa/Blantyre" })}</p>{row.notes ? <p className="mt-1 text-xs text-slate-500">{row.notes}</p> : null}</div>
                <p className="font-bold tabular-nums">{row.transaction_type === "refund" ? "-" : ""}{formatMoney(Number(row.amount))}</p>
              </div>)}
            </div> : <p className="mt-3 text-sm text-slate-500">No payment transactions recorded.</p>}
          </div>
          {canRecordTransactions ? <InvoiceTransactionControls documentId={document.id} outstanding={outstanding} refundable={refundable} hasRefund={refunded > 0} /> : null}
        </section>
      ) : null}
      <style>{`@media print { @page { size: A4; margin: 10mm; } body { background: #fff !important; } }`}</style>
    </main>
  );
}
