"use client";

import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import type { BrandSummary } from "@/types/catalog";
import type { CategorySummary } from "@/types/catalog";

export function ShopFilters({ brands, categories = [] }: { brands: BrandSummary[]; categories?: CategorySummary[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [minPrice, setMinPrice] = useState(searchParams.get("min") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max") ?? "");
  const selectedBrands = new Set(searchParams.getAll("brand"));
  const availableOnly = searchParams.get("available") === "1";

  useEffect(() => {
    setMinPrice(searchParams.get("min") ?? "");
    setMaxPrice(searchParams.get("max") ?? "");
  }, [searchParams]);
  const activeFilterCount =
    selectedBrands.size +
    Number(Boolean(searchParams.get("min") || searchParams.get("max"))) +
    Number(availableOnly) +
    Number(Boolean(searchParams.get("q")));

  function updateParams(mutate: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  function clearAll() {
    router.push(pathname);
  }

  function toggleBrand(slug: string) {
    updateParams((params) => {
      const values = new Set(params.getAll("brand"));
      if (values.has(slug)) {
        values.delete(slug);
      } else {
        values.add(slug);
      }
      params.delete("brand");
      values.forEach((v) => params.append("brand", v));
    });
  }

  function toggleAvailable() {
    updateParams((params) => {
      if (params.get("available") === "1") {
        params.delete("available");
      } else {
        params.set("available", "1");
      }
    });
  }

  function submitPriceRange(e: FormEvent) {
    e.preventDefault();
    updateParams((params) => {
      if (minPrice) params.set("min", minPrice);
      else params.delete("min");
      if (maxPrice) params.set("max", maxPrice);
      else params.delete("max");
    });
  }

  function removeParam(key: string, value?: string) {
    updateParams((params) => {
      if (key === "brand" && value) {
        const values = params.getAll("brand").filter((brand) => brand !== value);
        params.delete("brand");
        values.forEach((brand) => params.append("brand", brand));
      } else if (key === "price") {
        params.delete("min");
        params.delete("max");
      } else {
        params.delete(key);
      }
    });
  }

  function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
    return (
      <button
        type="button"
        onClick={onRemove}
        className="inline-flex min-h-8 items-center gap-1.5 rounded-md border border-brand-100 bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-800 hover:bg-brand-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        aria-label={`Remove ${label} filter`}
      >
        {label}<span aria-hidden="true" className="text-sm leading-none">×</span>
      </button>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-gray-900">Filters</h2>
        {activeFilterCount > 0 ? (
          <button
            type="button"
            onClick={clearAll}
            className="text-xs font-medium text-brand-700 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            Clear all
          </button>
        ) : null}
      </div>

      {activeFilterCount > 0 ? (
        <div className="space-y-2 border-b border-surface-border pb-4">
          <p className="text-xs font-medium text-gray-500">Active filters</p>
          <div className="flex flex-wrap gap-2">
            {searchParams.get("q") ? (
              <FilterChip label={`Search: ${searchParams.get("q")}`} onRemove={() => removeParam("q")} />
            ) : null}
            {Array.from(selectedBrands).map((slug) => {
              const brand = brands.find((item) => item.slug === slug);
              return <FilterChip key={slug} label={brand?.name ?? slug} onRemove={() => removeParam("brand", slug)} />;
            })}
            {searchParams.get("min") || searchParams.get("max") ? (
              <FilterChip
                label={`Price: ${searchParams.get("min") || "0"} – ${searchParams.get("max") || "any"}`}
                onRemove={() => removeParam("price")}
              />
            ) : null}
            {availableOnly ? <FilterChip label="In stock" onRemove={() => removeParam("available")} /> : null}
          </div>
        </div>
      ) : null}

      <fieldset className="border-b border-surface-border pb-4">
        <legend className="mb-2 text-sm font-semibold text-gray-900">Availability</legend>
        <label className="flex min-h-10 items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={availableOnly}
            onChange={toggleAvailable}
            className="h-4 w-4 rounded border-surface-border text-brand-600 focus:ring-brand-500"
          />
          In stock only
        </label>
      </fieldset>

      {categories.length > 0 ? (
        <details className="border-b border-surface-border pb-4">
          <summary className="cursor-pointer list-none text-sm font-semibold text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
            <span className="flex items-center justify-between">Category <span aria-hidden="true" className="text-gray-400">+</span></span>
          </summary>
          <nav aria-label="Shop categories" className="mt-3 max-h-48 space-y-1 overflow-y-auto">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/shop/${category.slug}`}
                className="block rounded px-2 py-1.5 text-sm text-gray-700 hover:bg-surface-muted hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                {category.name}
              </Link>
            ))}
          </nav>
        </details>
      ) : null}

      {brands.length > 0 ? (
        <details className="border-b border-surface-border pb-4">
          <summary className="cursor-pointer list-none text-sm font-semibold text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
            <span className="flex items-center justify-between">Brand <span aria-hidden="true" className="text-gray-400">+</span></span>
          </summary>
          <fieldset className="mt-3 max-h-48 space-y-1 overflow-y-auto">
            <legend className="sr-only">Brand</legend>
            {brands.map((brand) => (
              <label key={brand.id} className="flex min-h-9 items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={selectedBrands.has(brand.slug)}
                  onChange={() => toggleBrand(brand.slug)}
                  className="h-4 w-4 rounded border-surface-border text-brand-600 focus:ring-brand-500"
                />
                {brand.name}
              </label>
            ))}
          </fieldset>
        </details>
      ) : null}

      <details className="pb-2">
        <summary className="cursor-pointer list-none text-sm font-semibold text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
          <span className="flex items-center justify-between">Price (MWK) <span aria-hidden="true" className="text-gray-400">+</span></span>
        </summary>
        <form onSubmit={submitPriceRange} className="mt-3 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <label className="space-y-1 text-xs text-gray-500">
              <span>Minimum</span>
              <input
                type="number"
                min="0"
                inputMode="numeric"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="h-10 w-full rounded-md border border-surface-border bg-white px-2 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </label>
            <label className="space-y-1 text-xs text-gray-500">
              <span>Maximum</span>
              <input
                type="number"
                min="0"
                inputMode="numeric"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="h-10 w-full rounded-md border border-surface-border bg-white px-2 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </label>
          </div>
          <Button type="submit" size="sm" variant="outline" className="w-full">Apply price</Button>
        </form>
      </details>
    </div>
  );
}
