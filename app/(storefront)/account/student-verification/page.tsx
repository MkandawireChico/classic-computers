import { getMyStudentVerification } from "@/lib/data/account-student";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { StudentVerificationForm } from "@/components/storefront/student-verification-form";

const STATUS_VARIANT: Record<string, "neutral" | "success" | "warning" | "danger"> = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
  expired: "neutral",
};

export default async function AccountStudentVerificationPage() {
  const verification = await getMyStudentVerification();

  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold text-gray-900">Student Verification</h1>
      <p className="mb-4 text-sm text-gray-500">
        Verified students get access to student-only pricing where configured. Verification is
        reviewed by our team — it is not automatic.
      </p>

      {verification ? (
        <div className="mb-6 rounded-card border border-surface-border p-4">
          <div className="flex items-center gap-2">
            <Badge variant={STATUS_VARIANT[verification.status] ?? "neutral"}>{verification.status}</Badge>
            <span className="text-sm text-gray-600">{verification.institution}</span>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Submitted {new Date(verification.created_at).toLocaleDateString("en-MW", { timeZone: "Africa/Blantyre" })}
          </p>
          {verification.status === "rejected" ? (
            <Alert variant="warning" className="mt-2">
              Your verification was not approved. You can submit a new request below.
            </Alert>
          ) : null}
        </div>
      ) : null}

      {!verification || verification.status !== "pending" ? <StudentVerificationForm /> : null}
    </div>
  );
}
