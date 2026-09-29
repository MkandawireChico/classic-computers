import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SignUpForm } from "./sign-up-form";

export default function SignUpPage({ searchParams }: { searchParams: { ref?: string; redirectTo?: string } }) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>Track orders, repairs, rentals and more</CardDescription>
        </CardHeader>

        <SignUpForm initialReferralCode={searchParams.ref} redirectTo={searchParams.redirectTo} />

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/sign-in" className="font-medium text-brand-600 hover:underline">
            Sign in
          </Link>
        </p>
      </Card>
    </main>
  );
}
