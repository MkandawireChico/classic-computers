import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Refreshes the Supabase session on every request and redirects
 * unauthenticated users away from /account and /admin.
 *
 * IMPORTANT: this is a UX convenience, not the security boundary. Even if
 * this check were bypassed entirely, Row Level Security and the server-side
 * permission checks inside each Server Action / Route Handler are what
 * actually protect data. Never add a "trust the middleware" shortcut
 * anywhere else in the codebase.
 */
export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);

  const { pathname } = request.nextUrl;
  const isProtectedRoute =
    pathname.startsWith("/account") || pathname.startsWith("/admin");

  if (isProtectedRoute && !user) {
    const redirectUrl = new URL("/sign-in", request.url);
    redirectUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static assets and image optimization
     * files, so the session cookie stays fresh on every real navigation
     * without doing unnecessary work on every asset request.
     */
    "/((?!api/health|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
