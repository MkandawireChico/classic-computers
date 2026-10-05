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

  const minPrice = typeof searchParams.min === "string" ? Number(searchParams.min) : undefined;
  const maxPrice = typeof searchParams.max === "string" ? Number(searchParams.max) : undefined;
  const page = typeof searchParams.page === "string" ? Number(searchParams.page) : undefined;
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
