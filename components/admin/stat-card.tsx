import { Card } from "@/components/ui/card";

export function StatCard({ label, value, tone }: { label: string; value: string | number; tone?: "warning" | "danger" }) {
  return (
    <Card className="p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p
        className={`mt-1 text-2xl font-bold ${
          tone === "danger" ? "text-status-danger" : tone === "warning" ? "text-status-warning" : "text-gray-900"
        }`}
      >
        {value}
      </p>
    </Card>
  );
}
