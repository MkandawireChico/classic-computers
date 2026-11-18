import { ChangePasswordForm } from "./change-password-form";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-white to-brand-50/70 p-5 shadow-sm sm:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-800">My account</p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">Account settings</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">Manage sign-in security for your account.</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
        <h2 className="text-lg font-bold text-slate-950">Change password</h2>
        <ChangePasswordForm />
      </div>
    </div>
  );
}
