import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AccountPageHeader } from "@/components/storefront/account-page-header";
import { formatMoney } from "@/lib/format/money";

export default async function AccountQuotationsPage() {
  const supabase = createClient();
  const { data: documents, error } = await (supabase.from("business_documents") as any)
    .select("id,document_number,source_type,status,grand_total,created_at,valid_until")
    .eq("document_type", "quotation")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-5">
      <AccountPageHeader eyebrow="My documents" title="Quotations" description="Review quotations issued to your account and respond securely." />
      {error ? <p className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">Your quotations could not be loaded. Refresh the page to try again.</p> : null}
      {!documents?.length ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <h2 className="font-bold text-slate-950">No quotations yet</h2>
          <p className="mt-2 text-sm text-slate-600">Quotations prepared for your account will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc: any) => (
            <Link key={doc.id} href={`/account/quotations/${doc.id}`} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-cyan-300">
              <div>
                <p className="font-bold text-slate-950">Quotation #{doc.document_number}</p>
                <p className="mt-1 text-xs capitalize text-slate-500">{doc.source_type} · {new Date(doc.created_at).toLocaleDateString("en-GB", { timeZone: "Africa/Blantyre" })}</p>
                <p className="mt-1 text-xs font-semibold capitalize text-slate-600">{doc.status.replaceAll("_", " ")}</p>
              </div>
              <div className="text-right">
                <p className="font-bold tabular-nums text-slate-950">{formatMoney(Number(doc.grand_total))}</p>
                {doc.valid_until ? <p className="mt-1 text-xs text-slate-500">Valid until {new Date(doc.valid_until).toLocaleDateString("en-GB", { timeZone: "Africa/Blantyre" })}</p> : null}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
