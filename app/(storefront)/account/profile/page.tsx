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
    <div>
      <h1 className="mb-4 text-xl font-semibold text-gray-900">Profile</h1>
      <p className="mb-4 text-sm text-gray-500">Email: {user?.email}</p>
      <ProfileForm initialFullName={profile?.full_name ?? ""} initialPhone={profile?.phone ?? ""} />
    </div>
  );
}
