import { requirePermission } from "@/lib/auth/permissions";
import { listAllSiteMedia } from "@/lib/services/admin/site-media";
import { SiteMediaManager } from "@/components/admin/site-media-manager";

export default async function AdminSiteMediaPage() {
  await requirePermission("settings.write");
  const items = await listAllSiteMedia();

  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold text-gray-900">Site Media</h1>
      <p className="mb-4 text-sm text-gray-500">
        Controls homepage/marketing imagery only — product photos are managed from each product&apos;s
        own page. Upload the real Classic Computers shop photograph here under &ldquo;homepage hero&rdquo;
        once you have the file.
      </p>
      <SiteMediaManager items={items} />
    </div>
  );
}
