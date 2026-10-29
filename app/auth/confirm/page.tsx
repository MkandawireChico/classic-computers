import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getAuthRedirectUrl } from "@/lib/auth/site-url";

function getSafeNext(value?: string): string {
  if (!value) return "/account";
  return value.startsWith("/") && !value.startsWith("//") && value !== "/" ? value : "/account";
}

export default function AuthConfirmPage({
  searchParams,
}: {
  searchParams?: { token_hash?: string; type?: string; next?: string };
}) {
  const tokenHash = searchParams?.token_hash ?? "";
  const type = searchParams?.type ?? "";
  const next = getSafeNext(searchParams?.next);

  if (!tokenHash || !type) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-3 text-center">
            <CardTitle className="text-2xl">Missing verification data</CardTitle>
            <CardDescription className="text-base">
              This confirmation link is incomplete. Please request a new confirmation email and try
              again.
            </CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }

  const callbackUrl = getAuthRedirectUrl(
    `/auth/callback?${new URLSearchParams({
      token_hash: tokenHash,
      type,
      next,
    }).toString()}`,
  );

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3 text-center">
          <CardTitle className="text-2xl">Confirm your email</CardTitle>
          <CardDescription className="text-base">
            Please confirm this email address before continuing to your account.
          </CardDescription>
        </CardHeader>

        <form action={callbackUrl} method="GET" className="mt-4 space-y-4">
          <input type="hidden" name="token_hash" value={tokenHash} />
          <input type="hidden" name="type" value={type} />
          <input type="hidden" name="next" value={next} />
          <Button type="submit" className="w-full">
            Confirm email
          </Button>
        </form>
      </Card>
    </main>
  );
}
