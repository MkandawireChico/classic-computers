"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { formatMoney } from "@/lib/format/money";
import { createVariantAction, updateVariantAction, deactivateVariantAction } from "@/app/admin/products/actions";
import type { AdminProductDetail } from "@/lib/data/admin/products";

export function VariantsManager({ product }: { product: AdminProductDetail }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [newVariant, setNewVariant] = useState({ sku: "", name: "", price: product.base_price, salePrice: "", initialQuantity: 0, isDefault: product.variants.length === 0 });

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createVariantAction({
        productId: product.id,
        sku: newVariant.sku,
        name: newVariant.name,
        price: newVariant.price,
        salePrice: newVariant.salePrice ? Number(newVariant.salePrice) : null,
        isDefault: newVariant.isDefault,
        status: "active",
        initialQuantity: newVariant.initialQuantity,
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setShowNew(false);
      setNewVariant({ sku: "", name: "", price: product.base_price, salePrice: "", initialQuantity: 0, isDefault: false });
      router.refresh();
    });
  }

  function handleDeactivate(id: string) {
    startTransition(async () => {
      await deactivateVariantAction(id, product.id);
      router.refresh();
    });
  }

  function handleMakeDefault(variantId: string) {
    startTransition(async () => {
      const v = product.variants.find((x) => x.id === variantId);
      if (!v) return;
      await updateVariantAction({
        id: v.id,
        productId: product.id,
        sku: v.sku,
        name: v.name,
        price: v.price,
        salePrice: v.sale_price,
        status: v.status,
        isDefault: true,
      });
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      {error ? <Alert variant="danger">{error}</Alert> : null}

      {product.variants.length === 0 ? (
        <p className="text-sm text-gray-500">
          No variants — this product uses its own base price and product-level stock (
          {product.inventory?.quantity_on_hand ?? 0} on hand).
        </p>
      ) : (
        <div className="overflow-x-auto rounded-card border border-surface-border">
          <table className="w-full min-w-[500px] text-sm">
            <thead className="bg-surface-muted text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="p-2">Variant</th>
                <th className="p-2">SKU</th>
                <th className="p-2">Price</th>
                <th className="p-2">Stock</th>
                <th className="p-2">Status</th>
                <th className="p-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {product.variants.map((v) => (
                <tr key={v.id}>
                  <td className="p-2">
                    {v.name} {v.is_default ? <Badge variant="info">Default</Badge> : null}
                  </td>
                  <td className="p-2 text-gray-600">{v.sku}</td>
                  <td className="p-2">
                    {formatMoney(v.sale_price ?? v.price)}
                    {v.sale_price ? <span className="ml-1 text-xs text-gray-400 line-through">{formatMoney(v.price)}</span> : null}
                  </td>
                  <td className="p-2">{v.inventory?.quantity_on_hand ?? "—"}</td>
                  <td className="p-2">
                    <Badge variant={v.status === "active" ? "success" : "neutral"}>{v.status}</Badge>
                  </td>
                  <td className="p-2 space-x-2">
                    {!v.is_default ? (
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleMakeDefault(v.id)}
                        className="text-xs text-brand-600 hover:underline"
                      >
                        Make default
                      </button>
                    ) : null}
                    {v.status === "active" ? (
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleDeactivate(v.id)}
                        className="text-xs text-status-danger hover:underline"
                      >
                        Deactivate
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showNew ? (
        <form onSubmit={handleCreate} className="max-w-xl space-y-3 rounded-card border border-surface-border p-4">
          {product.variants.length === 0 && (product.inventory?.quantity_on_hand ?? 0) > 0 ? (
            <Alert variant="warning">
              This product has {product.inventory?.quantity_on_hand} units in product-level stock. That quantity is not automatically assigned to new configurations. Enter the real stock count for this configuration; after variants are added, availability is tracked per configuration.
            </Alert>
          ) : null}
          <p className="text-sm leading-5 text-gray-600">
            Each variant is one complete configuration customers can choose, with its own price and stock. For example, add separate options for 4 GB RAM / 256 GB SSD and 8 GB RAM / 512 GB SSD only when those configurations are available.
          </p>
          <div className="space-y-1">
            <label htmlFor="variant-name" className="block text-sm font-medium text-gray-800">Configuration</label>
            <input
              id="variant-name"
              required
              placeholder="e.g. 8 GB RAM / 512 GB SSD"
              value={newVariant.name}
              onChange={(e) => setNewVariant((v) => ({ ...v, name: e.target.value }))}
              className="w-full rounded-card border border-surface-border px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="variant-sku" className="block text-sm font-medium text-gray-800">Variant SKU</label>
            <input
              id="variant-sku"
              required
              value={newVariant.sku}
              onChange={(e) => setNewVariant((v) => ({ ...v, sku: e.target.value }))}
              className="w-full rounded-card border border-surface-border px-3 py-2 text-sm"
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="space-y-1">
              <label htmlFor="variant-price" className="block text-sm font-medium text-gray-800">Price (MWK)</label>
              <input
                id="variant-price"
                required
                type="number"
                min={0}
                value={newVariant.price}
                onChange={(e) => setNewVariant((v) => ({ ...v, price: Number(e.target.value) }))}
                className="w-full rounded-card border border-surface-border px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="variant-sale-price" className="block text-sm font-medium text-gray-800">Sale price (optional)</label>
              <input
                id="variant-sale-price"
                type="number"
                min={0}
                value={newVariant.salePrice}
                onChange={(e) => setNewVariant((v) => ({ ...v, salePrice: e.target.value }))}
                className="w-full rounded-card border border-surface-border px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="variant-initial-stock" className="block text-sm font-medium text-gray-800">Initial stock</label>
              <input
                id="variant-initial-stock"
                type="number"
                min={0}
                value={newVariant.initialQuantity}
                onChange={(e) => setNewVariant((v) => ({ ...v, initialQuantity: Number(e.target.value) }))}
                className="w-full rounded-card border border-surface-border px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm" isLoading={isPending}>
              Add variant
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setShowNew(false)}>
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <Button type="button" size="sm" variant="outline" onClick={() => setShowNew(true)}>
          Add variant
        </Button>
      )}
    </div>
  );
}
