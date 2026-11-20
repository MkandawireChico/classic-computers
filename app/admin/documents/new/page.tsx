import { notFound } from "next/navigation";
import { getMyPermissions } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";
import { AdminDetailHeader } from "@/components/admin/admin-detail-header";
import { BusinessQuotationBuilder } from "@/components/admin/business-quotation-builder";

export default async function NewBusinessQuotationPage() {
  const permissions = await getMyPermissions();
  if (!permissions.has("orders.write") && !permissions.has("rentals.write")) notFound();

  const supabase = createClient();
  const [{ data: products }, { data: rentalRows }, customerResult] = await Promise.all([
    (supabase.from("products") as any)
      .select("id,name,sku,base_price,sale_price,product_variants(id,name,sku,price,sale_price,status,is_default)")
      .eq("status", "published")
      .order("name")
      .limit(250),
    permissions.has("rentals.write")
      ? (supabase.from("rental_products") as any)
        .select("id,product_id,variant_id,daily_rate,weekly_rate,monthly_rate,products(name,sku,status),product_variants(name,sku,status)")
        .eq("is_available", true)
        .eq("products.status", "published")
      : Promise.resolve({ data: [] }),
    permissions.has("customers.read")
      ? (supabase.from("customers") as any).select("id,profiles(full_name,phone)").order("created_at", { ascending: false }).limit(250)
      : Promise.resolve({ data: [] }),
  ]);

  const productOptions = (products ?? []).flatMap((product: any) => {
    const variants = (product.product_variants ?? []).filter((variant: any) => variant.status === "active");
    if (variants.length) return variants.map((variant: any) => ({
      id: variant.id,
      label: `${product.name} · ${variant.name || variant.sku || product.sku}`,
      description: `${product.name}${variant.name ? ` · ${variant.name}` : ""}`,
      unitPrice: Number(variant.sale_price ?? variant.price),\n      productId: product.id,\n      variantId: variant.id,
    }));
    return [{ id: product.id, label: `${product.name} · ${product.sku}`, description: product.name, unitPrice: Number(product.sale_price ?? product.base_price), productId: product.id }];
  });

  const rentalOptions = (rentalRows ?? []).flatMap((rental: any) => {
    if (rental.products?.status !== "published" || (rental.variant_id && rental.product_variants?.status !== "active")) return [];
    const productName = rental.products?.name ?? "Rental equipment";
    const variantName = rental.product_variants?.name;
    const label = `${productName}${variantName ? ` · ${variantName}` : ""}`;
    return [
      rental.daily_rate ? { id: `${rental.id}:daily`, sourceId: rental.id, productId: rental.product_id, variantId: rental.variant_id ?? undefined, label: `${label} · Daily`, description: `${label} rental (daily rate)`, unitPrice: Number(rental.daily_rate) } : null,
      rental.weekly_rate ? { id: `${rental.id}:weekly`, sourceId: rental.id, label: `${label} · Weekly`, description: `${label} rental (weekly rate)`, unitPrice: Number(rental.weekly_rate) } : null,
      rental.monthly_rate ? { id: `${rental.id}:monthly`, sourceId: rental.id, label: `${label} · Monthly`, description: `${label} rental (monthly rate)`, unitPrice: Number(rental.monthly_rate) } : null,
    ].filter(Boolean);
  });

  const customers = (customerResult.data ?? []).map((customer: any) => ({
    id: customer.id,
    name: customer.profiles?.full_name || `Customer ${customer.id.slice(0, 8)}`,
    phone: customer.profiles?.phone ?? null,
  }));

  return (
    <div className="space-y-6">
      <AdminDetailHeader eyebrow="Commerce · Customer documents" title="New quotation" description="Prepare a product sales or equipment rental quotation. Catalogue prices remain VAT-exclusive." backHref="/admin/documents" backLabel="Back to documents" />
      <BusinessQuotationBuilder products={productOptions} rentals={rentalOptions as any} customers={customers} allowSales={permissions.has("orders.write")} allowRentals={permissions.has("rentals.write")} />
    </div>
  );
}
