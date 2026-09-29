"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { createBrandAction, updateBrandAction, deleteBrandAction } from "@/app/admin/taxonomy-actions";
import type { BrandSummary } from "@/types/catalog";

function slugify(v: string) {
  return v.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function BrandsManager({ brands }: { brands: BrandSummary[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [newBrand, setNewBrand] = useState({ name: "", slug: "" });
  const [edits, setEdits] = useState<Record<string, { name: string; slug: string }>>({});

  function editValue(b: BrandSummary) {
    return edits[b.id] ?? { name: b.name, slug: b.slug };
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createBrandAction({ name: newBrand.name, slug: newBrand.slug || slugify(newBrand.name) });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setNewBrand({ name: "", slug: "" });
      router.refresh();
    });
  }

  function handleSave(b: BrandSummary) {
    const v = editValue(b);
    startTransition(async () => {
      const result = await updateBrandAction({ id: b.id, name: v.name, slug: v.slug });
      if (!result.success) setError(result.error);
      else router.refresh();
    });
  }

  function handleDelete(id: string) {
    setError(null);
    startTransition(async () => {
      const result = await deleteBrandAction(id);
      if (!result.success) setError(result.error);
      else router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {error ? <Alert variant="danger">{error}</Alert> : null}

      <div className="overflow-x-auto rounded-card border border-surface-border">
        <table className="w-full min-w-[400px] text-sm">
          <thead className="bg-surface-muted text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="p-2">Name</th>
              <th className="p-2">Slug</th>
              <th className="p-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {brands.map((b) => {
              const v = editValue(b);
              return (
                <tr key={b.id}>
                  <td className="p-2">
                    <input
                      value={v.name}
                      onChange={(e) => setEdits((s) => ({ ...s, [b.id]: { ...v, name: e.target.value } }))}
                      className="w-full rounded border border-surface-border px-2 py-1 text-sm"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      value={v.slug}
                      onChange={(e) => setEdits((s) => ({ ...s, [b.id]: { ...v, slug: e.target.value } }))}
                      className="w-full rounded border border-surface-border px-2 py-1 text-sm"
                    />
                  </td>
                  <td className="space-x-2 whitespace-nowrap p-2 text-right">
                    <button type="button" disabled={isPending} onClick={() => handleSave(b)} className="text-xs text-brand-600 hover:underline">
                      Save
                    </button>
                    <button type="button" disabled={isPending} onClick={() => handleDelete(b.id)} className="text-xs text-status-danger hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <form onSubmit={handleCreate} className="flex max-w-md flex-wrap items-end gap-2">
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-700">Name</label>
          <input
            required
            value={newBrand.name}
            onChange={(e) => setNewBrand((v) => ({ ...v, name: e.target.value, slug: v.slug || slugify(e.target.value) }))}
            className="rounded-card border border-surface-border px-2 py-1.5 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-700">Slug</label>
          <input
            value={newBrand.slug}
            onChange={(e) => setNewBrand((v) => ({ ...v, slug: e.target.value }))}
            className="rounded-card border border-surface-border px-2 py-1.5 text-sm"
          />
        </div>
        <Button type="submit" size="sm" isLoading={isPending}>
          Add brand
        </Button>
      </form>
    </div>
  );
}
