import Image from "next/image";
import type { ReviewImage } from "@/types/catalog";

export function ReviewPhotos({ images }: { images: ReviewImage[] }) {
  if (images.length === 0) return null;
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {images.map((image) => (
        <Image
          key={image.id}
          src={image.image_url}
          alt={image.alt_text ?? "Customer-submitted review photo"}
          width={160}
          height={120}
          unoptimized
          className="h-24 w-32 rounded-lg border border-slate-200 object-cover"
        />
      ))}
    </div>
  );
}
