import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getMyPermissions } from "@/lib/auth/permissions";
import { getMyAdminNotifications } from "@/lib/data/admin/notifications";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";

/**
 * This layout is the FIRST checkpoint for every /admin/* page, but — same
 * principle as middleware.ts and every other layer in this codebase — it
 * is a UX convenience, not the real security boundary. It stops someone
 * with zero admin permissions from seeing the admin shell at all, but
 * every individual mutation (Server Action / Route Handler) still calls
 * requirePermission() itself, and RLS enforces the same thing again at
 * the database layer. Three independent layers, none of which trusts the
 * others to have already checked.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user) redirect("/sign-in?redirectTo=/admin");

  const permissions = await getMyPermissions();
  if (permissions.size === 0) {
    // Signed in, but holds no staff permission at all (an ordinary
    // customer account) — not an error state, just not for them.
    redirect("/account");
  }

  const notifications = await getMyAdminNotifications();

  return (
    <div className="flex min-h-screen flex-col">
      <AdminHeader email={user.email} notifications={notifications} />
      <div className="flex flex-1">
        <AdminSidebar permissions={Array.from(permissions)} />
        <main className="admin-content flex-1 overflow-x-auto p-4 sm:p-6 [&_table]:text-slate-700 [&_table_th]:border-b [&_table_th]:border-surface-border [&_table_th]:font-semibold">
          {children}
        </main>
      </div>
    </div>
  );
}
