import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { requirePermission } from "@/lib/auth/permissions";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { getAdminCustomerInterestAnalytics } from "@/lib/data/admin/interest-analytics";

type SearchParams = Record<string, string | string[] | undefined>;

const DAY_MS = 24 * 60 * 60 * 1000;

function firstString(value: string | string[] | undefined): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function todayInMalawi(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Blantyre",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function parseDate(value: string | undefined): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00+02:00`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value ? null : date;
}

function getRange(params: SearchParams): {
  from: Date;
  to: Date;
  preset: string;
  invalidCustomRange: boolean;
} {
  const preset = firstString(params.period);
  const now = new Date();
  if (preset === "today") {
    return { from: parseDate(todayInMalawi())!, to: now, preset, invalidCustomRange: false };
  }
  if (preset === "7" || preset === "30" || preset === "90") {
    return {
      from: new Date(now.getTime() - Number(preset) * DAY_MS),
      to: now,
      preset,
      invalidCustomRange: false,
    };
  }
  if (preset === "custom") {
    const from = parseDate(firstString(params.from));
    const toDate = parseDate(firstString(params.to));
    const today = parseDate(todayInMalawi());
    if (from && toDate && today && toDate >= from && toDate <= today) {
      const to = new Date(toDate.getTime() + DAY_MS);
      if (to.getTime() - from.getTime() <= 180 * DAY_MS) {
        return { from, to, preset, invalidCustomRange: false };
      }
    }
    return {
      from: new Date(now.getTime() - 30 * DAY_MS),
      to: now,
      preset: "30",
      invalidCustomRange: true,
    };
  }
  return {
    from: new Date(now.getTime() - 30 * DAY_MS),
    to: now,
    preset: "30",
    invalidCustomRange: false,
  };
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-MW").format(value);
}

function formatPercent(value: number | null): string {
  return value === null ? "—" : `${value.toFixed(1)}%`;
}

function periodChange(current: number, previous: number): string {
  if (previous === 0) return current === 0 ? "0%" : "New";
  const change = ((current - previous) / previous) * 100;
  return `${change > 0 ? "+" : ""}${change.toFixed(1)}%`;
}

