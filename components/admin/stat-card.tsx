import { Card } from "@/components/ui/card";

export function StatCard({ label, value, tone }: { label: string; value: string | number; tone?: "warning" | "danger" }) {
  return (
    <Card className="flex h-full flex-col justify-between border-slate-200 bg-slate-50/60 p-4 shadow-none">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p
        className={`mt-3 text-2xl font-bold tracking-[-0.04em] ${
          tone === "danger" ? "text-status-danger" : tone === "warning" ? "text-status-warning" : "text-slate-900"
        }`}
      >
        {value}
      </p>
    </Card>
  );
}
