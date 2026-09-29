import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

const STATIC_ROUTES = [
  "",
  "/shop",
  "/rentals",
  "/repairs",
  "/corporate",
  "/student-deals",
  "/about",
  "/contact",
  "/warranty",
  "/returns",
  "/privacy",
  "/terms",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const supabase = createClient();

  const [{ data: products }, { data: categories }] = await Promise.all([
    (supabase.from("products") as any).select("slug, updated_at").eq("status", "published"),
    (supabase.from("categories") as any).select("slug, updated_at"),
  ]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${siteUrl}${path}`,
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.6,
  }));

  const categoryEntries: MetadataRoute.Sitemap = (categories ?? []).map((c: any) => ({
    url: `${siteUrl}/shop/${c.slug}`,
    lastModified: c.updated_at,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const productEntries: MetadataRoute.Sitemap = (products ?? []).map((p: any) => ({
    url: `${siteUrl}/product/${p.slug}`,
    lastModified: p.updated_at,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticEntries, ...categoryEntries, ...productEntries];
}
