import "server-only";
import { createClient } from "@/lib/supabase/server";
import { studentVerificationSchema } from "@/schemas/student-verification";

export type StudentVerificationResult = { success: true } | { success: false; error: string };

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "application/pdf"]);
const MAX_BYTES = 5 * 1024 * 1024;

/**
 * Requires an authenticated session — student_verifications.customer_id
 * is NOT NULL (0020), so this is one of the "account required for secure
 * ongoing tracking" cases the brief anticipates; there is no guest path
 * for this one, unlike repairs/rentals.
 */
export async function submitStudentVerification(formData: FormData): Promise<StudentVerificationResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Sign in to submit student verification." };

  const parsed = studentVerificationSchema.safeParse({
    fullName: formData.get("fullName")?.toString() ?? "",
    institution: formData.get("institution")?.toString() ?? "",
    studentIdNumber: formData.get("studentIdNumber")?.toString() ?? "",
    phone: formData.get("phone")?.toString() ?? "",
    email: formData.get("email")?.toString() ?? "",
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  const { data: existing } = await (supabase.from("student_verifications") as any)
    .select("id, status")
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (existing && existing.status === "pending") {
    return { success: false, error: "You already have a verification request pending review." };
  }

  let documentPath: string | null = null;
  const file = formData.get("document") as File | null;
  if (file && file.size > 0) {
    if (!ALLOWED_TYPES.has(file.type)) return { success: false, error: "Document must be a JPEG, PNG, or PDF." };
    if (file.size > MAX_BYTES) return { success: false, error: "Document must be 5MB or smaller." };

    // Path convention enforced by the bucket's own upload policy (0029):
    // student-documents/{auth.uid()}/... — a staff member with
    // students.verify can read any path, but only the uploader's own
    // session can write into their own folder.
    const ext = file.type === "application/pdf" ? "pdf" : file.type === "image/png" ? "png" : "jpg";
    documentPath = `${user.id}/${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from("student-documents").upload(documentPath, file, {
      contentType: file.type,
    });
    if (uploadError) return { success: false, error: "Could not upload document." };
  }

  const { error } = await (supabase.from("student_verifications") as any).insert({
    customer_id: user.id,
    full_name: parsed.data.fullName,
    institution: parsed.data.institution,
    student_id_number: parsed.data.studentIdNumber,
    phone: parsed.data.phone,
    email: parsed.data.email,
    document_path: documentPath,
  });

  if (error) {
    console.error("submitStudentVerification insert failed:", error.message);
    if (documentPath) await supabase.storage.from("student-documents").remove([documentPath]);
    return { success: false, error: "Could not submit verification. Please try again." };
  }
  return { success: true };
}
