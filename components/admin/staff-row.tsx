"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { assignRoleAction, removeRoleAction } from "@/app/admin/users/actions";
import type { StaffUser, RoleOption } from "@/lib/data/admin/users";

export function StaffRow({ user, allRoles }: { user: StaffUser; allRoles: RoleOption[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState(allRoles.find((r) => !user.roles.includes(r.name))?.id ?? "");

  const availableToAdd = allRoles.filter((r) => !user.roles.includes(r.name));

  function handleAdd() {
    if (!selectedRoleId) return;
    setError(null);
    startTransition(async () => {
      const result = await assignRoleAction(user.id, selectedRoleId);
      if (!result.success) setError(result.error);
      else router.refresh();
    });
  }

  function handleRemove(roleName: string) {
    const role = allRoles.find((r) => r.name === roleName);
    if (!role) return;
    setError(null);
    startTransition(async () => {
      const result = await removeRoleAction(user.id, role.id);
      if (!result.success) setError(result.error);
      else router.refresh();
    });
  }

  return (
    <tr className="align-top">
      <td className="p-3">
        <p className="font-medium text-gray-900">{user.fullName ?? "Unnamed"}</p>
        <p className="text-xs text-gray-500">{user.email}</p>
      </td>
      <td className="p-3">
        <div className="flex flex-wrap gap-1">
          {user.roles.length === 0 ? (
            <span className="text-xs text-gray-400">No staff role (customer)</span>
          ) : (
            user.roles.map((r) => (
              <Badge key={r} variant="info" className="flex items-center gap-1">
                {r}
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleRemove(r)}
                  aria-label={`Remove ${r} role`}
                  className="ml-1 text-brand-900 hover:text-status-danger"
                >
                  ×
                </button>
              </Badge>
            ))
          )}
        </div>
        {error ? <p className="mt-1 text-xs text-status-danger">{error}</p> : null}
      </td>
      <td className="p-3">
        {availableToAdd.length > 0 ? (
          <div className="flex gap-1">
            <select
              value={selectedRoleId}
              onChange={(e) => setSelectedRoleId(e.target.value)}
              className="rounded-card border border-surface-border px-2 py-1 text-xs"
            >
              {availableToAdd.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={isPending}
              onClick={handleAdd}
              className="rounded-card border border-surface-border px-2 py-1 text-xs hover:bg-surface-muted"
            >
              Add
            </button>
          </div>
        ) : (
          <span className="text-xs text-gray-400">All roles assigned</span>
        )}
      </td>
    </tr>
  );
}
