import "server-only";
import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

/**
 * Privileged Supabase client using the service-role key. Bypasses Row Level
 * Security entirely.
 *
 * The `server-only` import above causes a build-time error if this module is
 * ever imported from a Client Component or anything that ends up in the
 * browser bundle — that is intentional and must not be removed.
 *
 * Use this ONLY for operations that genuinely require bypassing RLS after
 * you have already performed your own authorization check server-side
 * (e.g. admin-only migrations, scheduled jobs, or system-level writes such
 * as audit log inserts). Prefer lib/supabase/server.ts (RLS-bound) for
 * everything else — reaching for this file is an exception, not a default.
 */
export function createAdminClient(): SupabaseClient<Database> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. This client must never be constructed without it, " +
        "and must never be called from client-side code.",
    );
  }

  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  ) as SupabaseClient<Database>;
}
