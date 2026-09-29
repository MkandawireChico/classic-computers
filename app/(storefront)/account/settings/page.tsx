import { ChangePasswordForm } from "./change-password-form";

export default function SettingsPage() {
  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-gray-900">Settings</h1>
      <h2 className="mb-2 text-sm font-semibold text-gray-900">Change password</h2>
      <ChangePasswordForm />
    </div>
  );
}
