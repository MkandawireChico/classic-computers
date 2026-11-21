"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { getPublicStorageUrl } from "@/lib/storage";
import { trackInterestEvent } from "@/lib/client/customer-interest-analytics";
import type { ProductImage } from "@/types/catalog";
import { useProductVariant } from "./product-variant-context";

export function ProductGallery({ images, productName, productId }: { images: ProductImage[]; productName: string; productId: string }) {
  const { selectedVariantId } = useProductVariant();
  const visibleImages = useMemo(() => {
    const productImages = images.filter((image) => image.variant_id === null);
    const selectedVariantImages = selectedVariantId
      ? images.filter((image) => image.variant_id === selectedVariantId)
      : [];
    if (selectedVariantImages.length > 0) return [...productImages, ...selectedVariantImages];
    if (productImages.length > 0) return productImages;
    // Some catalogues have images attached only to variants. Keep the
    // gallery useful when the selected configuration has no dedicated
    // image instead of presenting an empty image state.
    return images;
  }, [images, selectedVariantId]);
  const [activeIndex, setActiveIndex] = useState(0);
  const active = visibleImages[Math.min(activeIndex, Math.max(visibleImages.length - 1, 0))] ?? null;

  useEffect(() => {
    setActiveIndex(0);
  }, [productId, visibleImages]);

  function selectImage(index: number) {
    if (index === activeIndex || index < 0 || index >= visibleImages.length) return;
    trackInterestEvent({ name: "product_gallery_opened", productId });
    setActiveIndex(index);
  }

  if (visibleImages.length === 0) {
    return (
      <div
        role="img"
        aria-label={`No product image available for ${productName}`}
        className="flex aspect-[4/3] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-surface-muted text-sm font-medium text-slate-500"
      >
        Product image coming soon
      </div>
    );
  }

  return (
    <section aria-label={`Images of ${productName}`} className="min-w-0">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-slate-100 bg-surface-muted">
        <Image
          key={active!.id}
          src={getPublicStorageUrl("product-images", active!.storage_path)}
          alt={active!.alt_text?.trim() || productName}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-contain p-5 sm:p-8"
        />
        {visibleImages.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() => selectImage((activeIndex - 1 + visibleImages.length) % visibleImages.length)}
              aria-label="Show previous product image"
              className="absolute left-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-xl font-semibold text-slate-800 shadow-sm transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            >
              <span aria-hidden="true">‹</span>
            </button>
            <button
              type="button"
              onClick={() => selectImage((activeIndex + 1) % visibleImages.length)}
              aria-label="Show next product image"
              className="absolute right-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-xl font-semibold text-slate-800 shadow-sm transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            >
              <span aria-hidden="true">›</span>
            </button>
            <span className="absolute bottom-3 right-3 rounded-full bg-slate-950/75 px-3 py-1 text-xs font-semibold tabular-nums text-white" aria-live="polite">
              {activeIndex + 1} / {visibleImages.length}
            </span>
          </>
        ) : null}
      </div>

      {visibleImages.length > 1 ? (
        <div className="mt-4 flex gap-3 overflow-x-auto pb-2" role="group" aria-label="Choose product image">
          {visibleImages.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => selectImage(index)}
              aria-label={`Show image ${index + 1} of ${visibleImages.length}`}
              aria-pressed={index === activeIndex}
              className={`relative h-[4.5rem] w-[4.5rem] shrink-0 overflow-hidden rounded-xl border-2 bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${
                index === activeIndex ? "border-brand-500 shadow-sm" : "border-slate-200 hover:border-brand-300"
              }`}
            >
              <Image
                src={getPublicStorageUrl("product-images", image.storage_path)}
                alt=""
                fill
                sizes="72px"
                className="object-contain p-1.5"
              />
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}
