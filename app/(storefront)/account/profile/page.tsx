import { AccountPageHeader } from "@/components/storefront/account-page-header";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "./profile-form";

export default async function ProfilePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await (supabase
    .from("profiles") as any)
    .select("full_name, phone")
    .eq("id", user!.id)
    .maybeSingle();

  return (
    <div className="space-y-6">
      <AccountPageHeader eyebrow="Account · Personal details" title="Personal profile" description="Keep the contact details associated with your account up to date." />

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="mb-6 border-b border-slate-200 pb-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Sign-in email</p>
          <p className="mt-1 break-all text-base font-semibold text-slate-950">{user?.email}</p>
        </div>
        <h2 className="text-lg font-bold text-slate-950">Contact information</h2>
        <ProfileForm initialFullName={profile?.full_name ?? ""} initialPhone={profile?.phone ?? ""} />
      </div>
    </div>
  );
}
