import { requirePermission } from "@/lib/auth/permissions";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { listStaffUsers, getAllRoles } from "@/lib/data/admin/users";
import { StaffRow } from "@/components/admin/staff-row";

export default async function AdminUsersPage() {
  await requirePermission("users.manage");
  const [users, roles] = await Promise.all([listStaffUsers(), getAllRoles()]);

  return (
    <div>
      <AdminPageHeader eyebrow="Administration · Access control" title="Staff & Roles" description="Manage staff access and permission assignments." />
      <p className="mb-4 text-sm text-gray-500">
        Roles are assigned here; permissions per role were seeded in Phase 2 and aren&apos;t edited
        from this screen. The last remaining admin cannot be removed.
      </p>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[600px] text-sm">
          <thead className="bg-surface-muted text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="p-3">User</th>
              <th className="p-3">Roles</th>
              <th className="p-3">Add role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {users.map((u) => (
              <StaffRow key={u.id} user={u} allRoles={roles} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
