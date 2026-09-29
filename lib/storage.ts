/**
 * Resolves a Storage bucket path into a public URL at render time. Product/
 * site-media rows store only `storage_path` — never an absolute URL — so a
 * bucket/CDN change never requires a data migration. Only call this for
 * PUBLIC buckets (product-images, site-media); private buckets need a
 * signed URL instead, generated server-side after a permission check.
 *
 * Deliberately a plain string builder rather than going through a Supabase
 * client instance: Supabase's public Storage URL shape is stable
 * (`{project-url}/storage/v1/object/public/{bucket}/{path}`), so this works
 * identically in Server Components, Client Components, and route handlers
 * without needing a cookie-bound server client just to format a URL.
 */
export function getPublicStorageUrl(bucket: "product-images" | "site-media", path: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set — cannot resolve a Storage public URL.");
  }
  return `${base}/storage/v1/object/public/${bucket}/${path}`;
}
