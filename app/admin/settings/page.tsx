import { requirePermission } from "@/lib/auth/permissions";
import { listAllSettings } from "@/lib/services/admin/settings";
import { SettingsEditor } from "@/components/admin/settings-editor";

export default async function AdminSettingsPage() {
  await requirePermission("settings.read");
  const settings = await listAllSettings();

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-gray-900">Settings</h1>
      <SettingsEditor settings={settings} />
    </div>
  );
}
