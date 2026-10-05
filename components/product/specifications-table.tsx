import type { ProductSpecification } from "@/types/catalog";

export function SpecificationsTable({ specifications }: { specifications: ProductSpecification[] }) {
  if (specifications.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-panel border border-surface-border bg-white shadow-sm">
      <table className="w-full text-sm leading-6">
        <caption className="sr-only">Product specifications</caption>
        <tbody>
          {specifications.map((spec, index) => (
            <tr key={spec.key} className={`border-b border-surface-border last:border-b-0 ${index % 2 === 0 ? "bg-white" : "bg-surface-muted/30"}`}>
              <th scope="row" className="w-1/3 px-5 py-3 text-left font-semibold text-gray-700">
                {spec.label}
              </th>
              <td className="px-5 py-3 text-gray-900 font-medium">
                {spec.value}
                {spec.unit ? ` ${spec.unit}` : ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
