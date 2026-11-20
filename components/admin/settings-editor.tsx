"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { updateSettingAction } from "@/app/admin/settings/actions";
import type { SiteSettingRow } from "@/lib/services/admin/settings";

function useSettingForm<T extends Record<string, unknown>>(key: string, initial: T) {
  const router = useRouter();
  const [values, setValues] = useState<T>(initial);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function save() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await updateSettingAction(key, values);
      if (!result.success) setError(result.error);
      else {
        setSaved(true);
        router.refresh();
      }
    });
  }

  return { values, setValues, isPending, error, saved, save };
}

export function SettingsEditor({ settings }: { settings: SiteSettingRow[] }) {
  const businessInfo = settings.find((s) => s.key === "business_info");
  const hours = settings.find((s) => s.key === "hours");
  const paymentMethods = settings.find((s) => s.key === "payment_methods");
  const siteStatistics = settings.find((s) => s.key === "site_statistics");
  const repairSettings = settings.find((s) => s.key === "repair_settings");

  return (
    <div className="space-y-6">
      {businessInfo ? <BusinessInfoForm initial={businessInfo.value as any} /> : null}
      {hours ? <HoursForm initial={hours.value as any} /> : null}
      {paymentMethods ? <PaymentMethodsForm initial={paymentMethods.value as any} /> : null}
      {siteStatistics ? <StatisticsForm initial={siteStatistics.value as any} /> : null}
      {repairSettings ? <RepairSettingsForm initial={repairSettings.value as any} /> : null}
    </div>
  );
}

function BusinessInfoForm({ initial }: { initial: Record<string, string | null> }) {
  const form = useSettingForm("business_info", initial);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Business information</CardTitle>
      </CardHeader>
      {form.error ? <Alert variant="danger">{form.error}</Alert> : null}
      {form.saved ? <Alert variant="success">Saved.</Alert> : null}
      <div className="grid max-w-lg grid-cols-1 gap-3 sm:grid-cols-2">
        {(["name", "address", "phone", "whatsapp", "email"] as const).map((field) => (
          <div key={field} className="space-y-1 sm:col-span-2">
            <label className="text-xs font-medium capitalize text-gray-700">{field}</label>
            <input
              value={form.values[field] ?? ""}
              onChange={(e) => form.setValues((v) => ({ ...v, [field]: e.target.value }))}
              className="w-full rounded-card border border-surface-border px-2 py-1.5 text-sm"
            />
          </div>
        ))}
      </div>
      <Button size="sm" className="mt-3" onClick={form.save} isLoading={form.isPending}>
        Save
      </Button>
    </Card>
  );
}

function HoursForm({ initial }: { initial: { enabled: boolean; schedule: string | null } }) {
  const form = useSettingForm("hours", initial);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Opening hours</CardTitle>
      </CardHeader>
      {form.error ? <Alert variant="danger">{form.error}</Alert> : null}
      {form.saved ? <Alert variant="success">Saved.</Alert> : null}
      <label className="mb-2 flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={form.values.enabled}
          onChange={(e) => form.setValues((v) => ({ ...v, enabled: e.target.checked }))}
          className="h-4 w-4 rounded border-surface-border text-brand-500"
        />
        Show hours publicly
      </label>
      <input
        value={form.values.schedule ?? ""}
        onChange={(e) => form.setValues((v) => ({ ...v, schedule: e.target.value }))}
        placeholder="e.g. Mon-Sat 8:00-18:00, closed Sunday"
        className="w-full max-w-md rounded-card border border-surface-border px-2 py-1.5 text-sm"
      />
      <Button size="sm" className="mt-3 block" onClick={form.save} isLoading={form.isPending}>
        Save
      </Button>
    </Card>
  );
}

