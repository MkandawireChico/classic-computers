"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { formatMoney } from "@/lib/format/money";
import { createDiscountAction, toggleDiscountActiveAction } from "@/app/admin/discounts/actions";
import type { AdminDiscount } from "@/lib/services/admin/discounts";

const emptyForm = {
  name: "",
  type: "percentage" as "percentage" | "fixed",
  value: 10,
  scope: "all" as "all" | "category" | "product" | "student" | "campaign",
  minQuantity: "",
  minOrderTotal: "",
  maxDiscountAmount: "",
  startsAt: "",
  endsAt: "",
};

export function DiscountsManager({ discounts }: { discounts: AdminDiscount[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState(emptyForm);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createDiscountAction({
        name: form.name,
        type: form.type,
        value: form.value,
        scope: form.scope,
        minQuantity: form.minQuantity ? Number(form.minQuantity) : null,
        minOrderTotal: form.minOrderTotal ? Number(form.minOrderTotal) : null,
        maxDiscountAmount: form.maxDiscountAmount ? Number(form.maxDiscountAmount) : null,
        startsAt: form.startsAt || null,
        endsAt: form.endsAt || null,
        isActive: true,
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setForm(emptyForm);
      setShowNew(false);
      router.refresh();
    });
  }

  function handleToggle(id: string, next: boolean) {
    startTransition(async () => {
      await toggleDiscountActiveAction(id, next);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {error ? <Alert variant="danger">{error}</Alert> : null}

      <div className="overflow-x-auto rounded-card border border-surface-border">
        <table className="w-full min-w-[700px] text-sm">
          <thead className="bg-surface-muted text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Type</th>
              <th className="p-3">Scope</th>
              <th className="p-3">Conditions</th>
              <th className="p-3">Active</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {discounts.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-500">
                  No discounts yet.
                </td>
              </tr>
            ) : (
              discounts.map((d) => (
                <tr key={d.id}>
                  <td className="p-3 font-medium text-gray-900">{d.name}</td>
                  <td className="p-3 text-gray-600">
                    {d.type === "percentage" ? `${d.value}%` : formatMoney(d.value)}
                  </td>
                  <td className="p-3">
                    <Badge variant="neutral">{d.scope}</Badge>
                  </td>
                  <td className="p-3 text-xs text-gray-500">
                    {d.min_quantity ? `min qty ${d.min_quantity} · ` : ""}
                    {d.min_order_total ? `min order ${formatMoney(d.min_order_total)} · ` : ""}
                    {d.max_discount_amount ? `cap ${formatMoney(d.max_discount_amount)}` : ""}
                    {!d.min_quantity && !d.min_order_total && !d.max_discount_amount ? "none" : ""}
                  </td>
                  <td className="p-3">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleToggle(d.id, !d.is_active)}
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        d.is_active ? "bg-green-100 text-green-800" : "bg-surface-muted text-gray-500"
                      }`}
                    >
                      {d.is_active ? "Active" : "Inactive"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showNew ? (
        <form onSubmit={handleCreate} className="max-w-lg space-y-3 rounded-card border border-surface-border p-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">Name</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full rounded-card border border-surface-border px-2 py-1.5 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as "percentage" | "fixed" }))}
                className="w-full rounded-card border border-surface-border px-2 py-1.5 text-sm"
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed amount</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Value</label>
              <input
                required
                type="number"
                value={form.value}
                onChange={(e) => setForm((f) => ({ ...f, value: Number(e.target.value) }))}
                className="w-full rounded-card border border-surface-border px-2 py-1.5 text-sm"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">Scope</label>
            <select
              value={form.scope}
              onChange={(e) => setForm((f) => ({ ...f, scope: e.target.value as any }))}
              className="w-full rounded-card border border-surface-border px-2 py-1.5 text-sm"
            >
              <option value="all">All products</option>
              <option value="category">Specific category (assign after creating)</option>
              <option value="product">Specific product (assign after creating)</option>
              <option value="student">Student</option>
              <option value="campaign">Campaign</option>
            </select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Min quantity</label>
              <input
                type="number"
                value={form.minQuantity}
                onChange={(e) => setForm((f) => ({ ...f, minQuantity: e.target.value }))}
                className="w-full rounded-card border border-surface-border px-2 py-1.5 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Min order total</label>
              <input
                type="number"
                value={form.minOrderTotal}
                onChange={(e) => setForm((f) => ({ ...f, minOrderTotal: e.target.value }))}
                className="w-full rounded-card border border-surface-border px-2 py-1.5 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Max discount</label>
              <input
                type="number"
                value={form.maxDiscountAmount}
                onChange={(e) => setForm((f) => ({ ...f, maxDiscountAmount: e.target.value }))}
                className="w-full rounded-card border border-surface-border px-2 py-1.5 text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Starts</label>
              <input
                type="date"
                value={form.startsAt}
                onChange={(e) => setForm((f) => ({ ...f, startsAt: e.target.value }))}
                className="w-full rounded-card border border-surface-border px-2 py-1.5 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Ends</label>
              <input
                type="date"
                value={form.endsAt}
                onChange={(e) => setForm((f) => ({ ...f, endsAt: e.target.value }))}
                className="w-full rounded-card border border-surface-border px-2 py-1.5 text-sm"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm" isLoading={isPending}>
              Create discount
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setShowNew(false)}>
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <Button size="sm" variant="outline" onClick={() => setShowNew(true)}>
          New discount
        </Button>
      )}
    </div>
  );
}
