import Image from "next/image";
import type { ReviewImage } from "@/types/catalog";

export function ReviewPhotos({ images }: { images: ReviewImage[] }) {
  if (images.length === 0) return null;
  return (
    <ul aria-label="Customer review photos" className="mt-3 flex flex-wrap gap-2">
      {images.map((image, index) => (
        <li key={image.id}>
          <Image
            src={image.image_url}
            alt={image.alt_text?.trim() || `Customer-submitted review photo ${index + 1}`}
            width={160}
            height={120}
            unoptimized
            className="h-24 w-32 rounded-lg border border-slate-200 bg-surface-muted object-cover"
          />
        </li>
      ))}
    </ul>
  );
}
