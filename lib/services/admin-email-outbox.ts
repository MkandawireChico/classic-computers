import "server-only";

import nodemailer from "nodemailer";
import { getPermissionsForUser } from "@/lib/auth/permissions";
import { getCurrentUser } from "@/lib/auth/current-user";
import { createAdminClient } from "@/lib/supabase/server-admin";
import { buildAdminRequestEmail, type AdminEmailPayload } from "@/lib/email/admin-request-templates";

export type AdminEmailRequestType =
  | "general_enquiry"
  | "corporate_enquiry"
  | "rental_booking"
  | "repair_ticket"
  | "student_verification"
  | "order_placed"
  | "review_submitted";

type OutboxRow = {
  id: string;
  request_type: AdminEmailRequestType;
  request_id: string;
  recipient: string | null;
  payload: AdminEmailPayload;
  status: "pending" | "sending" | "sent" | "failed";
  attempt_count: number;
};

const REQUIRED_FROM = "notifications@classiccomputers.mw";
const REQUIRED_TO = "admin@classiccomputers.mw";
const VIEW_PERMISSIONS: Record<AdminEmailRequestType, string> = {
  general_enquiry: "customers.read",
  corporate_enquiry: "customers.read",
  rental_booking: "rentals.read",
  repair_ticket: "repairs.read",
  student_verification: "students.read",
  order_placed: "orders.read",
  review_submitted: "reviews.read",
};
const RETRY_PERMISSIONS: Record<AdminEmailRequestType, string> = {
  general_enquiry: "customers.write",
  corporate_enquiry: "customers.write",
  rental_booking: "rentals.write",
  repair_ticket: "repairs.write",
  student_verification: "students.verify",
  order_placed: "orders.write",
  review_submitted: "reviews.moderate",
};

let cachedTransport: ReturnType<typeof nodemailer.createTransport> | null = null;

function safeErrorCode(error: unknown): string {
  if (error && typeof error === "object" && "code" in error && typeof error.code === "string") {
    return error.code.slice(0, 80);
  }
  if (error instanceof Error && /^[A-Z0-9_]{1,80}$/.test(error.message)) return error.message;
  return "SMTP_DELIVERY_ERROR";
}

function getTransport() {
  if (cachedTransport) return cachedTransport;

  const host = process.env.SMTP_HOST?.trim();
  const port = Number(process.env.SMTP_PORT ?? "587");
  const user = process.env.SMTP_USER?.trim();
  const password = process.env.SMTP_PASSWORD;
  const from = (process.env.SMTP_FROM_EMAIL || REQUIRED_FROM).trim().toLowerCase();
  const recipient = (process.env.ADMIN_NOTIFICATION_EMAIL || REQUIRED_TO).trim().toLowerCase();

  if (!host || !Number.isInteger(port) || port < 1 || port > 65535 || !user || !password) {
    throw new Error("SMTP_CONFIGURATION_INCOMPLETE");
  }
  if (from !== REQUIRED_FROM || recipient !== REQUIRED_TO) {
    throw new Error("SMTP_NOTIFICATION_ADDRESSES_INVALID");
  }

  cachedTransport = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    requireTLS: port !== 465,
    auth: { user, pass: password },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
  });
  return cachedTransport;
}

async function loadNotification(requestType: AdminEmailRequestType, requestId: string): Promise<OutboxRow | null> {
  const supabase = createAdminClient();
  const { data, error } = await (supabase as any).from("admin_email_outbox")
    .select("id, request_type, request_id, recipient, payload, status, attempt_count")
    .eq("request_type", requestType)
    .eq("request_id", requestId)
    .maybeSingle();
  if (error) throw new Error("OUTBOX_LOOKUP_FAILED");
  return (data as OutboxRow | null) ?? null;
}

export async function findNotificationRequestId(
  requestType: AdminEmailRequestType,
  submissionKey: string,
): Promise<string | null> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await (supabase as any).from("admin_email_outbox")
      .select("request_id")
      .eq("request_type", requestType)
      .eq("submission_key", submissionKey)
      .maybeSingle();
    if (error) return null;
    return data?.request_id ?? null;
  } catch {
    return null;
  }
}

