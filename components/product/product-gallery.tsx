"use client";

import { useState } from "react";
import Image from "next/image";
import { getPublicStorageUrl } from "@/lib/storage";
import type { ProductImage } from "@/types/catalog";

export function ProductGallery({ images, productName }: { images: ProductImage[]; productName: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = images[Math.min(activeIndex, Math.max(images.length - 1, 0))] ?? null;

  if (images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-card bg-surface-muted text-sm text-gray-400">
        No image yet
      </div>
    );
  }

  return (
    <div>
      <div className="relative aspect-square w-full overflow-hidden rounded-card bg-gradient-to-br from-surface-muted to-white shadow-inner">
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
              onClick={() => setActiveIndex(index)}
              aria-label={`Show image ${index + 1} of ${images.length}`}
              aria-current={index === activeIndex}
              className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${
                index === activeIndex ? "border-brand-500 shadow-md scale-105" : "border-surface-border hover:border-brand-300"
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
