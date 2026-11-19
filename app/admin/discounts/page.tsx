import { requirePermission } from "@/lib/auth/permissions";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { listDiscountProductOptions, listDiscounts } from "@/lib/services/admin/discounts";
import { DiscountsManager } from "@/components/admin/discounts-manager";

export default async function AdminDiscountsPage() {
  await requirePermission("settings.write");
  const [discounts, products] = await Promise.all([listDiscounts(), listDiscountProductOptions()]);

  return (
    <div>
      <AdminPageHeader eyebrow="Commerce · Promotions" title="Discounts" description="Manage promotional codes and discount rules." />
      <p className="mb-4 text-sm text-gray-500">
        These conditions are exactly what <code>create_order()</code> enforces at checkout — there
        is no discount behavior here that the database doesn&apos;t also apply.
      </p>
      <DiscountsManager discounts={discounts} products={products} />
    </div>
  );
}
