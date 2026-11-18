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
      <div className="flex aspect-square items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-500">
        No image yet
      </div>
    );
  }

  return (
    <div>
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <Image
          key={active!.id}
          src={getPublicStorageUrl("product-images", active!.storage_path)}
          alt={active!.alt_text ?? productName}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-contain p-6 transition-transform duration-300"
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
              className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${
                index === activeIndex ? "border-brand-500 shadow-sm scale-[1.03]" : "border-slate-200 hover:border-brand-300"
              }`}
            >
              <Image
                src={getPublicStorageUrl("product-images", image.storage_path)}
                alt=""
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
