import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function AuthVerifiedPage({
  searchParams,
}: {
  searchParams?: { next?: string };
}) {
  const requestedNext = searchParams?.next;
  const next =
    requestedNext && requestedNext.startsWith("/") && !requestedNext.startsWith("//") && requestedNext !== "/"
      ? requestedNext
      : "/account";

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3 text-center">
          <CardTitle className="text-2xl">Email verified</CardTitle>
          <CardDescription className="text-base">
            Your email has been confirmed. Your account is ready to use.
          </CardDescription>
        </CardHeader>

        <div className="mt-2 flex justify-center">
          <Link
            href={next}
            className="inline-flex items-center justify-center rounded-card bg-brand-600 px-5 py-3 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
          >
            Go to your account
          </Link>
        </div>
      </Card>
    </main>
  );
}
