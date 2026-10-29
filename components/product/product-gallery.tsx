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
      <div className="flex aspect-square items-center justify-center rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-emerald-50 text-sm font-medium text-slate-500">
        No image yet
      </div>
    );
  }

  return (
    <div>
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-white bg-gradient-to-br from-amber-50 via-white to-emerald-50 shadow-inner">
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
              className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${
                index === activeIndex ? "border-emerald-500 shadow-md scale-105" : "border-amber-100 hover:border-amber-400"
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
