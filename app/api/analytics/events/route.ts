import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const eventNames = [
  "page_view", "product_view", "product_gallery_opened",
  "search_performed", "search_no_results", "search_result_selected",
  "add_to_cart", "remove_from_cart", "add_to_wishlist", "product_enquiry_submitted",
  "rental_page_viewed", "rental_request_started", "rental_request_submitted",
  "repair_page_viewed", "repair_request_started", "repair_request_submitted",
  "corporate_page_viewed", "quotation_request_started", "quotation_request_submitted",
  "checkout_started", "payment_method_selected", "order_placed",
  "order_product_placed",
  "category_viewed", "student_deals_viewed", "contact_page_viewed",
  "whatsapp_clicked", "telephone_clicked", "email_clicked",
] as const;

const categories = ["navigation", "product", "search", "cart", "rental", "repair", "corporate", "checkout", "conversion", "contact"] as const;
type EventName = typeof eventNames[number];
type EventCategory = typeof categories[number];
const eventCategories: Record<EventName, EventCategory> = {
  page_view: "navigation",
  product_view: "product",
  product_gallery_opened: "product",
  search_performed: "search",
  search_no_results: "search",
  search_result_selected: "search",
  add_to_cart: "cart",
  remove_from_cart: "cart",
  add_to_wishlist: "product",
  product_enquiry_submitted: "product",
  rental_page_viewed: "rental",
  rental_request_started: "rental",
  rental_request_submitted: "rental",
  repair_page_viewed: "repair",
  repair_request_started: "repair",
  repair_request_submitted: "repair",
  corporate_page_viewed: "corporate",
  quotation_request_started: "corporate",
  quotation_request_submitted: "corporate",
  checkout_started: "checkout",
  payment_method_selected: "checkout",
  order_placed: "conversion",
  order_product_placed: "conversion",
  category_viewed: "navigation",
  student_deals_viewed: "navigation",
  contact_page_viewed: "contact",
  whatsapp_clicked: "contact",
  telephone_clicked: "contact",
  email_clicked: "contact",
};
const eventSchema = z.object({
  name: z.enum(eventNames),
  category: z.enum(categories),
  pagePath: z.string().min(1).max(255).regex(/^\/[^?#]*$/),
  productId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  searchTerm: z.string().trim().min(1).max(100).optional(),
  metadata: z.object({
    result_count: z.number().int().min(0).max(100000).optional(),
    payment_method: z.enum(["pay_at_shop", "bank_transfer", "mobile_money", "cash_on_delivery"]).optional(),
  }).strict().default({}),
}).strict();

function deviceCategory(userAgent: string): "mobile" | "tablet" | "desktop" | "unknown" {
  if (!userAgent) return "unknown";
  if (/ipad|tablet|kindle|silk/i.test(userAgent)) return "tablet";
  if (/mobile|iphone|ipod|android/i.test(userAgent)) return "mobile";
  return "desktop";
}

function isPrivatePath(path: string): boolean {
  return ["/admin", "/account", "/auth", "/sign-in", "/sign-up", "/reset-password", "/update-password"]
    .some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

function containsSensitiveSearchTerm(term: string): boolean {
  return /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(term)
    || /^\+?[\d\s().-]{7,}$/.test(term);
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      if (new URL(origin).origin !== request.nextUrl.origin) {
        return NextResponse.json({ error: "Cross-origin analytics requests are not accepted." }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ error: "Invalid request origin." }, { status: 400 });
    }
  }
  if (request.headers.get("sec-fetch-site") === "cross-site") {
    return NextResponse.json({ error: "Cross-origin analytics requests are not accepted." }, { status: 403 });
  }
  if (request.cookies.get("site-analytics-consent")?.value !== "granted") {
    return new NextResponse(null, { status: 204 });
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid analytics event." }, { status: 400 });
  }
  const parsed = eventSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid analytics event." }, { status: 400 });
  }
  const event = parsed.data;
  if (event.category !== eventCategories[event.name]) {
    return NextResponse.json({ error: "Analytics event category does not match its event name." }, { status: 400 });
  }
  if (isPrivatePath(event.pagePath)) {
    return NextResponse.json({ error: "Private account and administration pages are not tracked." }, { status: 400 });
  }
  if (event.searchTerm && containsSensitiveSearchTerm(event.searchTerm)) {
    return NextResponse.json({ error: "Search term is not stored for privacy reasons." }, { status: 400 });
  }

  const visitorId = request.cookies.get("interest-visitor-id")?.value;
  const sessionId = request.cookies.get("interest-session-id")?.value;
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const visitor = visitorId && uuidPattern.test(visitorId) ? visitorId : crypto.randomUUID();
  const session = sessionId && uuidPattern.test(sessionId) ? sessionId : crypto.randomUUID();
  const pagePath = event.pagePath.startsWith("/checkout/confirmation/") ? "/checkout/confirmation" : event.pagePath;

  const supabase = createClient();
  const { data: accepted, error } = await (supabase.rpc as any)("record_customer_interest_event", {
    p_event_name: event.name,
    p_event_category: eventCategories[event.name],
    p_visitor_id: visitor,
    p_session_id: session,
    p_page_path: pagePath,
    p_product_id: event.productId ?? null,
    p_category_id: event.categoryId ?? null,
    p_search_term: event.searchTerm ?? null,
    p_device_category: deviceCategory(request.headers.get("user-agent") ?? ""),
    p_metadata: event.metadata,
  });
  if (error) {
    console.error("Could not record customer interest event:", error.message);
    return NextResponse.json({ error: "Could not record analytics event." }, { status: 503 });
  }
  const response = accepted
    ? NextResponse.json({ accepted: true }, { status: 202 })
    : NextResponse.json({ error: "Analytics event rate limit reached." }, { status: 429 });
  const secure = process.env.NODE_ENV === "production";
  response.cookies.set("interest-visitor-id", visitor, {
    httpOnly: true, secure, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 180,
  });
  response.cookies.set("interest-session-id", session, {
    httpOnly: true, secure, sameSite: "lax", path: "/", maxAge: 60 * 30,
  });
  return response;
}

export async function DELETE() {
  const response = new NextResponse(null, { status: 204 });
  for (const name of ["interest-visitor-id", "interest-session-id"]) {
    response.cookies.set(name, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
  }
  return response;
}
