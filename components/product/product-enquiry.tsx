import type { BusinessInfo } from "@/lib/data/site-settings";
import { TrackedEnquiryLink } from "./tracked-enquiry-link";

export function ProductEnquiry({
  product,
  businessInfo,
  showWhatsApp = true,
}: {
  product: { id?: string; name: string; sku: string };
  businessInfo: BusinessInfo | null;
  showWhatsApp?: boolean;
}) {
  if (!businessInfo) return null;

  const message = encodeURIComponent(
    `Hi, I'm interested in the ${product.name} (SKU: ${product.sku}).`,
  );
  const phoneHref = businessInfo.phone?.replace(/[^\d+]/g, "");

  const showBoth = showWhatsApp && businessInfo.whatsapp && businessInfo.phone && phoneHref;

  return (
    <div className="border-t border-surface-border pt-4">
      <div className={`grid w-full gap-2 sm:gap-3 ${showBoth ? "grid-cols-2" : "grid-cols-1"}`}>
        {showWhatsApp && businessInfo.whatsapp ? (
          <TrackedEnquiryLink
            href={`https://wa.me/${businessInfo.whatsapp.replace(/[^0-9]/g, "")}?text=${message}`}
            eventName="whatsapp_clicked"
            productId={product.id}
            target="_blank"
            rel="noopener noreferrer"
            ariaLabel="Message us on WhatsApp"
            className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-card border border-emerald-200 bg-emerald-50 px-3 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-4 w-4 shrink-0 text-[#25D366]"
              fill="currentColor"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.198-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.875 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.693.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64.001 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.89c-.001 2.096.547 4.142 1.588 5.946L.057 24l6.304-1.654a11.88 11.88 0 0 0 5.684 1.447h.005c6.554 0 11.89-5.335 11.893-11.89a11.82 11.82 0 0 0-3.48-8.414Z" />
            </svg>
          </TrackedEnquiryLink>
        ) : null}
        {businessInfo.phone && phoneHref ? (
          <TrackedEnquiryLink
            href={`tel:${phoneHref}`}
            eventName="telephone_clicked"
            productId={product.id}
            ariaLabel={`Call ${businessInfo.phone}`}
            className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-card border border-surface-border bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-4 w-4 text-brand-600"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.86 19.86 0 0 1 3.1 5.18 2 2 0 0 1 5.08 3h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.63 2.62a2 2 0 0 1-.45 2.11L9 10.91a16 16 0 0 0 4.09 4.09l1.46-1.26a2 2 0 0 1 2.11-.45c.84.3 1.72.51 2.62.63A2 2 0 0 1 22 16.92Z" />
            </svg>
          </TrackedEnquiryLink>
        ) : null}
      </div>
    </div>
  );
}
