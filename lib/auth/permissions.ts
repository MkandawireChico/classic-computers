import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/current-user";

/**
 * Server-side permission check. Call this at the top of every Server Action
 * and Route Handler that performs a privileged operation — never rely on
 * whether an admin nav link was rendered client-side.
 *
 * This mirrors the has_permission() SQL helper used in RLS policies
 * (see supabase/migrations). The two layers are intentionally redundant:
 * RLS protects the data even if a code path forgets this check, and this
 * check lets the app fail fast with a clear error instead of a raw
 * Postgres permission-denied error leaking to the user.
 *
 * The actual permission catalogue (products.write, orders.manage, ...) is
 * defined in the `permissions` table and seeded via migration in Phase 2 —
 * this function is the foundation it plugs into, not a stand-in policy
 * engine of its own.
 */
export async function requirePermission(permissionKey: string): Promise<{ userId: string }> {
  const supabase = createClient();
  const user = await getCurrentUser();

  if (!user) {
    throw new AuthorizationError("Not signed in.");
  }

  const { data, error } = await (supabase.rpc as any)("has_permission", {
    uid: user.id,
    permission_key: permissionKey,
  });

  if (error) {
    throw new AuthorizationError(`Permission check failed: ${error.message}`);
  }

  if (!data) {
    throw new AuthorizationError(`Missing permission: ${permissionKey}`);
  }

  return { userId: user.id };
}

export class AuthorizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthorizationError";
  }
}

export const getMyRoleAssignments = cache(async function getMyRoleAssignments() {
  const user = await getCurrentUser();
  if (!user) return [];

  const supabase = createClient();
  const { data, error } = await (supabase.from("user_roles") as any)
    .select("role_id, roles ( name, role_permissions ( permissions ( key ) ) )")
    .eq("user_id", user.id);

  if (error || !data) return [];
  return data as any[];
});

/**
 * Returns the full set of permission keys the current user holds, via
 * user_roles -> role_permissions -> permissions. Used to render the admin
 * sidebar/nav (show only links the user can actually use) — this is a UX
 * convenience, same as everywhere else in this codebase: the real
 * boundary for any admin mutation is still requirePermission() (or RLS)
 * called server-side at the point of action, never "the link wasn't
 * rendered so they can't get here."
 */
export const getMyPermissions = cache(async function getMyPermissions(): Promise<Set<string>> {
  const assignments = await getMyRoleAssignments();

  const keys = new Set<string>();
  for (const row of assignments) {
    for (const rp of row.roles?.role_permissions ?? []) {
      const key = rp.permissions?.key;
      if (key) keys.add(key);
    }
  }
  return keys;
});

export const getMyRoleNames = cache(async function getMyRoleNames(): Promise<Set<string>> {
  const assignments = await getMyRoleAssignments();
  return new Set(assignments.map((row) => row.roles?.name).filter(Boolean));
});
