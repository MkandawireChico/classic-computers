"use client";

import { useMemo } from "react";
import type { ProductSpecification } from "@/types/catalog";
import { useProductVariant } from "./product-variant-context";

const SPEC_GROUPS = [
  { title: "Performance", keys: ["processor", "processor_generation", "ram", "graphics"] },
  { title: "Storage", keys: ["storage", "storage_type"] },
  { title: "Display", keys: ["display_size", "display_resolution", "display", "screen_size", "resolution", "panel_type", "refresh_rate", "response_time", "adaptive_sync"] },
  { title: "Connectivity", keys: ["ports", "wifi", "bluetooth", "connectivity", "network", "sim"] },
  { title: "Battery and design", keys: ["battery", "keyboard", "webcam", "colour", "weight"] },
  { title: "Camera and media", keys: ["camera"] },
  { title: "Printing", keys: ["print_type", "print_speed", "paper_size", "duplex", "scanner", "copy", "fax"] },
  { title: "Software", keys: ["operating_system"] },
  { title: "Other details", keys: [] },
] as const;

function groupForSpecification(key: string): string {
  return SPEC_GROUPS.find((group) => group.keys.includes(key as never))?.title ?? "Other details";
}

export function SpecificationsTable({ specifications }: { specifications: ProductSpecification[] }) {
  const { selectedVariantId } = useProductVariant();
  const visibleSpecifications = useMemo(() => {
    const byKey = new Map<string, ProductSpecification>();
    for (const spec of specifications) {
      if (spec.variant_id === null) byKey.set(spec.key, spec);
    }
    if (selectedVariantId) {
      for (const spec of specifications) {
        if (spec.variant_id === selectedVariantId) byKey.set(spec.key, spec);
      }
    }
    return [...byKey.values()].sort((a, b) => a.display_order - b.display_order);
  }, [specifications, selectedVariantId]);

  if (visibleSpecifications.length === 0) return null;

  const groups = new Map<string, ProductSpecification[]>();
  for (const spec of visibleSpecifications) {
    const title = groupForSpecification(spec.key);
    const current = groups.get(title) ?? [];
    current.push(spec);
    groups.set(title, current);
  }
  const orderedGroups = SPEC_GROUPS
    .map((group) => ({ title: group.title, items: groups.get(group.title) ?? [] }))
    .filter((group) => group.items.length > 0);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {orderedGroups.map((group) => (
        <section key={group.title} aria-label={group.title} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <h3 className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-extrabold uppercase tracking-[0.14em] text-navy-900">
            {group.title}
          </h3>
          <table className="w-full text-sm leading-6">
            <caption className="sr-only">{group.title} specifications</caption>
            <tbody>
              {group.items.map((spec, index) => (
                <tr key={spec.key} className={index % 2 === 1 ? "bg-slate-50/70" : "bg-white"}>
                  <th scope="row" className="w-[42%] px-4 py-3 text-left align-top font-medium text-slate-600">
                    {spec.label}
                  </th>
                  <td className="px-4 py-3 font-semibold text-slate-900">
                    {spec.value}{spec.unit ? ` ${spec.unit}` : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}
    </div>
  );
}
