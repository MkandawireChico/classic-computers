import { NextResponse } from "next/server";

/**
 * Basic health/readiness check. Reports whether required env vars are
 * present WITHOUT ever echoing their values back — useful for confirming
 * local/staging setup is wired correctly before deeper testing.
 */
export async function GET() {
  const checks = {
    supabaseUrlConfigured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    supabaseAnonKeyConfigured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    serviceRoleKeyConfigured: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
  };

  const ok = checks.supabaseUrlConfigured && checks.supabaseAnonKeyConfigured;

  return NextResponse.json({ ok, checks }, { status: ok ? 200 : 503 });
}
