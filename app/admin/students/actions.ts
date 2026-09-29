"use server";

import { revalidatePath } from "next/cache";
import { decideStudentVerification } from "@/lib/services/admin/students";

export async function decideStudentVerificationAction(input: unknown) {
  const result = await decideStudentVerification(input);
  if (result.success) revalidatePath("/admin/students");
  return result;
}
