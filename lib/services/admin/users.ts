import "server-only";
import { createClient } from "@/lib/supabase/server";
import { requirePermission, AuthorizationError } from "@/lib/auth/permissions";

export type ServiceResult = { success: true } | { success: false; error: string };

async function guard(): Promise<ServiceResult | null> {
  try {
    await requirePermission("users.manage");
    return null;
  } catch (e) {
    if (e instanceof AuthorizationError) return { success: false, error: "You don't have permission to manage staff roles." };
    throw e;
  }
}

export async function assignRole(userId: string, roleId: string): Promise<ServiceResult> {
  const guardResult = await guard();
  if (guardResult) return guardResult;

  const supabase = createClient();
  const { error } = await (supabase.from("user_roles") as any).insert({ user_id: userId, role_id: roleId });
  if (error) {
    if (error.code === "23505") return { success: false, error: "User already has that role." };
    return { success: false, error: "Could not assign role." };
  }
  return { success: true };
}

/**
 * Removing a role is blocked if it would leave zero users holding the
 * 'admin' role anywhere in the system — the brief explicitly requires
 * preventing accidental removal of the final administrative access path.
 * This check runs regardless of who is being edited, since the risk is
 * "no admin left", not "this specific admin".
 */
export async function removeRole(userId: string, roleId: string): Promise<ServiceResult> {
  const guardResult = await guard();
  if (guardResult) return guardResult;

  const supabase = createClient();

  const { data: role } = await (supabase.from("roles") as any).select("name").eq("id", roleId).maybeSingle();
  if (role?.name === "admin") {
    const { count } = await (supabase.from("user_roles") as any)
      .select("user_id", { count: "exact", head: true })
      .eq("role_id", roleId);
    if ((count ?? 0) <= 1) {
      return { success: false, error: "Cannot remove the last administrator. Assign another admin first." };
    }
  }

  const { error } = await (supabase.from("user_roles") as any).delete().eq("user_id", userId).eq("role_id", roleId);
  if (error) return { success: false, error: "Could not remove role." };
  return { success: true };
}