function PaymentMethodsForm({ initial }: { initial: Record<string, boolean> }) {
  const form = useSettingForm("payment_methods", initial);
  const methods = ["pay_at_shop", "bank_transfer", "mobile_money", "cash_on_delivery"];
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment methods</CardTitle>
      </CardHeader>
      {form.error ? <Alert variant="danger">{form.error}</Alert> : null}
      {form.saved ? <Alert variant="success">Saved.</Alert> : null}
      <p className="mb-2 text-xs text-gray-500">
        Only enabled methods appear as options at checkout — no payment credentials are stored
        here.
      </p>
      <div className="space-y-1">
        {methods.map((m) => (
          <label key={m} className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={Boolean(form.values[m])}
              onChange={(e) => form.setValues((v) => ({ ...v, [m]: e.target.checked }))}
              className="h-4 w-4 rounded border-surface-border text-brand-500"
            />
            {m.replace(/_/g, " ")}
          </label>
        ))}
      </div>
      <Button size="sm" className="mt-3" onClick={form.save} isLoading={form.isPending}>
        Save
      </Button>
    </Card>
  );
}

function StatisticsForm({ initial }: { initial: { enabled: boolean; products: number | null; years: number | null; happy_clients: number | null } }) {
  const form = useSettingForm("site_statistics", initial);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Homepage statistics</CardTitle>
      </CardHeader>
      {form.error ? <Alert variant="danger">{form.error}</Alert> : null}
      {form.saved ? <Alert variant="success">Saved.</Alert> : null}
      <p className="mb-2 text-xs text-gray-500">
        Disabled by default — these are never shown until you enable them AND fill in real,
        verified numbers.
      </p>
      <label className="mb-2 flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={form.values.enabled}
          onChange={(e) => form.setValues((v) => ({ ...v, enabled: e.target.checked }))}
          className="h-4 w-4 rounded border-surface-border text-brand-500"
        />
        Show statistics on homepage
      </label>
      <div className="grid max-w-md grid-cols-3 gap-2">
        {(["products", "years", "happy_clients"] as const).map((field) => (
          <div key={field} className="space-y-1">
            <label className="text-xs font-medium capitalize text-gray-700">{field.replace("_", " ")}</label>
            <input
              type="number"
              value={form.values[field] ?? ""}
              onChange={(e) => form.setValues((v) => ({ ...v, [field]: e.target.value ? Number(e.target.value) : null }))}
              className="w-full rounded-card border border-surface-border px-2 py-1.5 text-sm"
            />
          </div>
        ))}
      </div>
      <Button size="sm" className="mt-3" onClick={form.save} isLoading={form.isPending}>
        Save
      </Button>
    </Card>
  );
}


function RepairSettingsForm({ initial }: { initial: Record<string, unknown> }) {
  const initialRate = Number(initial.internal_labour_rate_mwk_per_hour);
  const form = useSettingForm("repair_settings", {
    internal_labour_rate_mwk_per_hour: Number.isFinite(initialRate) && initialRate > 0 ? initialRate : "",
  });
  const rate = form.values.internal_labour_rate_mwk_per_hour;
  const valid = rate === "" || (typeof rate === "number" && Number.isFinite(rate) && rate >= 0 && rate <= 1000000);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Repair settings</CardTitle>
      </CardHeader>
      {form.error ? <Alert variant="danger">{form.error}</Alert> : null}
      {form.saved ? <Alert variant="success">Saved.</Alert> : null}
      <p className="mb-3 max-w-2xl text-sm text-gray-600">
        Set the internal labour cost per technician hour in MWK. This rate is used for repair cost estimates only. Leave the field blank until management confirms a rate. No default wage is assumed.
      </p>
      <div className="max-w-sm space-y-1">
        <label className="text-xs font-medium text-gray-700">Internal labour cost per hour (MWK)</label>
        <input
          type="number"
          min="0"
          max="1000000"
          step="0.01"
          value={rate}
          onChange={(e) => form.setValues((v) => ({ ...v, internal_labour_rate_mwk_per_hour: e.target.value === "" ? "" : Number(e.target.value) }))}
          placeholder="Enter approved hourly cost"
          className="w-full rounded-card border border-surface-border px-3 py-2 text-sm"
        />
        <p className="text-xs text-gray-500">Use the company’s internal cost per hour, not the customer billing rate.</p>
      </div>
      <Button size="sm" className="mt-3" onClick={form.save} isLoading={form.isPending} disabled={!valid}>
        Save repair settings
      </Button>
    </Card>
  );
}
