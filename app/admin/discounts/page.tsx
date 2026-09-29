import { requirePermission } from "@/lib/auth/permissions";
import { listDiscounts } from "@/lib/services/admin/discounts";
import { DiscountsManager } from "@/components/admin/discounts-manager";

export default async function AdminDiscountsPage() {
  await requirePermission("settings.write");
  const discounts = await listDiscounts();

  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold text-gray-900">Discounts</h1>
      <p className="mb-4 text-sm text-gray-500">
        These conditions are exactly what <code>create_order()</code> enforces at checkout — there
        is no discount behavior here that the database doesn&apos;t also apply.
      </p>
      <DiscountsManager discounts={discounts} />
    </div>
  );
}