async function enrichOrderPayload(notification: OutboxRow): Promise<AdminEmailPayload> {
  if (notification.request_type !== "order_placed") return notification.payload;
  const supabase = createAdminClient();
  const [{ data: order }, { data: items }] = await Promise.all([
    (supabase.from("orders") as any)
      .select("id, order_number, total, currency, payment_method, payment_status, fulfillment_type, created_at")
      .eq("id", notification.request_id)
      .maybeSingle(),
    (supabase.from("order_items") as any)
      .select("product_name_snapshot, quantity")
      .eq("order_id", notification.request_id),
  ]);
  if (!order) return notification.payload;

  return {
    ...notification.payload,
    reference: order.order_number,
    total: String(order.total),
    currency: order.currency,
    payment_method: order.payment_method,
    payment_status: order.payment_status,
    fulfillment_type: order.fulfillment_type,
    submitted_at: order.created_at,
    items: items ?? [],
  };
}

export async function deliverAdminEmailForRequest(
  requestType: AdminEmailRequestType,
  requestId: string,
): Promise<void> {
  let row: OutboxRow | null = null;
  try {
    row = await loadNotification(requestType, requestId);
    if (!row || row.status === "sent" || row.status === "sending") return;

    const supabase = createAdminClient();
    const { data: claimed, error: claimError } = await (supabase as any).from("admin_email_outbox")
      .update({
        status: "sending",
        recipient: REQUIRED_TO,
        attempt_count: row.attempt_count + 1,
        last_attempt_at: new Date().toISOString(),
        last_error: null,
      })
      .eq("id", row.id)
      .in("status", ["pending", "failed"])
      .select("id")
      .maybeSingle();
    if (claimError || !claimed) return;

    const payload = await enrichOrderPayload(row);
    const content = buildAdminRequestEmail(requestType, requestId, payload);
    const from = `Classic Computers Notifications <${REQUIRED_FROM}>`;
    const transport = getTransport();
    const result = await transport.sendMail({
      from,
      to: REQUIRED_TO,
      replyTo: content.replyTo,
      subject: content.subject,
      text: content.text,
      html: content.html,
    });

    if (!result.accepted?.length) throw new Error("SMTP_RECIPIENT_REJECTED");

    const { error: sentError } = await (supabase as any).from("admin_email_outbox")
      .update({ status: "sent", sent_at: new Date().toISOString(), last_error: null })
      .eq("id", row.id)
      .eq("status", "sending");
    if (sentError) {
      console.error("Admin email accepted but outbox update failed", { notificationId: row.id });
    }
  } catch (error) {
    const code = safeErrorCode(error);
    if (row) {
      try {
        const supabase = createAdminClient();
        await (supabase as any).from("admin_email_outbox")
          .update({ status: "failed", last_error: code })
          .eq("id", row.id)
          .eq("status", "sending");
      } catch {
        // The request and pending outbox row remain committed if delivery fails.
      }
      console.error("Admin email delivery failed", { notificationId: row.id, requestType, code });
    } else {
      console.error("Admin email outbox dispatch could not start", { requestType, requestId, code });
    }
  }
}

export async function getAdminEmailOutboxForPermissions(permissions: Set<string>) {
  const allowedTypes = (Object.keys(VIEW_PERMISSIONS) as AdminEmailRequestType[])
    .filter((type) => permissions.has(VIEW_PERMISSIONS[type]));
  if (allowedTypes.length === 0) return [];

  const supabase = createAdminClient();
  const { data, error } = await (supabase as any).from("admin_email_outbox")
    .select("id, request_type, request_id, recipient, payload, status, attempt_count, created_at, last_attempt_at, sent_at, last_error")
    .in("request_type", allowedTypes)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw new Error("Could not load email notifications.");
  return data ?? [];
}

export async function retryAdminEmailNotification(notificationId: string): Promise<{ success: true } | { success: false; error: string }> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Not signed in." };

  const permissions = await getPermissionsForUser(user.id);
  const supabase = createAdminClient();
  const { data, error } = await (supabase as any).from("admin_email_outbox")
    .select("request_type, request_id, status")
    .eq("id", notificationId)
    .maybeSingle();
  if (error || !data) return { success: false, error: "Notification not found." };

  const requestType = data.request_type as AdminEmailRequestType;
  if (!permissions.has(RETRY_PERMISSIONS[requestType])) {
    return { success: false, error: "You don't have permission to retry this notification." };
  }
  if (data.status === "sent" || data.status === "sending") {
    return { success: false, error: "This notification is already sent or currently sending." };
  }

  await deliverAdminEmailForRequest(requestType, data.request_id);
  const { data: updated } = await (supabase as any).from("admin_email_outbox")
    .select("status")
    .eq("id", notificationId)
    .maybeSingle();
  if (updated?.status === "sent") return { success: true };
  return { success: false, error: "Email delivery failed. The saved request is unchanged; check SMTP configuration and retry." };
}