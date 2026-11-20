import type { ShopFilters } from "@/types/catalog";

type RawSearchParams = Record<string, string | string[] | undefined>;

const VALID_SORTS = new Set(["featured", "newest", "price_asc", "price_desc", "name"]);

function readSingleValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return typeof value === "string" ? value : undefined;
}

export function parseShopSearchParams(
  searchParams: RawSearchParams,
  overrides: Partial<ShopFilters> = {},
): ShopFilters {
  const brandParam = searchParams.brand;
  const brandSlugs = Array.isArray(brandParam) ? brandParam : brandParam ? [brandParam] : undefined;

  const sortParam = readSingleValue(searchParams.sort);
  const sort = sortParam && VALID_SORTS.has(sortParam) ? (sortParam as ShopFilters["sort"]) : "featured";

  const minRaw = readSingleValue(searchParams.min)?.trim();
  const maxRaw = readSingleValue(searchParams.max)?.trim();
  const parsedMin = minRaw ? Number(minRaw) : undefined;
  const parsedMax = maxRaw ? Number(maxRaw) : undefined;
  const validMin = parsedMin !== undefined && Number.isFinite(parsedMin) && parsedMin >= 0 ? parsedMin : undefined;
  const validMax = parsedMax !== undefined && Number.isFinite(parsedMax) && parsedMax >= 0 ? parsedMax : undefined;
  const validPriceRange = validMin === undefined || validMax === undefined || validMin <= validMax;
  const minPrice = validPriceRange ? validMin : undefined;
  const maxPrice = validPriceRange ? validMax : undefined;
  const requestedPage = typeof searchParams.page === "string" ? Number(searchParams.page) : undefined;
  const page = requestedPage !== undefined && Number.isSafeInteger(requestedPage) && requestedPage > 0
    ? requestedPage
    : 1;
  const query = readSingleValue(searchParams.q) ?? readSingleValue(searchParams.query) ?? overrides.query;

  return {
    brandSlugs,
    sort,
    minPrice: Number.isFinite(minPrice) ? minPrice : undefined,
    maxPrice: Number.isFinite(maxPrice) ? maxPrice : undefined,
    availableOnly: searchParams.available === "1",
    page: Number.isFinite(page) && page! > 0 ? page : 1,
    pageSize: 24,
    query,
    ...overrides,
  };
}
