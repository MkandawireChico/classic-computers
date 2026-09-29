import { requirePermission } from "@/lib/auth/permissions";
import { getCategories } from "@/lib/data/categories";
import { CategoriesManager } from "@/components/admin/categories-manager";

export default async function AdminCategoriesPage() {
  await requirePermission("products.read");
  const categories = await getCategories();

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-gray-900">Categories</h1>
      <CategoriesManager categories={categories} />
    </div>
  );
}
