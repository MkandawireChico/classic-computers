import { requirePermission } from "@/lib/auth/permissions";
import { listAllSiteMedia } from "@/lib/services/admin/site-media";
import { SiteMediaManager } from "@/components/admin/site-media-manager";

export default async function AdminSiteMediaPage() {
  await requirePermission("settings.write");
  const items = await listAllSiteMedia();

  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold text-gray-900">Site Media</h1>
      <p className="mb-4 max-w-3xl text-sm leading-6 text-gray-500">
        Manage the images used across the public website. Upload the official brand mark under
        &ldquo;logo&rdquo; and a wide or light-background version under &ldquo;footer logo&rdquo; when available.
        Use &ldquo;homepage banner&rdquo; or &ldquo;homepage hero&rdquo; for the main storefront image,
        &ldquo;store photo&rdquo; for real shop photography, and the rental or corporate placements
        for their matching promotional sections. Product photos stay on each product&apos;s own page.
      </p>
      <SiteMediaManager items={items} />
    </div>
  );
}
