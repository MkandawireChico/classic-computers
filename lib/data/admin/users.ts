import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server-admin";

export interface StaffUser {
  id: string;
  email: string | null;
  fullName: string | null;
  roles: string[];
  createdAt: string;
}

export interface RoleOption {
  id: string;
  name: string;
}

export async function getAllRoles(): Promise<RoleOption[]> {
  const supabase = createClient();
  const { data } = await supabase.from("roles").select("id, name").order("name");
  return data ?? [];
}

/**
 * Lists every auth user together with their assigned role names.
 *
 * Uses the admin client for the auth.users listing itself (there is no
 * other way to enumerate Supabase Auth users — RLS has no bearing on the
 * auth schema), but the role-assignment join uses the normal RLS-bound
 * client: a users.manage holder can already read every user_roles row
 * under the "for all" policy in 0005, so no privileged access is needed
 * for that half. The page calling this already requires users.manage
 * before this function is ever invoked.
 */
export async function listStaffUsers(): Promise<StaffUser[]> {
  const admin = createAdminClient();
  const { data: authData, error } = await admin.auth.admin.listUsers({ perPage: 200 });
  if (error) {
    console.error("listStaffUsers failed:", error.message);
    return [];
  }

  const supabase = createClient();
  const { data: assignments } = await (supabase.from("user_roles") as any).select("user_id, roles ( name )");
  const { data: profiles } = await (supabase.from("profiles") as any).select("id, full_name");

  const rolesByUser = new Map<string, string[]>();
  for (const row of assignments ?? []) {
    const list = rolesByUser.get(row.user_id) ?? [];
    if (row.roles?.name) list.push(row.roles.name);
    rolesByUser.set(row.user_id, list);
  }
  const nameByUser = new Map<string, string | null>((profiles ?? []).map((p: any) => [p.id, p.full_name]));

  return authData.users
    .map((u) => ({
      id: u.id,
      email: u.email ?? null,
      fullName: nameByUser.get(u.id) ?? null,
      roles: rolesByUser.get(u.id) ?? [],
      createdAt: u.created_at,
    }))
    // Only show users who hold at least one staff-relevant role, or a
    // customer with none — this screen is about STAFF role management,
    // ordinary customers with zero admin roles clutter it without adding
    // value. Still lists customer-only users at the bottom so an admin
    // can find someone to promote.
    .sort((a, b) => (b.roles.length > 0 ? 1 : 0) - (a.roles.length > 0 ? 1 : 0));
}
