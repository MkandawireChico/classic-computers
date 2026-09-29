import { requirePermission } from "@/lib/auth/permissions";
import { getBrands } from "@/lib/data/brands";
import { getCategories } from "@/lib/data/categories";
import { ProductForm } from "@/components/admin/product-form";

export default async function NewProductPage() {
  await requirePermission("products.write");
  const [brands, categories] = await Promise.all([getBrands(), getCategories()]);

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-gray-900">New product</h1>
      <ProductForm brands={brands} categories={categories} />
    </div>
  );
}
