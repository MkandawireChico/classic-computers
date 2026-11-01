import "server-only";
import { z } from "zod";
import { requirePermission } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";

export interface ProductInterestSummary {
  id: string;
  name: string;
  views: number;
  carts: number;
  wishlists: number;
  contacts: number;
  orders: number;
}

export interface SearchInterestSummary {
  search_term: string;
  searches: number;
  no_results: number;
}

export interface CategoryInterestSummary {
  id: string;
  name: string;
  views: number;
}

export interface CustomerInterestAnalytics {
  totalEvents: number;
  uniqueVisitors: number;
  returningVisitors: number;
  pageViews: number;
  productViews: number;
  searches: number;
  noResultSearches: number;
  cartAdds: number;
  wishlistAdds: number;
  rentalRequests: number;
  repairRequests: number;
  corporateRequests: number;
  checkoutStarts: number;
  ordersPlaced: number;
  visitorConversionPercent: number | null;
  topProducts: ProductInterestSummary[];
  topSearches: SearchInterestSummary[];
  topCategories: CategoryInterestSummary[];
}

const analyticsSchema = z.object({
  totalEvents: z.number().nonnegative(),
  uniqueVisitors: z.number().nonnegative(),
  returningVisitors: z.number().nonnegative(),
  pageViews: z.number().nonnegative(),
  productViews: z.number().nonnegative(),
  searches: z.number().nonnegative(),
  noResultSearches: z.number().nonnegative(),
  cartAdds: z.number().nonnegative(),
  wishlistAdds: z.number().nonnegative(),
  rentalRequests: z.number().nonnegative(),
  repairRequests: z.number().nonnegative(),
  corporateRequests: z.number().nonnegative(),
  checkoutStarts: z.number().nonnegative(),
  ordersPlaced: z.number().nonnegative(),
  visitorConversionPercent: z.number().nonnegative().nullable(),
  topProducts: z.array(
    z.object({
      id: z.string().uuid(),
      name: z.string(),
      views: z.number().nonnegative(),
      carts: z.number().nonnegative(),
      wishlists: z.number().nonnegative(),
      contacts: z.number().nonnegative(),
      orders: z.number().nonnegative(),
    }),
  ),
  topSearches: z.array(
    z.object({
      search_term: z.string(),
      searches: z.number().nonnegative(),
      no_results: z.number().nonnegative(),
    }),
  ),
  topCategories: z.array(
    z.object({
      id: z.string().uuid(),
      name: z.string(),
      views: z.number().nonnegative(),
    }),
  ),
});

export async function getAdminCustomerInterestAnalytics(
  from: Date,
  to: Date,
): Promise<CustomerInterestAnalytics> {
  await requirePermission("reports.read");
  if (
    !Number.isFinite(from.getTime()) ||
    !Number.isFinite(to.getTime()) ||
    to <= from ||
    to.getTime() - from.getTime() > 180 * 24 * 60 * 60 * 1000
  ) {
    throw new Error("Choose a valid analytics period of 180 days or less.");
  }

  const supabase = createClient();
  const { data, error } = await (supabase.rpc as any)("get_admin_customer_interest_analytics", {
    p_from: from.toISOString(),
    p_to: to.toISOString(),
  });
  if (error) {
    console.error("Could not load customer interest analytics:", error.message);
    throw new Error("Could not load customer interest analytics.");
  }
  const parsed = analyticsSchema.safeParse(data);
  if (!parsed.success) {
    console.error("Customer interest analytics returned an unexpected response shape.");
    throw new Error("Could not load customer interest analytics.");
  }
  return parsed.data;
}
