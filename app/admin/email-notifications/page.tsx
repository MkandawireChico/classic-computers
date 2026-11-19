import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { RetryAdminEmailButton } from "@/components/admin/retry-admin-email-button";
import { getMyPermissions } from "@/lib/auth/permissions";
import { getAdminEmailOutboxForPermissions, type AdminEmailRequestType } from "@/lib/services/admin-email-outbox";

const TYPE_LABEL: Record<AdminEmailRequestType, string> = {
  general_enquiry: "General enquiry",
  corporate_enquiry: "Corporate quotation",
  rental_booking: "Rental request",
  repair_ticket: "Repair request",
  student_verification: "Student verification",
  order_placed: "New order",
  review_submitted: "Review awaiting moderation",
};

const STATUS_VARIANT: Record<string, "neutral" | "success" | "warning" | "danger"> = {
  pending: "warning",
  sending: "neutral",
  sent: "success",
  failed: "danger",
};

function value(payload: Record<string, unknown>, key: string): string {
  const result = payload[key];
  return typeof result === "string" || typeof result === "number" ? String(result) : "";
}

function deliveryErrorMessage(code: string): string {
  switch (code) {
    case "SMTP_CONFIGURATION_INCOMPLETE":
      return "SMTP configuration is incomplete. Check the server-side SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASSWORD settings.";
    case "SMTP_NOTIFICATION_ADDRESSES_INVALID":
      return "The notification sender or admin recipient does not match the configured Classic Computers addresses.";
    case "EAUTH":
      return "The SMTP server rejected authentication. Update the deployed mailbox credentials or app password, then retry.";
    case "SMTP_RECIPIENT_REJECTED":
      return "The SMTP server did not accept the admin notification recipient.";
    default:
      return "Email delivery failed. Check the SMTP provider configuration and retry.";
  }
}

function requestLink(type: AdminEmailRequestType, id: string): string {
  switch (type) {
    case "general_enquiry": return "/admin/enquiries?tab=general";
    case "corporate_enquiry": return "/admin/enquiries?tab=corporate";
    case "rental_booking": return `/admin/rentals/${id}`;
    case "repair_ticket": return `/admin/repairs/${id}`;
    case "student_verification": return `/admin/students/${id}`;
    case "order_placed": return `/admin/orders/${id}`;
    case "review_submitted": return "/admin/reviews?status=pending";
  }
}

export default async function AdminEmailNotificationsPage() {
  const permissions = await getMyPermissions();
  const canView = ["customers.read", "rentals.read", "repairs.read", "students.read", "orders.read", "reviews.read"]
    .some((permission) => permissions.has(permission));
  if (!canView) redirect("/admin");

  const notifications = await getAdminEmailOutboxForPermissions(permissions);

  return (
    <div className="space-y-5">
      <header className="border-b border-slate-200 pb-4">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-800">Operations</p>
        <AdminPageHeader eyebrow="Administration · Communications" title="Email notifications" description="Monitor and manage automated email delivery and notification settings." />
        <p className="mt-2 text-sm leading-6 text-slate-600">Delivery status for saved customer requests. Failed or pending messages can be retried here.</p>
      </header>

      {notifications.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center">
          <h2 className="font-bold text-slate-950">No email notifications yet</h2>
          <p className="mt-1 text-sm text-slate-600">New request notifications will appear here after customers submit a request.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification: any) => {
            const type = notification.request_type as AdminEmailRequestType;
            const payload = (notification.payload ?? {}) as Record<string, unknown>;
            const reference = value(payload, "reference") || notification.request_id;
            const label = value(payload, "organisation_name") || value(payload, "customer_name") || value(payload, "student_name") || value(payload, "name") || TYPE_LABEL[type];
            return (
              <article key={notification.id} className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{TYPE_LABEL[type]}</p>
                    <h2 className="mt-1 break-words text-base font-bold text-slate-950">{label}</h2>
                    <p className="mt-1 text-sm text-slate-600">Reference {reference}</p>
                    <p className="mt-2 text-xs text-slate-500">Created {new Date(notification.created_at).toLocaleString("en-MW", { timeZone: "Africa/Blantyre", dateStyle: "medium", timeStyle: "short" })} · Attempts {notification.attempt_count}</p>
                    {notification.last_attempt_at ? <p className="mt-1 text-xs text-slate-500">Last attempt {new Date(notification.last_attempt_at).toLocaleString("en-MW", { timeZone: "Africa/Blantyre", dateStyle: "medium", timeStyle: "short" })}</p> : null}
                    {notification.last_error ? (
                      <p className="mt-2 text-xs font-medium text-rose-700">
                        {deliveryErrorMessage(notification.last_error)} <span className="font-mono">({notification.last_error})</span>
                      </p>
                    ) : null}
                  </div>
                  <Badge variant={STATUS_VARIANT[notification.status] ?? "neutral"}>{notification.status}</Badge>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
                  <Link href={requestLink(type, notification.request_id)} className="inline-flex min-h-10 items-center text-sm font-semibold text-emerald-800 underline underline-offset-4 hover:text-emerald-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700">Open request</Link>
                  {notification.status === "failed" || notification.status === "pending" ? <RetryAdminEmailButton notificationId={notification.id} /> : null}
                  {notification.status === "sent" && notification.sent_at ? <span className="text-xs text-slate-500">Sent {new Date(notification.sent_at).toLocaleString("en-MW", { timeZone: "Africa/Blantyre", dateStyle: "medium", timeStyle: "short" })}</span> : null}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}