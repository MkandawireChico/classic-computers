export function getPublicSiteOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  // During local development, auth links must return to the local app.
  // An accidentally copied production URL in .env.local must not send
  // local signup, recovery or OAuth flows to the live website.
  if (process.env.NODE_ENV !== "production") {
    if (configured && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(configured)) {
      return configured.replace(/\/$/, "");
    }
    return "http://localhost:3000";
  }

  if (configured) {
    return configured.replace(/\/$/, "");
  }

  return "https://classiccomputers.mw";
}

export function getAuthRedirectUrl(path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${getPublicSiteOrigin()}${cleanPath}`;
}
