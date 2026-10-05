import { notFound, redirect } from "next/navigation";
import { AuthorizationError, requirePermission } from "@/lib/auth/permissions";
import { getAdminProductById, getAdminRentalConfigurations, getSpecDefinitionsForType } from "@/lib/data/admin/products";
import { getMyPermissions } from "@/lib/auth/permissions";
import { getBrands } from "@/lib/data/brands";
import { getCategories } from "@/lib/data/categories";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductForm } from "@/components/admin/product-form";
import { VariantsManager } from "@/components/admin/variants-manager";
import { SpecificationsManager } from "@/components/admin/specifications-manager";
import { ImagesManager } from "@/components/admin/images-manager";
import { RentalSettingsManager } from "@/components/admin/rental-settings-manager";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  try {
    await requirePermission("products.read");
  } catch (error) {
    if (error instanceof AuthorizationError) {
      redirect(`/sign-in?redirectTo=/admin/products/${params.id}`);
    }
    throw error;
  }

  const [product, brands, categories, permissions] = await Promise.all([
    getAdminProductById(params.id),
    getBrands(),
    getCategories(),
    getMyPermissions(),
  ]);
  if (!product) notFound();

  const canManageRentals = permissions.has("products.write") && permissions.has("rentals.write");
  const [specDefinitions, rentalConfigurations] = await Promise.all([
    getSpecDefinitionsForType(product.product_type),
    canManageRentals ? getAdminRentalConfigurations(product.id) : Promise.resolve([]),
  ]);
  const rentalTargets = product.variants.length > 0
    ? product.variants.map((variant) => ({
        variantId: variant.id,
        label: variant.name,
        status: variant.status,
        inventoryQuantity: variant.inventory?.quantity_on_hand ?? 0,
        isDefault: variant.is_default,
      }))
    : [{
        variantId: null,
        label: product.name,
        status: product.status,
        inventoryQuantity: product.inventory?.quantity_on_hand ?? 0,
        isDefault: true,
      }];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">{product.name}</h1>
        <p className="text-sm text-gray-500">SKU {product.sku}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product information</CardTitle>
        </CardHeader>
        <ProductForm
          initial={{
            id: product.id,
            name: product.name,
            slug: product.slug,
            sku: product.sku,
            brandId: product.brand_id,
            categoryId: product.category_id,
            productType: product.product_type,
            condition: product.condition,
            description: product.description,
            basePrice: product.base_price,
            salePrice: product.sale_price,
            warrantyText: product.warranty_text,
            status: product.status,
            isFeatured: product.is_featured,
            seoTitle: product.seo_title,
            seoDescription: product.seo_description,
          }}
          brands={brands}
          categories={categories}
        />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Variants</CardTitle>
        </CardHeader>
        <VariantsManager product={product} />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rental Settings</CardTitle>
        </CardHeader>
        <RentalSettingsManager
          productId={product.id}
          targets={rentalTargets}
          configurations={rentalConfigurations}
          canManage={canManageRentals}
        />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Specifications</CardTitle>
        </CardHeader>
        <SpecificationsManager product={product} specDefinitions={specDefinitions as any} />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Images</CardTitle>
        </CardHeader>
        <ImagesManager product={product} />
      </Card>
    </div>
  );
}
