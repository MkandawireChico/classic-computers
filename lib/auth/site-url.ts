export function getPublicSiteOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, "");
  }

  if (process.env.NODE_ENV === "production") {
    return "https://classiccomputers.mw";
  }

  return "http://localhost:3000";
}

export function getAuthRedirectUrl(path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${getPublicSiteOrigin()}${cleanPath}`;
}
