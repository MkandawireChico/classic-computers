import Link from "next/link";
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

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending review",
  approved: "Approved",
  rejected: "Not approved",
  expired: "Expired",
};

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-MW", {
    timeZone: "Africa/Blantyre",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function AccountStudentVerificationPage() {
  const verification = await getMyStudentVerification();

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-white to-brand-50/70 p-5 shadow-sm sm:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-800">My benefits</p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">Student verification</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Submit your student details for staff review. Once approved, you can access active offers on eligible products while signed in.
        </p>
      </div>

      {verification ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant={STATUS_VARIANT[verification.status] ?? "neutral"} className="text-sm font-semibold">
              {STATUS_LABEL[verification.status] ?? verification.status.replace(/_/g, " ")}
            </Badge>
            <span className="text-base font-semibold text-slate-950">{verification.institution}</span>
          </div>
          <dl className="mt-4 grid gap-3 border-t border-slate-100 pt-4 text-sm sm:grid-cols-3">
            <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Submitted</dt><dd className="mt-1 font-medium text-slate-900">{formatDate(verification.created_at)}</dd></div>
            {verification.reviewed_at ? <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Reviewed</dt><dd className="mt-1 font-medium text-slate-900">{formatDate(verification.reviewed_at)}</dd></div> : null}
            {verification.expires_at ? <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Expires</dt><dd className="mt-1 font-medium text-slate-900">{formatDate(verification.expires_at)}</dd></div> : null}
          </dl>
          {verification.status === "pending" ? <Alert variant="info" className="mt-4">Your application is awaiting staff review. You can check this page for updates.</Alert> : null}
          {verification.status === "approved" ? <Alert variant="success" className="mt-4">You are approved. Sign in at checkout to receive active offers on eligible products.</Alert> : null}
          {verification.status === "rejected" ? (
            <Alert variant="warning" className="mt-4">
              Your verification was not approved. You can submit corrected details for another review below.
            </Alert>
          ) : null}
          {verification.status === "expired" ? <Alert variant="warning" className="mt-4">Your verification has expired. Submit updated student details for review.</Alert> : null}
          {verification.status === "approved" ? <Link href="/student-deals" className="mt-4 inline-flex min-h-11 items-center font-semibold text-brand-800 underline underline-offset-4 hover:text-brand-950">View student offers</Link> : null}
        </div>
      ) : null}

      {!verification || verification.status !== "pending" ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-bold text-slate-950">{verification ? "Submit updated details" : "Apply for student verification"}</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">Your application is reviewed by our team. Approval is not automatic.</p>
          <StudentVerificationForm />
        </div>
      ) : null}
    </div>
  );
}
