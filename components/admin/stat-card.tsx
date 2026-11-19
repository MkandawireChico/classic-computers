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
  const accent = tone === "danger" ? "bg-rose-500" : tone === "warning" ? "bg-amber-400" : "bg-cyan-500";
  const valueColor = tone === "danger" ? "text-rose-700" : tone === "warning" ? "text-amber-700" : "text-slate-950";

  return (
    <Card className="relative flex h-full min-h-[142px] flex-col justify-between overflow-hidden border-slate-200 bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.035)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(15,23,42,0.07)]">
      <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-[3px] ${accent}`} />
      <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <div className="mt-5">
        <p className={`break-words text-2xl font-extrabold tracking-[-0.045em] sm:text-3xl ${valueColor}`}>{value}</p>
        {description ? <p className="mt-1.5 text-xs leading-5 text-slate-500">{description}</p> : null}
      </div>
    </Card>
  );
}
