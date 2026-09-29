import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/permissions";
import { getAdminStudentVerificationById, getStudentDocumentSignedUrl } from "@/lib/data/admin/students";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { StudentDecisionControls } from "@/components/admin/student-decision-controls";

export default async function AdminStudentDetailPage({ params }: { params: { id: string } }) {
  await requirePermission("students.read");
  const verification = await getAdminStudentVerificationById(params.id);
  if (!verification) notFound();

  const documentUrl = verification.document_path
    ? await getStudentDocumentSignedUrl(verification.document_path)
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">{verification.full_name}</h1>
        <p className="text-sm text-gray-500">{verification.institution}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <div className="space-y-1 text-sm text-gray-700">
            <p>
              <span className="font-medium text-gray-900">Student ID:</span> {verification.student_id_number}
            </p>
            <p>
              <span className="font-medium text-gray-900">Phone:</span> {verification.phone}
            </p>
            <p>
              <span className="font-medium text-gray-900">Email:</span> {verification.email}
            </p>
            <p>
              <span className="font-medium text-gray-900">Submitted:</span>{" "}
              {new Date(verification.created_at).toLocaleString("en-MW", { timeZone: "Africa/Blantyre" })}
            </p>
          </div>

          {verification.document_path ? (
            documentUrl ? (
              <a href={documentUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm text-brand-600 hover:underline">
                View submitted document (link expires in 5 minutes)
              </a>
            ) : (
              <p className="mt-3 text-sm text-status-danger">Could not generate a document link.</p>
            )
          ) : (
            <p className="mt-3 text-sm text-gray-500">No document was submitted.</p>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Decision</CardTitle>
          </CardHeader>
          <StudentDecisionControls verificationId={verification.id} status={verification.status} />
        </Card>
      </div>
    </div>
  );
}
