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
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-gray-500">
        <Link href="/shop" className="hover:text-brand-600 transition-colors">
          Shop
        </Link>
        {product.category ? (
          <>
            {" / "}
            <Link href={`/shop/${product.category.slug}`} className="hover:text-brand-600 transition-colors">
              {formatCategoryName(product.category.name)}
            </Link>
          </>
        ) : null}
        {" / "}
        <span className="text-gray-700">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-12">
        <ProductGallery images={product.images} productName={product.name} />

        <div className="flex flex-col">
          {product.brand ? (
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">{product.brand.name}</p>
          ) : null}
          <h1 className="mt-2 text-3xl font-bold text-gray-900 leading-tight">{product.name}</h1>
          <p className="mt-2 text-sm text-gray-500">SKU: {product.sku}</p>

          <div className="mt-6">
            <PurchasePanel
              product={product}
              businessInfo={businessInfo}
              isAuthenticated={isAuthenticated}
              initialInWishlist={initialInWishlist}
              rentalOffers={rentalOffers}
            />
          </div>

          {product.warranty_text ? (
            <div className="mt-6 rounded-panel bg-brand-50 border border-brand-100 p-4">
              <p className="text-sm text-gray-700">
                <span className="font-semibold text-gray-900">Warranty:</span> {product.warranty_text}
              </p>
            </div>
          ) : null}

          <div className="mt-6">
            <ProductEnquiry product={product} businessInfo={businessInfo} showWhatsApp={false} />
          </div>
        </div>
      </div>

      {product.description ? (
        <section className="mt-12 rounded-panel border border-surface-border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold text-gray-900">Description</h2>
          <p className="whitespace-pre-line text-sm text-gray-700 leading-relaxed">{product.description}</p>
        </section>
      ) : null}

      {product.specifications.length > 0 ? (
        <section className="mt-10">
          <h2 className="mb-4 text-xl font-bold text-gray-900">Specifications</h2>
          <SpecificationsTable specifications={product.specifications} />
        </section>
      ) : null}

      <RelatedProducts products={related} />
    </div>
  );
}
