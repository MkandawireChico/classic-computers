import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductBySlug, getRelatedProducts } from "@/lib/data/products";
import { getBusinessInfo } from "@/lib/data/site-settings";
import { getPublicStorageUrl } from "@/lib/storage";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getWishlistProductIds } from "@/lib/services/wishlist";
import { getRentableProductsForProduct } from "@/lib/data/rental-tracking";
import { getProductReviews, getProductRatingSummary } from "@/lib/data/reviews";
import { RatingBreakdown } from "@/components/storefront/rating-breakdown";
import { ReviewPhotos } from "@/components/storefront/review-photos";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductVariantProvider } from "@/components/product/product-variant-context";
import { PurchasePanel } from "@/components/product/purchase-panel";
import { SpecificationsTable } from "@/components/product/specifications-table";
import { ProductEnquiry } from "@/components/product/product-enquiry";
import { RelatedProducts } from "@/components/product/related-products";
import { formatCategoryName } from "@/lib/format/category";
import { ProductInterestTracker } from "@/components/storefront/analytics-page-tracker";

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

  const [related, businessInfo, wishlistEntries, user, rentalOffers, reviews, ratingSummary] = await Promise.all([
    product.category ? getRelatedProducts(product.category.id, product.id, 4) : Promise.resolve([]),
    getBusinessInfo(),
    getWishlistProductIds(),
    getCurrentUser(),
    getRentableProductsForProduct(product.id),
    getProductReviews(product.id, 5),
    getProductRatingSummary(product.id),
  ]);
  const isAuthenticated = Boolean(user);
  const initialInWishlist = wishlistEntries.some((w) => w.productId === product.id && w.variantId === null);

  const displayPrice = product.sale_price !== null && product.sale_price > 0 && product.sale_price < product.base_price
    ? product.sale_price
    : product.base_price;
  const activeSchemaVariants = product.variants.filter((variant) => variant.status === "active");
  const schemaVariant =
    activeSchemaVariants.find((variant) => variant.is_default) ?? activeSchemaVariants[0] ?? null;
  const schemaPrice = schemaVariant
    ? schemaVariant.sale_price !== null && schemaVariant.sale_price > 0 && schemaVariant.sale_price < schemaVariant.price
      ? schemaVariant.sale_price
      : schemaVariant.price
    : displayPrice;
  const schemaInventoryStatus = schemaVariant
    ? product.inventory_by_variant[schemaVariant.id] ?? null
    : product.inventory_status;
  const availability =
    schemaInventoryStatus === "in_stock" || schemaInventoryStatus === "low_stock"
      ? "https://schema.org/InStock"
      : schemaInventoryStatus === "coming_soon"
        ? "https://schema.org/PreOrder"
        : schemaInventoryStatus === "out_of_stock" || schemaInventoryStatus === "discontinued"
          ? "https://schema.org/OutOfStock"
          : undefined;

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: schemaVariant?.sku ?? product.sku,
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
      price: schemaPrice,
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
    <div className="min-h-screen bg-[#f5f7f9]">
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <div className="section-shell py-5 sm:py-8 lg:py-10">
        <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium sm:mb-7 sm:text-sm">
          <Link href="/shop" className="rounded px-1 font-semibold text-brand-700 transition-colors hover:text-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
            Shop
          </Link>
          {product.category ? (
            <>
              <span aria-hidden="true" className="text-slate-300">/</span>
              <Link href={`/shop/${product.category.slug}`} className="rounded px-1 font-semibold text-brand-700 transition-colors hover:text-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
                {formatCategoryName(product.category.name)}
              </Link>
            </>
          ) : null}
          <span aria-hidden="true" className="text-slate-300">/</span>
          <span aria-current="page" className="min-w-0 text-slate-600">{product.name}</span>
        </nav>

        <ProductVariantProvider initialVariantId={schemaVariant?.id ?? null}>
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)] lg:gap-8 xl:gap-10">
          <div className="min-w-0">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-2.5 shadow-sm sm:rounded-3xl sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-3 px-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Product images</p>
                {product.condition !== "new" ? (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600">
                    {product.condition}
                  </span>
                ) : (
                  <span className="rounded-full bg-brand-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-brand-800">New</span>
                )}
              </div>
              <ProductGallery images={product.images} productName={product.name} productId={product.id} />
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 sm:mt-4 sm:rounded-2xl">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Product reference</p>
                <p className="mt-1 font-mono text-xs font-semibold text-slate-700">{product.sku}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Local support</p>
                <p className="mt-1 text-xs font-semibold text-navy-900">Blantyre, Malawi</p>
              </div>
            </div>
          </div>

          <div className="min-w-0 lg:sticky lg:top-28">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-7 lg:p-8">
              <div className="mb-6">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  {product.brand ? (
                    <span className="inline-flex rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-brand-800">
                      {product.brand.name}
                    </span>
                  ) : null}
                  {product.category ? (
                    <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                      {formatCategoryName(product.category.name)}
                    </span>
                  ) : null}
                </div>
                <h1 className="text-[1.8rem] font-extrabold leading-[1.12] tracking-tight text-navy-950 sm:text-4xl">{product.name}</h1>
                <ProductInterestTracker productId={product.id} categoryId={product.category?.id ?? null} />
              </div>

              <div className="border-t border-slate-100 pt-5">
                <PurchasePanel
                  product={product}
                  businessInfo={businessInfo}
                  isAuthenticated={isAuthenticated}
                  initialInWishlist={initialInWishlist}
                  rentalOffers={rentalOffers}
                />
              </div>

            {product.warranty_text ? (
              <div className="mt-4 flex min-h-11 flex-wrap items-center justify-center gap-x-2.5 gap-y-1 rounded-2xl border border-brand-100 bg-brand-50/70 p-4 text-sm text-center sm:flex-nowrap">
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 shrink-0 text-brand-700" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M12 3.5 5.5 6v4.5c0 3.7 2.3 7.1 6.5 9.5 4.2-2.4 6.5-5.8 6.5-9.5V6L12 3.5Z" />
                    <path d="m9.5 12 1.5 1.5 3.5-4" />
                  </svg>
                  <span className="font-bold text-brand-900">Warranty</span>
                  <span aria-hidden="true" className="hidden h-4 w-px bg-brand-200 sm:block" />
                  <span className="min-w-0 font-semibold text-slate-800">{product.warranty_text}</span>
              </div>
            ) : null}

            <div className="mt-4">
              <ProductEnquiry product={product} businessInfo={businessInfo} showWhatsApp={false} />
            </div>
          </div>
          </div>
        </div>

        {product.description ? (
          <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:mt-10 sm:rounded-3xl sm:p-7">
            <div className="mb-4 flex items-center gap-3">
              <span aria-hidden="true" className="h-8 w-1.5 rounded-full bg-brand-600" />
              <h2 className="text-xl font-extrabold text-slate-900 sm:text-2xl">Description</h2>
            </div>
            <p className="whitespace-pre-line text-sm leading-7 text-slate-700 sm:text-base">{product.description}</p>
          </section>
        ) : null}

        {product.specifications.length > 0 ? (
          <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-5 sm:mt-10 sm:rounded-3xl sm:p-7">
            <div className="mb-4 flex items-center gap-3">
              <span aria-hidden="true" className="h-8 w-1.5 rounded-full bg-cyan-500" />
              <h2 className="text-xl font-extrabold text-slate-900 sm:text-2xl">Specifications</h2>
            </div>
            <SpecificationsTable specifications={product.specifications} />
          </section>
        ) : null}

        <section className="mt-8 sm:mt-10">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="h-8 w-1.5 rounded-full bg-amber-500" />
              <h2 className="text-xl font-extrabold text-slate-900 sm:text-2xl">Customer Reviews</h2>
            </div>
            <Link
              href="/reviews"
              className="rounded-sm text-sm font-semibold text-brand-700 transition-colors hover:text-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            >
              View all reviews
            </Link>
          </div>
          {ratingSummary.count > 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-4xl font-extrabold text-slate-900">{ratingSummary.averageRating}</div>
                    <div className="flex text-amber-500" aria-label={`${ratingSummary.averageRating} out of 5 stars`}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} aria-hidden="true">
                          {i < Math.round(ratingSummary.averageRating) ? "★" : "☆"}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="h-12 w-px bg-slate-200" />
                  <div className="text-sm text-slate-600">
                    {ratingSummary.count} approved review{ratingSummary.count === 1 ? "" : "s"}
                  </div>
                </div>
              </div>
              <div className="mb-6 max-w-md">
                <RatingBreakdown distribution={ratingSummary.distribution} total={ratingSummary.count} />
              </div>
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <article key={review.id} className="rounded-xl border border-slate-200 bg-white p-4">
                      <div className="flex items-center gap-2">
                        <div className="flex text-amber-500" aria-label={`${review.rating} out of 5 stars`}>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i} aria-hidden="true">
                              {i < review.rating ? "★" : "☆"}
                            </span>
                          ))}
                        </div>
                        {review.verified_purchase ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-cyan-50 px-2 py-0.5 text-xs font-semibold text-cyan-800">
                            Verified
                          </span>
                        ) : null}
                      </div>
                      {review.title ? <h3 className="mt-2 text-sm font-semibold text-slate-900">{review.title}</h3> : null}
                      {review.comment ? <p className="mt-1 text-sm text-slate-600">{review.comment}</p> : null}
                      <ReviewPhotos images={review.images} />
                      {review.admin_response ? (
                        <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm">
                          <p className="font-semibold text-slate-900">Response from Classic Computers:</p>
                          <p className="mt-1 text-slate-600">{review.admin_response}</p>
                        </div>
                      ) : null}
                      <p className="mt-2 text-xs text-slate-500">
                        {new Date(review.created_at).toLocaleDateString("en-MW", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </article>
                  ))}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-6 shadow-sm sm:p-8">
              <h3 className="text-base font-bold text-slate-900">No approved reviews yet</h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                There are no published customer reviews for this product yet. Reviews from eligible customers appear here after moderation.
              </p>
            </div>
          )}
        </section>

        <RelatedProducts products={related} />
        </ProductVariantProvider>
      </div>
    </div>
  );
}
