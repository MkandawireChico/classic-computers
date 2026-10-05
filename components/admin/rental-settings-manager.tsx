"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { saveRentalConfigurationAction } from "@/app/admin/products/actions";

type RentalConfiguration = {
  id: string;
  variant_id: string | null;
  is_available: boolean;
  daily_rate: number | null;
  weekly_rate: number | null;
  monthly_rate: number | null;
  deposit_amount: number | null;
};

type RentalTarget = {
  variantId: string | null;
  label: string;
  status: string;
  inventoryQuantity: number;
  isDefault: boolean;
};

export function RentalSettingsManager({
  productId,
  targets,
  configurations,
  canManage,
}: {
  productId: string;
  targets: RentalTarget[];
  configurations: RentalConfiguration[];
  canManage: boolean;
}) {
  const [newTargetKey, setNewTargetKey] = useState<string | null>(null);

  if (!canManage) {
    return <Alert>Rental settings require the products.write and rentals.write permissions.</Alert>;
  }

  return (
    <div className="space-y-4">
      {targets.map((target) => {
        const targetKey = target.variantId ?? "product";
        const configuration =
          configurations.find((item) => item.variant_id === target.variantId) ??
          (target.isDefault ? configurations.find((item) => item.variant_id === null) : undefined);

        return (
          <section key={targetKey} className="border-b border-surface-border pb-4 last:border-0 last:pb-0">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-medium text-gray-900">{target.label}</h3>
                {target.variantId ? <p className="text-xs text-gray-500">Variant status: {target.status}</p> : null}
                <p className="text-xs text-gray-500">Inventory on hand: {target.inventoryQuantity}</p>
              </div>
              {configuration ? (
                <span className={`text-sm font-semibold ${configuration.is_available ? "text-status-success" : "text-gray-500"}`}>
                  {configuration.is_available ? "Available for rental" : "Not available for rental"}
                </span>
              ) : (
                <span className="text-sm text-gray-600">Not configured for rental</span>
              )}
            </div>

            {configuration || newTargetKey === targetKey ? (
              <RentalConfigurationForm
                productId={productId}
                target={target}
                configuration={configuration ?? null}
                onCancel={() => setNewTargetKey(null)}
              />
            ) : (
              <Button
                type="button"
                size="sm"
                className="mt-3"
                disabled={target.variantId !== null && target.status !== "active"}
                onClick={() => setNewTargetKey(targetKey)}
              >
                Enable Rental
              </Button>
            )}
          </section>
        );
      })}
    </div>
  );
}

function RentalConfigurationForm({
  productId,
  target,
  configuration,
  onCancel,
}: {
  productId: string;
  target: RentalTarget;
  configuration: RentalConfiguration | null;
  onCancel: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isAvailable, setIsAvailable] = useState(configuration?.is_available ?? true);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSaved(false);

    const formData = new FormData(event.currentTarget);
    const amount = (name: string) => {
      const value = formData.get(name)?.toString().trim() ?? "";
      return value === "" ? null : Number(value);
    };

    startTransition(async () => {
      const result = await saveRentalConfigurationAction({
        productId,
        variantId: target.variantId,
        isAvailable,
        dailyRate: amount("dailyRate"),
        weeklyRate: amount("weeklyRate"),
        monthlyRate: amount("monthlyRate"),
        depositAmount: amount("depositAmount"),
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      setSaved(true);
      router.refresh();
    });
  }

  const fields = [
    { name: "dailyRate", label: "Daily rate", value: configuration?.daily_rate },
    { name: "weeklyRate", label: "Weekly rate", value: configuration?.weekly_rate },
    { name: "monthlyRate", label: "Monthly rate", value: configuration?.monthly_rate },
    { name: "depositAmount", label: "Security deposit", value: configuration?.deposit_amount },
  ];

  return (
    <form onSubmit={handleSubmit} className="mt-4 max-w-3xl space-y-4 rounded-card border border-surface-border bg-surface-muted/40 p-4">
      {error ? <Alert variant="danger">{error}</Alert> : null}
      {saved ? <Alert variant="success">Rental settings saved.</Alert> : null}

      <label className="flex items-center gap-2 text-sm font-medium text-gray-800">
        <input
          type="checkbox"
          checked={isAvailable}
          disabled={isPending || (target.variantId !== null && target.status !== "active")}
          onChange={(event) => setIsAvailable(event.target.checked)}
          className="h-4 w-4 rounded border-surface-border text-brand-600 focus:ring-brand-500"
        />
        Available for rental
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        {fields.map((field) => (
          <label key={field.name} className="space-y-1 text-sm font-medium text-gray-700">
            <span>{field.label} (MWK)</span>
            <input
              name={field.name}
              type="number"
              min="0"
              step="0.01"
              defaultValue={field.value ?? ""}
              disabled={isPending}
              className="block w-full rounded-card border border-surface-border bg-white px-3 py-2 text-sm font-normal focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </label>
        ))}
      </div>

      <div className="flex gap-2">
        <Button type="submit" size="sm" isLoading={isPending}>
          Save Rental Settings
        </Button>
        {!configuration ? (
          <Button type="button" size="sm" variant="outline" disabled={isPending} onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}