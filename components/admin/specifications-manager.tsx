"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { saveProductSpecificationsAction } from "@/app/admin/products/actions";
import type { AdminProductDetail } from "@/lib/data/admin/products";

interface SpecDef {
  id: string;
  key: string;
  label: string;
  data_type: string;
  unit: string | null;
  display_order: number;
}

export function SpecificationsManager({
  product,
  specDefinitions,
}: {
  product: AdminProductDetail;
  specDefinitions: SpecDef[];
}) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    const existingByDefId = new Map(
      product.specifications.filter((s) => s.variant_id === null).map((s) => [s.spec_definition_id, s]),
    );

    setValues(
      Object.fromEntries(specDefinitions.map((def) => [def.id, existingByDefId.get(def.id)?.value ?? ""])),
    );
  }, [product.specifications, specDefinitions]);

  async function handleSave() {
    if (isSaving) return;

    const saveValues: Array<{ productId: string; variantId: string | null; specDefinitionId: string; value: string }> = [];
    const cleared: Array<{ productId: string; variantId: string | null; specDefinitionId: string }> = [];

    for (const def of specDefinitions) {
      const value = (values[def.id] ?? "").trim();
      const existing = product.specifications.find(
        (spec) => spec.spec_definition_id === def.id && spec.variant_id === null,
      );

      if (value) {
        saveValues.push({
          productId: product.id,
          variantId: null,
          specDefinitionId: def.id,
          value,
        });
      } else if (existing) {
        cleared.push({
          productId: product.id,
          variantId: null,
          specDefinitionId: def.id,
        });
      }
    }

    setSaveError(null);
    setSaveMessage(null);
    setIsSaving(true);

    const result = await saveProductSpecificationsAction({
      productId: product.id,
      values: saveValues,
      cleared,
    });

    setIsSaving(false);

    if (!result.success) {
      setSaveError(result.error);
      return;
    }

    setSaveMessage("Specifications saved successfully.");
  }

  if (specDefinitions.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        No specification fields are defined for this product type yet — add them via a migration
        (specification_definitions) or the future spec-definition admin screen.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {saveError ? <Alert variant="danger">{saveError}</Alert> : null}
      {saveMessage ? <Alert variant="success">{saveMessage}</Alert> : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {specDefinitions.map((def) => (
          <div key={def.id} className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {def.label} {def.unit ? <span className="text-xs text-gray-400">({def.unit})</span> : null}
            </label>
            <input
              value={values[def.id] ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, [def.id]: e.target.value }))}
              className="w-full rounded-card border border-surface-border px-2 py-1.5 text-sm"
              disabled={isSaving}
            />
          </div>
        ))}
      </div>
      <Button size="sm" onClick={handleSave} isLoading={isSaving} disabled={isSaving}>
        {isSaving ? "Saving..." : "Save specifications"}
      </Button>
    </div>
  );
}
