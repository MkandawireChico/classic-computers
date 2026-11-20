import Link from "next/link";
import { requirePermission } from "@/lib/auth/permissions";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { listAdminRepairs } from "@/lib/data/admin/repairs";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/storefront/pagination";

const STATUS_VARIANT: Record<string, "neutral" | "success" | "warning" | "danger" | "info"> = {
  checked_in: "warning",
  diagnosing: "info",
  quoted: "info",
  awaiting_approval: "warning",
  in_progress: "info",
  ready_for_pickup: "info",
  completed: "success",
  cancelled: "danger",
};

export default async function AdminRepairsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  await requirePermission("repairs.read");

  const status = typeof searchParams.status === "string" ? searchParams.status : undefined;
  const query = typeof searchParams.q === "string" ? searchParams.q : undefined;
  const page = typeof searchParams.page === "string" ? Number(searchParams.page) : 1;

  const result = await listAdminRepairs({ status, query, page, pageSize: 25 });

  return (
    <div>
      <AdminPageHeader eyebrow="Operations · Service desk" title="Repairs" description="Track incoming devices, diagnosis, approvals and completed work." />

      <form className="mb-5 flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4" method="get">
        <input type="search" name="q" maxLength={100} defaultValue={query} placeholder="Ticket number…" className="rounded-card border border-surface-border px-3 py-1.5 text-sm" />
        <select name="status" defaultValue={status ?? ""} className="rounded-card border border-surface-border px-3 py-1.5 text-sm">
          <option value="">All statuses</option>
          {["checked_in", "diagnosing", "quoted", "awaiting_approval", "in_progress", "ready_for_pickup", "completed", "cancelled"].map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, " ")}
            </option>
          ))}
        </select>
        <button type="submit" className="rounded-card border border-surface-border px-3 py-1.5 text-sm hover:bg-surface-muted">
          Filter
        </button>
      </form>

      <div className="space-y-3 md:hidden">
        {result.items.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">No repairs found.</div>
        ) : result.items.map((r) => (
          <Link key={r.id} href={`/admin/repairs/${r.id}`} className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-brand-200">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wide text-brand-700">{r.ticket_number}</p>
                <p className="mt-1 font-semibold text-slate-950">{r.device_type}</p>
                <p className="mt-1 truncate text-sm text-slate-600">{r.customer_name ?? r.guest_name ?? "Customer not recorded"}</p>
              </div>
              <Badge variant={STATUS_VARIANT[r.status] ?? "neutral"}>{r.status.replace(/_/g, " ")}</Badge>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
              <span>Booked {new Date(r.created_at).toLocaleDateString("en-MW", { timeZone: "Africa/Blantyre" })}</span>
              <span className="font-semibold text-brand-700">Open ticket →</span>
            </div>
          </Link>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
        <table className="w-full min-w-[600px] text-sm">
          <thead className="bg-surface-muted text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="p-3">Ticket</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Device</th>
              <th className="p-3">Status</th>
              <th className="p-3">Booked</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {result.items.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-500">
                  No repairs found.
                </td>
              </tr>
            ) : (
              result.items.map((r) => (
                <tr key={r.id} className="hover:bg-surface-muted">
                  <td className="p-3">
                    <Link href={`/admin/repairs/${r.id}`} className="font-medium text-brand-600 hover:underline">
                      {r.ticket_number}
                    </Link>
                  </td>
                  <td className="p-3 text-gray-700">{r.customer_name ?? r.guest_name ?? "—"}</td>
                  <td className="p-3 text-gray-600">{r.device_type}</td>
                  <td className="p-3">
                    <Badge variant={STATUS_VARIANT[r.status] ?? "neutral"}>{r.status.replace(/_/g, " ")}</Badge>
                  </td>
                  <td className="p-3 text-gray-500">
                    {new Date(r.created_at).toLocaleDateString("en-MW", { timeZone: "Africa/Blantyre" })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={result.page} pageSize={result.pageSize} total={result.total} basePath="/admin/repairs" searchParams={searchParams} />
    </div>
  );
}
