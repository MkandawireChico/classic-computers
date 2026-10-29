import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductBySlug, getRelatedProducts, logProductView } from "@/lib/data/products";
import { getBusinessInfo } from "@/lib/data/site-settings";
import { getPublicStorageUrl } from "@/lib/storage";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getWishlistProductIds } from "@/lib/services/wishlist";
import { getRentableProductsForProduct } from "@/lib/data/rental-tracking";
import { ProductGallery } from "@/components/product/product-gallery";
import { PurchasePanel } from "@/components/product/purchase-panel";
import { SpecificationsTable } from "@/components/product/specifications-table";
import { ProductEnquiry } from "@/components/product/product-enquiry";
import { RelatedProducts } from "@/components/product/related-products";
import { formatCategoryName } from "@/lib/format/category";

interface Params {
  slug: string;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) return {};

  const title = product.seo_title || product.name;
  const description =
    product.seo_description ||
    product.description?.slice(0, 155) ||
    `${product.name} available at Classic Computers LLC, Blantyre.`;
  const imageUrl = product.primary_image ? getPublicStorageUrl("product-images", product.primary_image.storage_path) : undefined;

  return {
    title,
    description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      title,
      description,
      type: "website",
      images: imageUrl ? [{ url: imageUrl }] : undefined,
    },
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  void logProductView(product.id);

  const [related, businessInfo, wishlistEntries, user, rentalOffers] = await Promise.all([
    product.category ? getRelatedProducts(product.category.id, product.id, 4) : Promise.resolve([]),
    getBusinessInfo(),
    getWishlistProductIds(),
    getCurrentUser(),
    getRentableProductsForProduct(product.id),
  ]);
  const isAuthenticated = Boolean(user);
  const initialInWishlist = wishlistEntries.some((w) => w.productId === product.id && w.variantId === null);

  const displayPrice = product.sale_price ?? product.base_price;
  const availability =
    product.inventory_status === "in_stock" || product.inventory_status === "low_stock"
      ? "https://schema.org/InStock"
      : product.inventory_status === "coming_soon"
        ? "https://schema.org/PreOrder"
        : "https://schema.org/OutOfStock";

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku,
    description: product.description ?? undefined,
    brand: product.brand ? { "@type": "Brand", name: product.brand.name } : undefined,
    image: product.images.map((img) => getPublicStorageUrl("product-images", img.storage_path)),
    itemCondition:
      product.condition === "new"
        ? "https://schema.org/NewCondition"
        : product.condition === "refurbished"
          ? "https://schema.org/RefurbishedCondition"
          : "https://schema.org/UsedCondition",
    offers: {
      "@type": "Offer",
      priceCurrency: "MWK",
      price: displayPrice,
      availability,
      url: `https://classiccomputers.mw/product/${product.slug}`,
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Shop", item: "https://classiccomputers.mw/shop" },
      product.category
        ? {
            "@type": "ListItem",
            position: 2,
            name: formatCategoryName(product.category.name),
            item: `https://classiccomputers.mw/shop/${product.category.slug}`,
          }
        : undefined,
      {
        "@type": "ListItem",
        position: product.category ? 3 : 2,
        name: product.name,
        item: `https://classiccomputers.mw/product/${product.slug}`,
      },
    ].filter(Boolean),
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/50 via-white to-emerald-50/40">
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <div className="section-shell py-6 sm:py-8 lg:py-10">
        <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
          <Link href="/shop" className="rounded px-1 font-semibold text-emerald-800 transition-colors hover:text-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600">
            Shop
          </Link>
          {product.category ? (
            <>
              <span aria-hidden="true" className="text-amber-600">/</span>
              <Link href={`/shop/${product.category.slug}`} className="rounded px-1 font-semibold text-emerald-800 transition-colors hover:text-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600">
                {formatCategoryName(product.category.name)}
              </Link>
            </>
          ) : null}
          <span aria-hidden="true" className="text-amber-600">/</span>
          <span aria-current="page" className="min-w-0 text-slate-600">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-8">
          <div className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-amber-50 p-3 shadow-lg shadow-emerald-950/5 sm:p-5">
            <ProductGallery images={product.images} productName={product.name} />
          </div>

          <div className="rounded-3xl border border-amber-100 bg-white/95 p-5 shadow-lg shadow-amber-950/5 sm:p-7 lg:p-8">
            <div className="mb-5">
              {product.brand ? (
                <p className="mb-3 inline-flex rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-violet-800">
                  {product.brand.name}
                </p>
              ) : null}
              <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl">{product.name}</h1>
              <p className="mt-3 inline-flex rounded-md bg-slate-100 px-2.5 py-1 font-mono text-xs font-medium text-slate-700">
                SKU: {product.sku}
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/70 to-white p-4 sm:p-5">
              <PurchasePanel
                product={product}
                businessInfo={businessInfo}
                isAuthenticated={isAuthenticated}
                initialInWishlist={initialInWishlist}
                rentalOffers={rentalOffers}
              />
            </div>

            {product.warranty_text ? (
              <div className="mt-4 flex min-h-11 items-center justify-center gap-2.5 rounded-2xl border border-violet-200 bg-violet-50/70 p-4 text-sm">
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 shrink-0 text-violet-700" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M12 3.5 5.5 6v4.5c0 3.7 2.3 7.1 6.5 9.5 4.2-2.4 6.5-5.8 6.5-9.5V6L12 3.5Z" />
                    <path d="m9.5 12 1.5 1.5 3.5-4" />
                  </svg>
                  <span className="whitespace-nowrap font-bold text-violet-900">Warranty</span>
                  <span aria-hidden="true" className="h-4 w-px bg-violet-300" />
                  <span className="whitespace-nowrap font-semibold text-slate-800">{product.warranty_text}</span>
              </div>
            ) : null}

            <div className="mt-4">
              <ProductEnquiry product={product} businessInfo={businessInfo} showWhatsApp={false} />
            </div>
          </div>
        </div>

        {product.description ? (
          <section className="mt-8 rounded-3xl border border-amber-100 bg-gradient-to-br from-amber-50/70 via-white to-rose-50/50 p-5 shadow-sm sm:mt-10 sm:p-7">
            <div className="mb-4 flex items-center gap-3">
              <span aria-hidden="true" className="h-8 w-1.5 rounded-full bg-amber-500" />
              <h2 className="text-xl font-extrabold text-slate-900 sm:text-2xl">Description</h2>
            </div>
            <p className="whitespace-pre-line text-sm leading-7 text-slate-700 sm:text-base">{product.description}</p>
          </section>
        ) : null}

        {product.specifications.length > 0 ? (
          <section className="mt-8 sm:mt-10">
            <div className="mb-4 flex items-center gap-3">
              <span aria-hidden="true" className="h-8 w-1.5 rounded-full bg-emerald-500" />
              <h2 className="text-xl font-extrabold text-slate-900 sm:text-2xl">Specifications</h2>
            </div>
            <SpecificationsTable specifications={product.specifications} />
          </section>
        ) : null}

        <RelatedProducts products={related} />
      </div>
    </div>
  );
}
