import { AccountPageHeader } from "@/components/storefront/account-page-header";
import { ChangePasswordForm } from "./change-password-form";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <AccountPageHeader eyebrow="Account · Security" title="Account settings" description="Manage sign-in security for your account." />

      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
        <h2 className="text-lg font-bold text-slate-950">Change password</h2>
        <ChangePasswordForm />
      </div>
    </div>
  );
}
