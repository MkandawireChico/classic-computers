"use client";

import { useState } from "react";
import Image from "next/image";
import { getPublicStorageUrl } from "@/lib/storage";
import { trackInterestEvent } from "@/lib/client/customer-interest-analytics";
import type { ProductImage } from "@/types/catalog";

export function ProductGallery({ images, productName, productId }: { images: ProductImage[]; productName: string; productId: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = images[Math.min(activeIndex, Math.max(images.length - 1, 0))] ?? null;

  if (images.length === 0) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 text-sm font-medium text-slate-500">
        No image yet
      </div>
    );
  }

  return (
    <div>
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <Image
          key={active!.id}
          src={getPublicStorageUrl("product-images", active!.storage_path)}
          alt={active!.alt_text ?? productName}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-contain p-5 sm:p-8 transition-transform duration-500"
        />
      </div>

      {images.length > 1 ? (
        <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => {
                if (index !== activeIndex) trackInterestEvent({ name: "product_gallery_opened", productId });
                setActiveIndex(index);
              }}
              aria-label={`Show image ${index + 1} of ${images.length}`}
              aria-current={index === activeIndex}
              className={`relative h-[4.5rem] w-[4.5rem] shrink-0 overflow-hidden rounded-xl border-2 bg-slate-50 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${
                index === activeIndex ? "border-brand-500 shadow-sm scale-[1.03]" : "border-slate-200 hover:border-brand-300"
              }`}
            >
              <Image
                src={getPublicStorageUrl("product-images", image.storage_path)}
                alt=""
                fill
                sizes="80px"
                className="object-contain p-1.5"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
