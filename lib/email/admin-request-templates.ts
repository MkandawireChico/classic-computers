import type { AdminEmailRequestType } from "@/lib/services/admin-email-outbox";
import { getAuthRedirectUrl } from "@/lib/auth/site-url";

export type AdminEmailPayload = Record<string, unknown>;

export interface AdminEmailContent {
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
}

function value(payload: AdminEmailPayload, key: string): string {
  const raw = payload[key];
  if (typeof raw === "string" || typeof raw === "number") return String(raw).trim();
  return "";
}

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character] ?? character);
}

function formatField(label: string, fieldValue: string): { label: string; value: string } | null {
  return fieldValue ? { label, value: fieldValue } : null;
}

function getAdminLink(type: AdminEmailRequestType, requestId: string): string {
  const routes: Record<AdminEmailRequestType, string> = {
    general_enquiry: "/admin/enquiries?tab=general",
    corporate_enquiry: "/admin/enquiries?tab=corporate",
    rental_booking: `/admin/rentals/${encodeURIComponent(requestId)}`,
    repair_ticket: `/admin/repairs/${encodeURIComponent(requestId)}`,
    student_verification: `/admin/students/${encodeURIComponent(requestId)}`,
    order_placed: `/admin/orders/${encodeURIComponent(requestId)}`,
    review_submitted: "/admin/reviews?status=pending",
  };
  return getAuthRedirectUrl(routes[type]);
}

