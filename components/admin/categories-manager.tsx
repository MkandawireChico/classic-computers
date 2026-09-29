"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
} from "@/app/admin/taxonomy-actions";
import type { CategorySummary } from "@/types/catalog";

function slugify(v: string) {
  return v.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function CategoriesManager({ categories }: { categories: CategorySummary[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [newCat, setNewCat] = useState({ name: "", slug: "", parentId: "" });
  const [edits, setEdits] = useState<Record<string, { name: string; slug: string; displayOrder: number }>>({});

  function editValue(cat: CategorySummary) {
    return edits[cat.id] ?? { name: cat.name, slug: cat.slug, displayOrder: cat.display_order };
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createCategoryAction({
        name: newCat.name,
        slug: newCat.slug || slugify(newCat.name),
        parentId: newCat.parentId || null,
        displayOrder: categories.length,
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setNewCat({ name: "", slug: "", parentId: "" });
      router.refresh();
    });
  }

  function handleSave(cat: CategorySummary) {
    const v = editValue(cat);
    startTransition(async () => {
      const result = await updateCategoryAction({
        id: cat.id,
        name: v.name,
        slug: v.slug,
        parentId: cat.parent_id,
        displayOrder: v.displayOrder,
      });
      if (!result.success) setError(result.error);
      else router.refresh();
    });
  }

  function handleDelete(id: string) {
    setError(null);
    startTransition(async () => {
      const result = await deleteCategoryAction(id);
      if (!result.success) setError(result.error);
      else router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {error ? <Alert variant="danger">{error}</Alert> : null}

      <div className="overflow-x-auto rounded-card border border-surface-border">
        <table className="w-full min-w-[500px] text-sm">
          <thead className="bg-surface-muted text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="p-2">Name</th>
              <th className="p-2">Slug</th>
              <th className="p-2">Order</th>
              <th className="p-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {categories.map((cat) => {
              const v = editValue(cat);
              return (
                <tr key={cat.id}>
                  <td className="p-2">
                    <input
                      value={v.name}
                      onChange={(e) => setEdits((s) => ({ ...s, [cat.id]: { ...v, name: e.target.value } }))}
                      className="w-full rounded border border-surface-border px-2 py-1 text-sm"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      value={v.slug}
                      onChange={(e) => setEdits((s) => ({ ...s, [cat.id]: { ...v, slug: e.target.value } }))}
                      className="w-full rounded border border-surface-border px-2 py-1 text-sm"
                    />
                  </td>
                  <td className="p-2 w-20">
                    <input
                      type="number"
                      value={v.displayOrder}
                      onChange={(e) => setEdits((s) => ({ ...s, [cat.id]: { ...v, displayOrder: Number(e.target.value) } }))}
                      className="w-full rounded border border-surface-border px-2 py-1 text-sm"
                    />
                  </td>
                  <td className="space-x-2 whitespace-nowrap p-2 text-right">
                    <button type="button" disabled={isPending} onClick={() => handleSave(cat)} className="text-xs text-brand-600 hover:underline">
                      Save
                    </button>
                    <button type="button" disabled={isPending} onClick={() => handleDelete(cat.id)} className="text-xs text-status-danger hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <form onSubmit={handleCreate} className="flex max-w-lg flex-wrap items-end gap-2">
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-700">Name</label>
          <input
            required
            value={newCat.name}
            onChange={(e) => setNewCat((v) => ({ ...v, name: e.target.value, slug: v.slug || slugify(e.target.value) }))}
            className="rounded-card border border-surface-border px-2 py-1.5 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-700">Slug</label>
          <input
            value={newCat.slug}
            onChange={(e) => setNewCat((v) => ({ ...v, slug: e.target.value }))}
            className="rounded-card border border-surface-border px-2 py-1.5 text-sm"
          />
        </div>
        <Button type="submit" size="sm" isLoading={isPending}>
          Add category
        </Button>
      </form>
    </div>
  );
}
