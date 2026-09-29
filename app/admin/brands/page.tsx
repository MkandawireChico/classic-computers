import { requirePermission } from "@/lib/auth/permissions";
import { getBrands } from "@/lib/data/brands";
import { BrandsManager } from "@/components/admin/brands-manager";

export default async function AdminBrandsPage() {
  await requirePermission("products.read");
  const brands = await getBrands();

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-gray-900">Brands</h1>
      <BrandsManager brands={brands} />
    </div>
  );
}
