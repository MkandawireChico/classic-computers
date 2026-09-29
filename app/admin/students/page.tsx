import Link from "next/link";
import { requirePermission } from "@/lib/auth/permissions";
import { listAdminStudentVerifications } from "@/lib/data/admin/students";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/storefront/pagination";

const STATUS_VARIANT: Record<string, "neutral" | "success" | "warning" | "danger"> = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
  expired: "neutral",
};

export default async function AdminStudentsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  await requirePermission("students.read");
  const status = typeof searchParams.status === "string" ? searchParams.status : undefined;
  const page = typeof searchParams.page === "string" ? Number(searchParams.page) : 1;

  const result = await listAdminStudentVerifications(status, page, 25);

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-gray-900">Student Verification</h1>

      <form className="mb-4 flex gap-2" method="get">
        <select name="status" defaultValue={status ?? ""} className="rounded-card border border-surface-border px-3 py-1.5 text-sm">
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="expired">Expired</option>
        </select>
        <button type="submit" className="rounded-card border border-surface-border px-3 py-1.5 text-sm hover:bg-surface-muted">
          Filter
        </button>
      </form>

      <div className="overflow-x-auto rounded-card border border-surface-border">
        <table className="w-full min-w-[600px] text-sm">
          <thead className="bg-surface-muted text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Institution</th>
              <th className="p-3">Submitted</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {result.items.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-6 text-center text-gray-500">
                  No verifications found.
                </td>
              </tr>
            ) : (
              result.items.map((v) => (
                <tr key={v.id} className="hover:bg-surface-muted">
                  <td className="p-3">
                    <Link href={`/admin/students/${v.id}`} className="font-medium text-brand-600 hover:underline">
                      {v.full_name}
                    </Link>
                  </td>
                  <td className="p-3 text-gray-600">{v.institution}</td>
                  <td className="p-3 text-gray-500">
                    {new Date(v.created_at).toLocaleDateString("en-MW", { timeZone: "Africa/Blantyre" })}
                  </td>
                  <td className="p-3">
                    <Badge variant={STATUS_VARIANT[v.status] ?? "neutral"}>{v.status}</Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={result.page} pageSize={result.pageSize} total={result.total} basePath="/admin/students" searchParams={searchParams} />
    </div>
  );
}
