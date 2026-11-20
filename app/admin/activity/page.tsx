import { requirePermission } from "@/lib/auth/permissions";
import { listAdminAuditEntries } from "@/lib/data/admin/audit-log";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Card } from "@/components/ui/card";

function formatAction(value: string) {
  return value.replace(/[._]/g, " ").replace(/\s+/g, " ").trim();
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-MW", {
    timeZone: "Africa/Blantyre",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function AdminActivityLogPage() {
  await requirePermission("audit_logs.read");
  const entries = await listAdminAuditEntries(100);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Administration · Accountability"
        title="Activity log"
        description="A chronological record of important staff and system actions across store operations."
      />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-slate-600">Showing the latest {entries.length} recorded events.</p>
        <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">Newest first</span>
      </div>

      {entries.length === 0 ? (
        <Card>
          <div className="py-8 text-center">
            <h2 className="font-semibold text-slate-900">No activity recorded yet</h2>
            <p className="mt-1 text-sm text-slate-500">Audited actions will appear here as staff work in the admin workspace.</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <Card key={entry.id} className="!p-4 sm:!p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold uppercase tracking-wide text-slate-700">{entry.entity_type.replace(/_/g, " ")}</span>
                    <span className="text-sm font-semibold text-slate-950">{formatAction(entry.action)}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">By <span className="font-medium text-slate-800">{entry.actor_name ?? "System"}</span></p>
                  {entry.entity_id ? (
                    <p className="mt-1 break-all font-mono text-[11px] text-slate-400">Record: {entry.entity_id}</p>
                  ) : null}
                </div>
                <time dateTime={entry.created_at} className="shrink-0 text-xs text-slate-500">{formatDate(entry.created_at)}</time>
              </div>
              {Object.keys(entry.metadata).length > 0 ? (
                <details className="mt-3 border-t border-slate-100 pt-3">
                  <summary className="cursor-pointer text-xs font-semibold text-brand-700">View event details</summary>
                  <pre className="mt-2 max-h-64 overflow-auto rounded-lg bg-slate-950 p-3 text-[11px] leading-5 text-slate-100">{JSON.stringify(entry.metadata, null, 2)}</pre>
                </details>
              ) : null}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