export default async function AdminAnalyticsPage({ searchParams }: { searchParams: SearchParams }) {
  await requirePermission("reports.read");
  const { from, to, preset, invalidCustomRange } = getRange(searchParams);
  const periodDuration = to.getTime() - from.getTime();
  const [analytics, previousAnalytics] = await Promise.all([
    getAdminCustomerInterestAnalytics(from, to),
    getAdminCustomerInterestAnalytics(new Date(from.getTime() - periodDuration), from),
  ]);
  const hasData = analytics.totalEvents > 0;
  const highViewLowEnquiry = analytics.topProducts.filter(
    (product) => product.views >= 5 && product.contacts === 0,
  );
  const noResultTerms = [...analytics.topSearches]
    .filter((search) => search.no_results > 0)
    .sort((a, b) => b.no_results - a.no_results);
  const previousCategories = new Map(
    previousAnalytics.topCategories.map((category) => [category.id, category]),
  );
  const growingCategories = analytics.topCategories
    .flatMap((category) => {
      const previousCategory = previousCategories.get(category.id);
      return previousCategory ? [{ ...category, previousViews: previousCategory.views }] : [];
    })
    .filter((category) => category.views > category.previousViews)
    .sort((a, b) => b.views - b.previousViews - (a.views - a.previousViews));
  const comparisonMetrics: Array<[string, number, number]> = [
    ["Events", analytics.totalEvents, previousAnalytics.totalEvents],
    ["Consenting visitors", analytics.uniqueVisitors, previousAnalytics.uniqueVisitors],
    ["Product views", analytics.productViews, previousAnalytics.productViews],
    ["Orders placed", analytics.ordersPlaced, previousAnalytics.ordersPlaced],
  ];
  const overviewMetrics: Array<[string, number | string]> = [
    ["Events", analytics.totalEvents],
    ["Consenting visitors", analytics.uniqueVisitors],
    ["Returning visitors", analytics.returningVisitors],
    ["Page views", analytics.pageViews],
    ["Product views", analytics.productViews],
    ["Searches", analytics.searches],
    ["No-result searches", analytics.noResultSearches],
    ["Visitor-to-order rate", formatPercent(analytics.visitorConversionPercent)],
  ];
  const funnelMetrics: Array<[string, number]> = [
    ["Cart additions", analytics.cartAdds],
    ["Wishlist additions", analytics.wishlistAdds],
    ["Rental requests", analytics.rentalRequests],
    ["Repair requests", analytics.repairRequests],
    ["Corporate quotations", analytics.corporateRequests],
    ["Checkout starts", analytics.checkoutStarts],
    ["Orders placed", analytics.ordersPlaced],
  ];

  return (
    <div className="space-y-6">
      <header>
        <AdminPageHeader eyebrow="Reports · Store insights" title="Customer interest analytics" description="Understand opted-in customer activity across the storefront." />
        <p className="mt-1 text-sm text-gray-600">
          First-party activity from visitors who opted in to analytics. Counts describe observed
          activity, not guaranteed purchase intent.
        </p>
      </header>

      <form
        method="get"
        className="grid gap-3 rounded-card border border-surface-border bg-white p-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <label className="space-y-1 text-sm font-medium text-gray-700">
          Period
          <select
            name="period"
            defaultValue={preset}
            className="min-h-10 w-full rounded-card border border-surface-border bg-white px-3"
          >
            <option value="today">Today</option>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="custom">Custom date range</option>
          </select>
        </label>
        <label className="space-y-1 text-sm font-medium text-gray-700">
          From
          <input
            type="date"
            name="from"
            defaultValue={firstString(searchParams.from)}
            className="min-h-10 w-full rounded-card border border-surface-border px-3"
          />
        </label>
        <label className="space-y-1 text-sm font-medium text-gray-700">
          Through
          <input
            type="date"
            name="to"
            defaultValue={firstString(searchParams.to)}
            className="min-h-10 w-full rounded-card border border-surface-border px-3"
          />
        </label>
        <button
          type="submit"
          className="mt-auto min-h-10 rounded-card bg-brand-700 px-4 text-sm font-semibold text-white hover:bg-brand-800"
        >
          Apply dates
        </button>
      </form>

      {invalidCustomRange ? (
        <p role="status" className="rounded-card bg-amber-50 p-3 text-sm text-amber-900">
          Choose valid dates no later than today and within a 180-day range. Showing the last 30
          days instead.
        </p>
      ) : null}

      {!hasData ? (
        <div className="rounded-card border border-dashed border-surface-border bg-white p-8 text-center">
          <h2 className="font-semibold text-gray-900">No opt-in analytics for this period</h2>
          <p className="mt-2 text-sm text-gray-600">
            Activity will appear when visitors allow optional analytics and browse the site.
          </p>
        </div>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Compared with the previous equivalent period</CardTitle>
            </CardHeader>
            <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
              {comparisonMetrics.map(([label, current, previous]) => (
                <div key={label} className="rounded-lg bg-surface-muted p-3">
                  <p className="text-gray-600">{label}</p>
                  <p className="mt-1 font-semibold text-gray-900">
                    {periodChange(current, previous)}{" "}
                    <span className="font-normal text-gray-500">
                      ({formatNumber(current)} vs {formatNumber(previous)})
                    </span>
                  </p>
                </div>
              ))}
            </div>
          </Card>
          <section
            aria-label="Activity overview"
            className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
          >
            {overviewMetrics.map(([label, value]) => (
              <Card key={label}>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {label}
                </p>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {typeof value === "number" ? formatNumber(value) : value}
                </p>
              </Card>
            ))}
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Product interest</CardTitle>
              </CardHeader>
              {analytics.topProducts.length === 0 ? (
                <p className="text-sm text-gray-500">No product interest events recorded.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[620px] text-left text-sm">
                    <thead className="text-xs uppercase text-gray-500">
                      <tr>
                        <th className="py-2">Product</th>
                        <th className="p-2">Views</th>
                        <th className="p-2">Cart</th>
                        <th className="p-2">Wishlist</th>
                        <th className="p-2">Contact</th>
                        <th className="p-2">Orders</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-border">
                      {analytics.topProducts.map((product) => (
                        <tr key={product.id}>
                          <td className="py-2 font-medium text-gray-900">{product.name}</td>
                          <td className="p-2">{formatNumber(product.views)}</td>
                          <td className="p-2">{formatNumber(product.carts)}</td>
                          <td className="p-2">{formatNumber(product.wishlists)}</td>
                          <td className="p-2">{formatNumber(product.contacts)}</td>
                          <td className="p-2">{formatNumber(product.orders)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {highViewLowEnquiry.length > 0 ? (
                <div className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-950">
                  <p className="font-semibold">Observed views without tracked contact activity</p>
                  <p className="mt-1">
                    At least five opted-in views and no tracked contact click in this period:{" "}
                    {highViewLowEnquiry.map((product) => product.name).join(", ")}. This is a signal
                    to investigate, not proof of customer intent.
                  </p>
                </div>
              ) : null}
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Search interest</CardTitle>
              </CardHeader>
              {analytics.topSearches.length === 0 ? (
                <p className="text-sm text-gray-500">No search terms recorded.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[360px] text-left text-sm">
                    <thead className="text-xs uppercase text-gray-500">
                      <tr>
                        <th className="py-2">Term</th>
                        <th className="p-2">Searches</th>
                        <th className="p-2">No results</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-border">
                      {analytics.topSearches.map((search) => (
                        <tr key={search.search_term}>
                          <td className="py-2 font-medium text-gray-900">{search.search_term}</td>
                          <td className="p-2">{formatNumber(search.searches)}</td>
                          <td className="p-2">{formatNumber(search.no_results)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {noResultTerms.length > 0 ? (
                <p className="mt-4 text-sm text-gray-600">
                  <span className="font-semibold">Searches with no matches:</span>{" "}
                  {noResultTerms
                    .map((term) => `${term.search_term} (${formatNumber(term.no_results)})`)
                    .join(", ")}
                </p>
              ) : null}
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category interest</CardTitle>
              </CardHeader>
              {analytics.topCategories.length === 0 ? (
                <p className="text-sm text-gray-500">No category interest recorded.</p>
              ) : (
                <ul className="space-y-2">
                  {analytics.topCategories.map((category) => (
                    <li
                      key={category.id}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <span className="font-medium text-gray-900">{category.name}</span>
                      <span className="text-gray-600">
                        {formatNumber(category.views)} observed views
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              {growingCategories.length > 0 ? (
                <div className="mt-4 border-t border-surface-border pt-3">
                  <p className="mb-2 text-sm font-semibold text-gray-900">Largest view increases</p>
                  <ul className="space-y-2">
                    {growingCategories.slice(0, 3).map((category) => (
                      <li
                        key={category.id}
                        className="flex items-center justify-between gap-3 text-sm"
                      >
                        <span>{category.name}</span>
                        <span className="text-gray-600">
                          {periodChange(category.views, category.previousViews)} (
                          {category.views - category.previousViews > 0 ? "+" : ""}
                          {formatNumber(category.views - category.previousViews)})
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Service and checkout funnel</CardTitle>
              </CardHeader>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                {funnelMetrics.map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-gray-500">{label}</dt>
                    <dd className="mt-1 font-semibold text-gray-900">{formatNumber(value)}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-4 text-xs leading-5 text-gray-500">
                Checkout abandonment is not estimated: the event data cannot reliably distinguish a
                visitor who left from one who completed checkout in another session or declined
                analytics.
              </p>
            </Card>
          </section>
        </>
      )}
      <p className="text-xs text-gray-500">
        Activity is pseudonymous and only represents visitors who opted in. The visitor-to-order
        percentage is a measured ratio within the selected consenting audience, not a
        population-wide conversion estimate. A scheduled database purge must be configured to
        enforce the 180-day retention period.
      </p>
    </div>
  );
}
