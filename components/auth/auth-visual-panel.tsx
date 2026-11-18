import Image from "next/image";
import { getFeaturedProducts } from "@/lib/data/products";
import { getSiteMedia } from "@/lib/data/site-media";
import { getPublicStorageUrl } from "@/lib/storage";

type AuthVisualPanelProps = {
  eyebrow: string;
  title: string;
  description: string;
  points: [string, string, string];
};

export async function AuthVisualPanel({
  eyebrow,
  title,
  description,
  points,
}: AuthVisualPanelProps) {
  const [storePhotos, banners, featuredProducts] = await Promise.all([
    getSiteMedia("store_photo", 1),
    getSiteMedia("homepage_banner", 1),
    getFeaturedProducts(1),
  ]);

  const sitePhoto = storePhotos[0] ?? banners[0];
  const productPhoto = featuredProducts[0]?.primary_image;
  const imageUrl = sitePhoto
    ? getPublicStorageUrl("site-media", sitePhoto.storage_path)
    : productPhoto
      ? getPublicStorageUrl("product-images", productPhoto.storage_path)
      : null;
  const imageAlt = sitePhoto?.alt_text ?? productPhoto?.alt_text ?? "Technology available from Classic Computers";

  return (
    <section className="relative isolate flex min-h-[300px] overflow-hidden bg-[#081827] text-white sm:min-h-[360px] lg:min-h-screen lg:items-end">
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={imageAlt}
          fill
          priority
          sizes="(max-width: 1023px) 100vw, 50vw"
          className="object-cover"
        />
      ) : (
        <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_75%_35%,rgba(20,158,205,0.4),transparent_42%),linear-gradient(135deg,#0b2238,#071321)]" />
      )}
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#061321] via-[#071827]/75 to-[#071827]/25" />
      <div aria-hidden="true" className="absolute inset-0 bg-[#071827]/15" />

      <div className="relative z-10 w-full px-6 py-9 sm:px-10 sm:py-12 lg:px-14 lg:py-16 xl:px-16">
        <div className="max-w-xl">
          <p className="mb-4 inline-flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-200 sm:text-xs">
            <span className="h-px w-8 bg-cyan-300" />
            {eyebrow}
          </p>
          <h1 className="max-w-lg text-3xl font-semibold leading-[1.04] tracking-tight text-white sm:text-4xl lg:text-5xl xl:text-6xl">
            {title}
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-7 text-slate-200 sm:text-base sm:leading-8">
            {description}
          </p>

          <div className="mt-8 grid gap-3 border-t border-white/20 pt-5 sm:grid-cols-3 lg:grid-cols-1 lg:gap-4">
            {points.map((point, index) => (
              <div key={point} className="flex items-center gap-3 text-sm font-semibold text-white">
                <span className="text-[10px] font-bold tracking-[0.16em] text-cyan-300">0{index + 1}</span>
                <span>{point}</span>
              </div>
            ))}
          </div>
          <p className="mt-8 hidden text-xs font-medium tracking-wide text-slate-300/80 lg:block">
            Classic Computers LLC · Blantyre, Malawi
          </p>
        </div>
      </div>
    </section>
  );
}
