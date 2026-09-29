import type { ShopFilters } from "@/types/catalog";

type RawSearchParams = Record<string, string | string[] | undefined>;

const VALID_SORTS = new Set(["featured", "newest", "price_asc", "price_desc", "name"]);

export function parseShopSearchParams(
  searchParams: RawSearchParams,
  overrides: Partial<ShopFilters> = {},
): ShopFilters {
  const brandParam = searchParams.brand;
  const brandSlugs = Array.isArray(brandParam) ? brandParam : brandParam ? [brandParam] : undefined;

  const sortParam = typeof searchParams.sort === "string" ? searchParams.sort : undefined;
  const sort = sortParam && VALID_SORTS.has(sortParam) ? (sortParam as ShopFilters["sort"]) : "featured";

  const minPrice = typeof searchParams.min === "string" ? Number(searchParams.min) : undefined;
  const maxPrice = typeof searchParams.max === "string" ? Number(searchParams.max) : undefined;
  const page = typeof searchParams.page === "string" ? Number(searchParams.page) : undefined;
  const query = typeof searchParams.q === "string" ? searchParams.q : undefined;

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
