"use client";

export const INTEREST_EVENT_CATEGORIES = {
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
} as const;

export type InterestEventName = keyof typeof INTEREST_EVENT_CATEGORIES;

export interface InterestEventInput {
  name: InterestEventName;
  pagePath?: string;
  productId?: string;
  categoryId?: string;
  searchTerm?: string;
  resultCount?: number;
  paymentMethod?: "pay_at_shop" | "bank_transfer" | "mobile_money" | "cash_on_delivery";
}

function hasAnalyticsConsent(): boolean {
  return typeof document !== "undefined" &&
    document.cookie.split("; ").some((cookie) => cookie === "site-analytics-consent=granted");
}

export function trackInterestEvent(event: InterestEventInput): void {
  if (typeof window === "undefined" || !hasAnalyticsConsent()) return;

  const pagePath = event.pagePath ?? window.location.pathname;
  if (!pagePath.startsWith("/") || pagePath.startsWith("//") || pagePath.includes("?") || pagePath.includes("#")) return;

  const body: Record<string, unknown> = {
    name: event.name,
    category: INTEREST_EVENT_CATEGORIES[event.name],
    pagePath: pagePath.startsWith("/checkout/confirmation/") ? "/checkout/confirmation" : pagePath,
  };
  if (event.productId) body.productId = event.productId;
  if (event.categoryId) body.categoryId = event.categoryId;
  if (event.searchTerm !== undefined) body.searchTerm = event.searchTerm;
  const metadata: Record<string, unknown> = {};
  if (event.resultCount !== undefined) metadata.result_count = event.resultCount;
  if (event.paymentMethod) metadata.payment_method = event.paymentMethod;
  if (Object.keys(metadata).length > 0) body.metadata = metadata;

  void fetch("/api/analytics/events", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    credentials: "same-origin",
    keepalive: true,
  }).catch((error: unknown) => {
    console.warn("Interest analytics request failed:", error);
  });
}
