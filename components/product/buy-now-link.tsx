import type { BusinessInfo } from "@/lib/data/site-settings";
import { formatMoney } from "@/lib/format/money";

export function BuyNowLink({
  product,
  businessInfo,
}: {
  product: {
    name: string;
    sku: string;
    slug: string;
    variantName: string | null;
    variantSku: string | null;
    unitPrice: number;
  };
  businessInfo: BusinessInfo | null;
}) {
  const productUrl = `https://classiccomputers.mw/product/${product.slug}`;
  const message = [
    "Hi Classic Computers, I would like to buy:",
    `Product: ${product.name}`,
    `SKU: ${product.variantSku ?? product.sku}`,
    product.variantName ? `Selected configuration: ${product.variantName}` : null,
    `Price: ${formatMoney(product.unitPrice)}`,
    `Product link: ${productUrl}`,
  ].filter(Boolean).join("\n");
  const whatsapp = businessInfo?.whatsapp?.replace(/[^0-9]/g, "");
  const href = whatsapp
    ? `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`
    : businessInfo?.email
      ? `mailto:${businessInfo.email}?subject=${encodeURIComponent(`Purchase enquiry: ${product.name}`)}&body=${encodeURIComponent(message)}`
      : "/contact";
  const external = href.startsWith("https://") || href.startsWith("mailto:");

  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-card bg-emerald-600 px-5 text-base font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
    >
      {whatsapp ? (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 shrink-0" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.198-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.875 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.693.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64.001 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.89c-.001 2.096.547 4.142 1.588 5.946L.057 24l6.304-1.654a11.88 11.88 0 0 0 5.684 1.447h.005c6.554 0 11.89-5.335 11.893-11.89a11.82 11.82 0 0 0-3.48-8.414Z" />
        </svg>
      ) : null}
      <span>Buy Now</span>
    </a>
  );
}