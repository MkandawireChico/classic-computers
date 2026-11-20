"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "name", label: "Name" },
];

export function SortSelect() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const requestedSort = searchParams.get("sort") ?? "featured";
  const current = SORT_OPTIONS.some((option) => option.value === requestedSort) ? requestedSort : "featured";

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "featured") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }
    params.delete("page");
    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname);
  }

  return (
    <label className="flex min-h-10 w-full items-center justify-between gap-2 text-sm text-gray-700 sm:w-auto sm:justify-start">
      <span className="shrink-0 font-medium">Sort by</span>
      <select
        value={current}
        onChange={(e) => handleChange(e.target.value)}
        aria-label="Sort products"
        className="h-10 min-w-0 flex-1 rounded-md border border-surface-border bg-white px-3 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 sm:min-w-36 sm:flex-none"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
