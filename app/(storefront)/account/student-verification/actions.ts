"use server";

import { revalidatePath } from "next/cache";
import { submitStudentVerification } from "@/lib/services/student-verification";

export async function submitStudentVerificationAction(formData: FormData) {
  const result = await submitStudentVerification(formData);
  if (result.success) revalidatePath("/account/student-verification");
  return result;
}
