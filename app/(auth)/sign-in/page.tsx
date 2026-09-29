import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { SignInForm } from "./sign-in-form";

export default function SignInPage({
  searchParams,
}: {
  searchParams: { verify?: string; redirectTo?: string };
}) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>Access your Classic Computers account</CardDescription>
        </CardHeader>

        {searchParams.verify ? (
          <Alert variant="info" className="mb-4">
            Check your email to confirm your account before signing in.
          </Alert>
        ) : null}

        <SignInForm redirectTo={searchParams.redirectTo} />

        <p className="mt-4 text-center text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <Link
            href={searchParams.redirectTo ? `/sign-up?redirectTo=${encodeURIComponent(searchParams.redirectTo)}` : "/sign-up"}
            className="font-medium text-brand-600 hover:underline"
          >
            Sign up
          </Link>
        </p>
      </Card>
    </main>
  );
}
