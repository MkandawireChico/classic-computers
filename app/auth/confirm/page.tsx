import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getAuthRedirectUrl } from "@/lib/auth/site-url";

function getSafeNext(value?: string, type?: string): string {
  const fallback = type === "recovery" ? "/update-password" : "/account";
  if (!value) return fallback;
  return value.startsWith("/") && !value.startsWith("//") && value !== "/" ? value : fallback;
}

export default function AuthConfirmPage({
  searchParams,
}: {
  searchParams?: { code?: string; token_hash?: string; type?: string; flow?: string; next?: string };
}) {
  const code = searchParams?.code ?? "";
  const tokenHash = searchParams?.token_hash ?? "";
  const type = searchParams?.type ?? (
    searchParams?.flow === "signup" ? "signup" :
    searchParams?.flow === "recovery" ? "recovery" : ""
  );
  const next = getSafeNext(searchParams?.next, type);
  const isRecovery = type === "recovery";

  if ((!code && !tokenHash) || !["signup", "recovery", "email", "magiclink", "otp"].includes(type)) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-3 text-center">
            <CardTitle className="text-2xl">Invalid email link</CardTitle>
            <CardDescription className="text-base">
              This link is incomplete or no longer valid. Request a fresh email and open the newest link.
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
          <CardTitle className="text-2xl">{isRecovery ? "Continue password reset" : "Confirm your email"}</CardTitle>
          <CardDescription className="text-base">
            {isRecovery
              ? "Continue to securely choose a new password for your account."
              : "Confirm this email address to finish setting up your account."}
          </CardDescription>
        </CardHeader>

        <form action={callbackUrl} method="GET" className="mt-4 space-y-4">
          {code ? <input type="hidden" name="code" value={code} /> : <input type="hidden" name="token_hash" value={tokenHash} />}
          <input type="hidden" name="type" value={type} />
          <input type="hidden" name="next" value={next} />
          <Button type="submit" className="w-full">
            {isRecovery ? "Continue to reset password" : "Confirm email"}
          </Button>
        </form>
      </Card>
    </main>
  );
}
