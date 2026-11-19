import { requirePermission } from "@/lib/auth/permissions";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { getCategories } from "@/lib/data/categories";
import { CategoriesManager } from "@/components/admin/categories-manager";

export default async function AdminCategoriesPage() {
  await requirePermission("products.read");
  const categories = await getCategories();

  return (
    <div>
      <AdminPageHeader eyebrow="Catalogue · Organisation" title="Categories" description="Organise products into clear storefront categories." />
      <CategoriesManager categories={categories} />
    </div>
  );
}
