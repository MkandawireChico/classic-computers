"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { PRODUCT_TYPES } from "@/schemas/admin/product";
import { createProductAction, updateProductAction } from "@/app/admin/products/actions";
import type { BrandSummary } from "@/types/catalog";
import type { CategorySummary } from "@/types/catalog";

interface ProductFormValues {
  id?: string;
  name: string;
  slug: string;
  sku: string;
  brandId: string | null;
  categoryId: string;
  productType: string;
  condition: string;
  description: string | null;
  basePrice: number;
  salePrice: number | null;
  warrantyText: string | null;
  status: string;
  isFeatured: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function ProductForm({
  initial,
  brands,
  categories,
}: {
  initial?: ProductFormValues;
  brands: BrandSummary[];
  categories: CategorySummary[];
}) {
  const router = useRouter();
  const isEdit = Boolean(initial?.id);
  const [values, setValues] = useState<ProductFormValues>(
    initial ?? {
      name: "",
      slug: "",
      sku: "",
      brandId: null,
      categoryId: categories[0]?.id ?? "",
      productType: "laptop",
      condition: "new",
      description: "",
      basePrice: 0,
      salePrice: null,
      warrantyText: "",
      status: "draft",
      isFeatured: false,
      seoTitle: "",
      seoDescription: "",
    },
  );

  useEffect(() => {
    if (initial) {
      setValues(initial);
    }
  }, [initial]);

  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function update<K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = isEdit
        ? await updateProductAction({ ...values, id: initial!.id })
        : await createProductAction(values);

      if (!result.success) {
        setError(result.error);
        return;
      }
      if (isEdit) {
        router.refresh();
      } else {
        router.push(`/admin/products/${(result.data as { id: string }).id}`);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
      {error ? <Alert variant="danger">{error}</Alert> : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1 sm:col-span-2">
          <label className="text-sm font-medium text-gray-700">Name</label>
          <input
            required
            value={values.name}
            onChange={(e) => {
              update("name", e.target.value);
              if (!slugTouched) update("slug", slugify(e.target.value));
            }}
            className="w-full rounded-card border border-surface-border px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Slug</label>
          <input
            required
            value={values.slug}
            onChange={(e) => {
              setSlugTouched(true);
              update("slug", e.target.value);
            }}
            className="w-full rounded-card border border-surface-border px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">SKU</label>
          <input
            required
            value={values.sku}
            onChange={(e) => update("sku", e.target.value)}
            className="w-full rounded-card border border-surface-border px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Brand</label>
          <select
            value={values.brandId ?? ""}
            onChange={(e) => update("brandId", e.target.value || null)}
            className="w-full rounded-card border border-surface-border px-3 py-2 text-sm"
          >
            <option value="">No brand</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Category</label>
          <select
            required
            value={values.categoryId}
            onChange={(e) => update("categoryId", e.target.value)}
            className="w-full rounded-card border border-surface-border px-3 py-2 text-sm"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Product type</label>
          <select
            value={values.productType}
            onChange={(e) => update("productType", e.target.value)}
            className="w-full rounded-card border border-surface-border px-3 py-2 text-sm"
          >
            {PRODUCT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Condition</label>
          <select
            value={values.condition}
            onChange={(e) => update("condition", e.target.value)}
            className="w-full rounded-card border border-surface-border px-3 py-2 text-sm"
          >
            <option value="new">New</option>
            <option value="refurbished">Refurbished</option>
            <option value="used">Used</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Status</label>
          <select
            value={values.status}
            onChange={(e) => update("status", e.target.value)}
            className="w-full rounded-card border border-surface-border px-3 py-2 text-sm"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Base price (MWK)</label>
          <input
            required
            type="number"
            min={0}
            value={values.basePrice}
            onChange={(e) => update("basePrice", Number(e.target.value))}
            className="w-full rounded-card border border-surface-border px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Sale price (optional)</label>
          <input
            type="number"
            min={0}
            value={values.salePrice ?? ""}
            onChange={(e) => update("salePrice", e.target.value ? Number(e.target.value) : null)}
            className="w-full rounded-card border border-surface-border px-3 py-2 text-sm"
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-700 sm:col-span-2">
          <input
            type="checkbox"
            checked={values.isFeatured}
            onChange={(e) => update("isFeatured", e.target.checked)}
            className="h-4 w-4 rounded border-surface-border text-brand-500"
          />
          Featured on homepage
        </label>

        <div className="space-y-1 sm:col-span-2">
          <label className="text-sm font-medium text-gray-700">Description</label>
          <textarea
            rows={4}
            value={values.description ?? ""}
            onChange={(e) => update("description", e.target.value)}
            className="w-full rounded-card border border-surface-border px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-1 sm:col-span-2">
          <label className="text-sm font-medium text-gray-700">Warranty</label>
          <input
            value={values.warrantyText ?? ""}
            onChange={(e) => update("warrantyText", e.target.value)}
            className="w-full rounded-card border border-surface-border px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">SEO title (optional)</label>
          <input
            value={values.seoTitle ?? ""}
            onChange={(e) => update("seoTitle", e.target.value)}
            className="w-full rounded-card border border-surface-border px-3 py-2 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">SEO description (optional)</label>
          <input
            value={values.seoDescription ?? ""}
            onChange={(e) => update("seoDescription", e.target.value)}
            className="w-full rounded-card border border-surface-border px-3 py-2 text-sm"
          />
        </div>
      </div>

      <Button type="submit" isLoading={isPending}>
        {isEdit ? "Save changes" : "Create product"}
      </Button>
    </form>
  );
}
