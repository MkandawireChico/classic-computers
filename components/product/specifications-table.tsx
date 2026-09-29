import type { ProductSpecification } from "@/types/catalog";

export function SpecificationsTable({ specifications }: { specifications: ProductSpecification[] }) {
  if (specifications.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-card border border-surface-border">
      <table className="w-full text-sm leading-6">
        <caption className="sr-only">Product specifications</caption>
        <tbody>
          {specifications.map((spec, index) => (
            <tr key={spec.key} className={index % 2 === 0 ? "bg-white" : "bg-surface-muted"}>
              <th scope="row" className="w-1/3 px-4 py-2.5 text-left font-semibold text-gray-700">
                {spec.label}
              </th>
              <td className="px-4 py-2.5 text-gray-900">
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
