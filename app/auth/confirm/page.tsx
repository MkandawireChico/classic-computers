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
  searchParams?: { code?: string; token_hash?: string; type?: string; flow?: string; next?: string };
}) {
  const code = searchParams?.code ?? "";
  const tokenHash = searchParams?.token_hash ?? "";
  const type = searchParams?.type ?? (searchParams?.flow === "signup" ? "signup" : "");
  const next = getSafeNext(searchParams?.next);

  if ((!code && !tokenHash) || !type) {
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

  const callbackParams = new URLSearchParams({ type, next });
  if (code) callbackParams.set("code", code);
  else callbackParams.set("token_hash", tokenHash);
  const callbackUrl = getAuthRedirectUrl(`/auth/callback?${callbackParams.toString()}`);

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
          {code ? <input type="hidden" name="code" value={code} /> : <input type="hidden" name="token_hash" value={tokenHash} />}
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
