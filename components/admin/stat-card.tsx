import { Card } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  tone,
  description,
}: {
  label: string;
  value: string | number;
  tone?: "warning" | "danger";
  description?: string;
}) {
  return (
    <Card className="flex h-full min-h-[132px] flex-col justify-between border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <div className="mt-4">
        <p
          className={`text-3xl font-extrabold tracking-[-0.05em] ${
            tone === "danger" ? "text-status-danger" : tone === "warning" ? "text-status-warning" : "text-navy-950"
          }`}
        >
          {value}
        </p>
        {description ? <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p> : null}
      </div>
    </Card>
  );
}
