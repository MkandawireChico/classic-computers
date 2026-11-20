import Link from "next/link";
import { requirePermission } from "@/lib/auth/permissions";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { listAdminOrders } from "@/lib/data/admin/orders";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/storefront/pagination";
import { formatMoney } from "@/lib/format/money";

const PAYMENT_VARIANT: Record<string, "neutral" | "success" | "warning" | "danger" | "info"> = {
  unpaid: "warning",
  partial: "info",
  paid: "success",
  refunded: "neutral",
  partially_refunded: "neutral",
};

const STATUS_VARIANT: Record<string, "neutral" | "success" | "warning" | "danger" | "info"> = {
  pending: "warning",
  confirmed: "info",
  processing: "info",
  ready_for_pickup: "info",
  out_for_delivery: "info",
  completed: "success",
  cancelled: "danger",
  refunded: "neutral",
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  await requirePermission("orders.read");

  const query = typeof searchParams.q === "string" ? searchParams.q : undefined;
  const status = typeof searchParams.status === "string" ? searchParams.status : undefined;
  const paymentStatus = typeof searchParams.payment === "string" ? searchParams.payment : undefined;
  const fulfillmentType = typeof searchParams.fulfillment === "string" ? searchParams.fulfillment : undefined;
  const page = typeof searchParams.page === "string" ? Number(searchParams.page) : 1;

  const result = await listAdminOrders({ query, status, paymentStatus, fulfillmentType, page, pageSize: 25 });

  return (
    <div>
      <AdminPageHeader eyebrow="Commerce · Order management" title="Orders" description="Review purchases, payment status and fulfilment progress." />

      <form className="mb-5 flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4" method="get">
        <input
          type="search"
          name="q"
          maxLength={100}
          defaultValue={query}
          placeholder="Search order number…"
          className="rounded-card border border-surface-border px-3 py-1.5 text-sm"
        />
        <select name="status" defaultValue={status ?? ""} className="rounded-card border border-surface-border px-3 py-1.5 text-sm">
          <option value="">All statuses</option>
          {["pending", "confirmed", "processing", "ready_for_pickup", "out_for_delivery", "completed", "cancelled", "refunded"].map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, " ")}
            </option>
          ))}
        </select>
        <select name="payment" defaultValue={paymentStatus ?? ""} className="rounded-card border border-surface-border px-3 py-1.5 text-sm">
          <option value="">All payment statuses</option>
          {["unpaid", "paid", "partial", "refunded"].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select name="fulfillment" defaultValue={fulfillmentType ?? ""} className="rounded-card border border-surface-border px-3 py-1.5 text-sm">
          <option value="">Pickup + delivery</option>
          <option value="pickup">Pickup</option>
          <option value="delivery">Delivery</option>
        </select>
        <button type="submit" className="rounded-card bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
          Apply filters
        </button>
        <Link href="/admin/orders" className="rounded-card px-3 py-2 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900">
          Clear
        </Link>
      </form>

      <div className="space-y-3 md:hidden">
        {result.items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">No orders match these filters.</div>
        ) : result.items.map((o) => (
          <Link key={o.id} href={`/admin/orders/${o.id}`} className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-brand-200 hover:shadow-panel focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="break-all text-sm font-extrabold text-slate-950">{o.order_number}</p>
                <p className="mt-1 truncate text-xs text-slate-500">{o.customer_name ?? o.guest_name ?? "Customer details unavailable"}</p>
              </div>
              <p className="shrink-0 text-sm font-extrabold tabular-nums text-slate-950">{formatMoney(o.total)}</p>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge variant={STATUS_VARIANT[o.order_status] ?? "neutral"}>{o.order_status.replace(/_/g, " ")}</Badge>
              <Badge variant={PAYMENT_VARIANT[o.payment_status] ?? "neutral"}>{o.payment_status}</Badge>
              <span className="text-xs capitalize text-slate-500">{o.fulfillment_type}</span>
            </div>
            <div className="mt-3 flex items-center justify-between gap-2">
              <p className="text-[11px] text-slate-400">{new Date(o.created_at).toLocaleString("en-MW", { timeZone: "Africa/Blantyre" })}</p>
              <p className="text-xs font-semibold tabular-nums text-slate-700">
                {o.outstanding_balance === null
                  ? "Legacy balance needs review"
                  : o.outstanding_balance > 0
                    ? `Due ${formatMoney(o.outstanding_balance)}`
                    : "No balance due"}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="bg-surface-muted text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="p-3">Order</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Total</th>
              <th className="p-3">Status</th>
              <th className="p-3">Payment</th>
              <th className="p-3">Balance</th>
              <th className="p-3">Fulfillment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {result.items.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-gray-500">
                  No orders found.
                </td>
              </tr>
            ) : (
              result.items.map((o) => (
                <tr key={o.id} className="hover:bg-surface-muted">
                  <td className="p-3">
                    <Link href={`/admin/orders/${o.id}`} className="font-medium text-brand-600 hover:underline">
                      {o.order_number}
                    </Link>
                    <p className="text-xs text-gray-400">
                      {new Date(o.created_at).toLocaleDateString("en-MW", { timeZone: "Africa/Blantyre" })}
                    </p>
                  </td>
                  <td className="p-3 text-gray-700">{o.customer_name ?? o.guest_name ?? "—"}</td>
                  <td className="p-3 text-gray-900">{formatMoney(o.total)}</td>
                  <td className="p-3">
                    <Badge variant={STATUS_VARIANT[o.order_status] ?? "neutral"}>{o.order_status.replace(/_/g, " ")}</Badge>
                  </td>
                  <td className="p-3"><Badge variant={PAYMENT_VARIANT[o.payment_status] ?? "neutral"}>{o.payment_status}</Badge></td>
                  <td className="p-3 text-xs font-semibold tabular-nums text-slate-700">
                    {o.outstanding_balance === null ? "Review legacy record" : o.outstanding_balance > 0 ? formatMoney(o.outstanding_balance) : "Settled"}
                  </td>
                  <td className="p-3 text-gray-600 capitalize">{o.fulfillment_type}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={result.page} pageSize={result.pageSize} total={result.total} basePath="/admin/orders" searchParams={searchParams} />
    </div>
  );
}
