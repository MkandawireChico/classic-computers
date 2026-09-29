import "server-only";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requirePermission, AuthorizationError } from "@/lib/auth/permissions";

export type ServiceResult = { success: true } | { success: false; error: string };

const decisionSchema = z.object({
  verificationId: z.string().uuid(),
  status: z.enum(["approved", "rejected"]),
});

/**
 * sync_customer_student_status() (0020) automatically mirrors this onto
 * customers.student_status, and notify_student_verification_decision()
 * (0036) automatically notifies the customer — neither needs to be
 * called separately here.
 */
export async function decideStudentVerification(input: unknown): Promise<ServiceResult> {
  try {
    await requirePermission("students.verify");
  } catch (e) {
    if (e instanceof AuthorizationError) return { success: false, error: "You don't have permission to review student verifications." };
    throw e;
  }

  const parsed = decisionSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid decision." };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: current } = await (supabase.from("student_verifications") as any)
    .select("status")
    .eq("id", parsed.data.verificationId)
    .maybeSingle();
  if (!current) return { success: false, error: "Verification not found." };
  if (current.status !== "pending") {
    return { success: false, error: `This verification is already ${current.status}, not pending.` };
  }

  const { error } = await (supabase.from("student_verifications") as any)
    .update({ status: parsed.data.status, reviewed_by: user?.id ?? null, reviewed_at: new Date().toISOString() })
    .eq("id", parsed.data.verificationId);

  if (error) {
    console.error("decideStudentVerification update failed:", error.message);
    return { success: false, error: "Could not record decision." };
  }
  return { success: true };
}