export function buildAdminRequestEmail(
  type: AdminEmailRequestType,
  requestId: string,
  payload: AdminEmailPayload,
): AdminEmailContent {
  const reference = value(payload, "reference") || requestId;
  const submittedAt = value(payload, "submitted_at");
  const link = getAdminLink(type, requestId);
  let title = "New customer request";
  let fields: Array<{ label: string; value: string } | null> = [];

  switch (type) {
    case "general_enquiry": {
      const topic = value(payload, "subject") || "General";
      title = `New ${topic.toLowerCase()} enquiry`;
      fields = [
        formatField("Enquiry reference", reference),
        formatField("Customer", value(payload, "name")),
        formatField("Email", value(payload, "email")),
        formatField("Phone", value(payload, "phone")),
        formatField("Subject", topic),
        formatField("Message", value(payload, "message")),
        formatField("Submitted", submittedAt),
      ];
      break;
    }
    case "corporate_enquiry":
      title = "New corporate quotation request";
      fields = [
        formatField("Request reference", reference),
        formatField("Organisation", value(payload, "organisation_name")),
        formatField("Contact person", value(payload, "contact_person")),
        formatField("Email", value(payload, "email")),
        formatField("Phone", value(payload, "phone")),
        formatField("Products or equipment", value(payload, "products_required")),
        formatField("Quantity", value(payload, "quantity")),
        formatField("Budget", value(payload, "budget")),
        formatField("Delivery location", value(payload, "delivery_location")),
        formatField("Additional requirements", value(payload, "additional_requirements")),
        formatField("Submitted", submittedAt),
      ];
      break;
    case "rental_booking":
      title = "New rental request";
      fields = [
        formatField("Request reference", reference),
        formatField("Customer", value(payload, "customer_name")),
        formatField("Email", value(payload, "email")),
        formatField("Phone", value(payload, "phone")),
        formatField("Equipment", value(payload, "equipment")),
        formatField("Quantity", value(payload, "quantity")),
        formatField("Start date", value(payload, "start_date")),
        formatField("End date", value(payload, "end_date")),
        formatField("Additional requirements", value(payload, "notes")),
        formatField("Submitted", submittedAt),
      ];
      break;
    case "repair_ticket":
      title = "New device repair request";
      fields = [
        formatField("Repair reference", reference),
        formatField("Customer", value(payload, "customer_name")),
        formatField("Email", value(payload, "email")),
        formatField("Phone", value(payload, "phone")),
        formatField("Device type", value(payload, "device_type")),
        formatField("Manufacturer", value(payload, "brand")),
        formatField("Model", value(payload, "model")),
        formatField("Reported fault", value(payload, "reported_fault")),
        formatField("Additional information", value(payload, "additional_information")),
        formatField("Submitted", submittedAt),
      ];
      break;
    case "student_verification":
      title = "New student verification application";
      fields = [
        formatField("Application reference", reference),
        formatField("Student", value(payload, "student_name")),
        formatField("Student email", value(payload, "student_email")),
        formatField("Institution", value(payload, "institution")),
        formatField("Application date", value(payload, "application_date")),
      ];
      break;
    case "order_placed": {
      title = "New customer order";
      const items = Array.isArray(payload.items)
        ? payload.items.map((item) => {
            if (!item || typeof item !== "object") return "";
            const orderItem = item as Record<string, unknown>;
            return `${String(orderItem.quantity ?? "")} × ${String(orderItem.product_name_snapshot ?? "")}`.trim();
          }).filter(Boolean).join("\n")
        : "";
      fields = [
        formatField("Order reference", reference),
        formatField("Customer", value(payload, "customer_name")),
        formatField("Email", value(payload, "email")),
        formatField("Phone", value(payload, "phone")),
        formatField("Items", items),
        formatField("Total", [value(payload, "currency"), value(payload, "total")].filter(Boolean).join(" ")),
        formatField("Payment method", value(payload, "payment_method")),
        formatField("Payment status", value(payload, "payment_status")),
        formatField("Fulfillment", value(payload, "fulfillment_type")),
        formatField("Submitted", submittedAt),
      ];
      break;
    }
    case "review_submitted":
      title = "New customer review awaiting moderation";
      fields = [
        formatField("Review reference", reference),
        formatField("Review category", value(payload, "review_type")),
        formatField("Rating", `${value(payload, "rating")} / 5`),
        formatField("Title", value(payload, "title")),
        formatField("Feedback", value(payload, "comment")),
        formatField("Verified transaction", value(payload, "verified_purchase")),
        formatField("Submitted", submittedAt),
      ];
      break;
  }

  const visibleFields = fields.filter((field): field is { label: string; value: string } => field !== null);
  const textFields = visibleFields.map((field) => `${field.label}:\n${field.value}`).join("\n\n");
  const htmlRows = visibleFields.map((field) => `
    <tr>
      <th align="left" valign="top" style="padding:11px 12px;border-bottom:1px solid #e6ece8;color:#52635a;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.04em">${escapeHtml(field.label)}</th>
      <td style="padding:11px 12px;border-bottom:1px solid #e6ece8;color:#17221e;font-size:14px;line-height:1.55;white-space:pre-wrap;overflow-wrap:anywhere">${escapeHtml(field.value)}</td>
    </tr>`).join("");
  const replyTo = value(payload, "email") || value(payload, "student_email");

  return {
    subject: `${title} | ${reference}`,
    replyTo: replyTo || undefined,
    text: `${title}\nRequest reference: ${reference}\n\n${textFields}\n\nOpen the protected admin record: ${link}\n\nClassic Computers LLC`,
    html: `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#f2f6f3;padding:24px 12px;font-family:Arial,Helvetica,sans-serif;color:#17221e">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;margin:0 auto;background:#ffffff;border:1px solid #dce5df;border-collapse:collapse">
    <tr><td style="padding:24px 28px;background:#145c3d;color:#ffffff">
      <p style="margin:0;color:#d9f0e2;font-size:11px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase">Classic Computers LLC · Internal request alert</p>
      <h1 style="margin:10px 0 0;color:#ffffff;font-size:22px;line-height:1.3">${escapeHtml(title)}</h1>
    </td></tr>
    <tr><td style="padding:22px 28px 8px"><p style="margin:0;color:#52635a;font-size:14px;line-height:1.6">A new request has been saved and is available in the admin dashboard.</p></td></tr>
    <tr><td style="padding:8px 16px 18px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse">${htmlRows}</table></td></tr>
    <tr><td style="padding:8px 28px 26px">
      <a href="${escapeHtml(link)}" style="display:inline-block;background:#176b48;color:#ffffff;padding:12px 18px;text-decoration:none;font-size:14px;font-weight:700">Open admin record</a>
      <p style="margin:16px 0 0;color:#52635a;font-size:12px;line-height:1.55">This notification contains request details for internal handling. Do not forward it outside the team.</p>
    </td></tr>
    <tr><td style="padding:16px 28px;border-top:1px solid #e6ece8;color:#68776e;font-size:11px">Classic Computers LLC · classiccomputers.mw</td></tr>
  </table>
</body></html>`,
  };
}