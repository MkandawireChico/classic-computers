import Link from "next/link";
import { notFound } from "next/navigation";
import { getMyPermissions } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";
import { formatMoney } from "@/lib/format/money";
import { AdminDetailHeader } from "@/components/admin/admin-detail-header";

export default async function AdminDocumentsPage() {
  const permissions = await getMyPermissions();
  const readable = ["orders.read", "repairs.read", "rentals.read"].some((key) => permissions.has(key));
  if (!readable) notFound();

  const supabase = createClient();
  const { data: documents, error } = await (supabase.from("business_documents") as any)
    .select("id,document_type,document_number,source_type,customer_name,status,grand_total,created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="space-y-6">
      <AdminDetailHeader eyebrow="Commerce · Customer documents" title="Quotations & invoices" description="Review issued quotations and invoices across repairs, sales and rentals." />
      {error ? <p className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">Documents could not be loaded. Confirm the document migration is installed.</p> : null}
      {!documents?.length ? <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center"><h2 className="font-bold text-slate-950">No documents yet</h2><p className="mt-1 text-sm text-slate-600">New quotations and invoices will appear here.</p></div> : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="divide-y divide-slate-100">
            {documents.map((doc: any) => {
              const canRead = doc.source_type === "repair" ? permissions.has("repairs.read")
                : doc.source_type === "order" ? permissions.has("orders.read")
                : doc.source_type === "rental" ? permissions.has("rentals.read") : readable;
              if (!canRead) return null;
              return <Link key={doc.id} href={`/admin/documents/${doc.id}`} className="flex flex-wrap items-center justify-between gap-4 p-4 transition hover:bg-slate-50">
                <div><p className="font-bold text-slate-950">{doc.document_type === "quotation" ? "Quotation" : "Invoice"} #{doc.document_number}</p><p className="mt-1 text-xs text-slate-500">{doc.customer_name} · <span className="capitalize">{doc.source_type}</span> · {new Date(doc.created_at).toLocaleDateString("en-GB", { timeZone: "Africa/Blantyre" })}</p></div>
                <div className="text-right"><p className="font-bold tabular-nums">{formatMoney(Number(doc.grand_total))}</p><p className="mt-1 text-xs capitalize text-slate-500">{doc.status.replaceAll("_", " ")}</p></div>
              </Link>;
            })}
          </div>
        </div>
      )}
    </div>
  );
}
