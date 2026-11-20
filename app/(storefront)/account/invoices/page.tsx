import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AccountPageHeader } from "@/components/storefront/account-page-header";
import { formatMoney } from "@/lib/format/money";

export default async function AccountInvoicesPage() {
  const supabase = createClient();
  const { data: invoices, error } = await (supabase.from("business_documents") as any)
    .select("id,document_number,source_type,status,grand_total,created_at")
    .eq("document_type", "invoice")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-5">
      <AccountPageHeader eyebrow="My documents" title="Invoices" description="View invoices issued to your account and track payment balances." />
      {error ? <p className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">Your invoices could not be loaded. Refresh the page to try again.</p> : null}
      {!invoices?.length ? <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center"><h2 className="font-bold text-slate-950">No invoices yet</h2><p className="mt-2 text-sm text-slate-600">Invoices issued to your account will appear here.</p></div> : (
        <div className="space-y-3">
          {invoices.map((invoice: any) => <Link key={invoice.id} href={`/account/invoices/${invoice.id}`} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-cyan-300">
            <div><p className="font-bold text-slate-950">Invoice #{invoice.document_number}</p><p className="mt-1 text-xs capitalize text-slate-500">{invoice.source_type} · {new Date(invoice.created_at).toLocaleDateString("en-GB", { timeZone: "Africa/Blantyre" })}</p><p className="mt-1 text-xs font-semibold capitalize text-slate-600">{invoice.status.replaceAll("_", " ")}</p></div>
            <p className="font-bold tabular-nums text-slate-950">{formatMoney(Number(invoice.grand_total))}</p>
          </Link>)}
        </div>
      )}
    </div>
  );
}
