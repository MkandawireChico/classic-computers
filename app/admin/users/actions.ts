"use server";

import { revalidatePath } from "next/cache";
import * as userService from "@/lib/services/admin/users";

export async function assignRoleAction(userId: string, roleId: string) {
  const result = await userService.assignRole(userId, roleId);
  if (result.success) revalidatePath("/admin/users");
  return result;
}

export async function removeRoleAction(userId: string, roleId: string) {
  const result = await userService.removeRole(userId, roleId);
  if (result.success) revalidatePath("/admin/users");
  return result;
}
