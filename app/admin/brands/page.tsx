import { requirePermission } from "@/lib/auth/permissions";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { getBrands } from "@/lib/data/brands";
import { BrandsManager } from "@/components/admin/brands-manager";

export default async function AdminBrandsPage() {
  await requirePermission("products.read");
  const brands = await getBrands();

  return (
    <div>
      <AdminPageHeader eyebrow="Catalogue · Organisation" title="Brands" description="Manage the brands associated with products in the store." />
      <BrandsManager brands={brands} />
    </div>
  );
}
