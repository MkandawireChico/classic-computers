import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductBySlug, getRelatedProducts, logProductView } from "@/lib/data/products";
import { getBusinessInfo } from "@/lib/data/site-settings";
import { getPublicStorageUrl } from "@/lib/storage";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getWishlistProductIds } from "@/lib/services/wishlist";
import { ProductGallery } from "@/components/product/product-gallery";
import { PurchasePanel } from "@/components/product/purchase-panel";
import { SpecificationsTable } from "@/components/product/specifications-table";
import { ProductEnquiry } from "@/components/product/product-enquiry";
import { RelatedProducts } from "@/components/product/related-products";

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

  const [related, businessInfo, wishlistEntries, user] = await Promise.all([
    product.category ? getRelatedProducts(product.category.id, product.id, 4) : Promise.resolve([]),
    getBusinessInfo(),
    getWishlistProductIds(),
    getCurrentUser(),
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
            name: product.category.name,
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

      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-500">
        <Link href="/shop" className="hover:text-brand-600">
          Shop
        </Link>
        {product.category ? (
          <>
            {" / "}
            <Link href={`/shop/${product.category.slug}`} className="hover:text-brand-600">
              {product.category.name}
            </Link>
          </>
        ) : null}
        {" / "}
        <span className="text-gray-700">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <ProductGallery images={product.images} productName={product.name} />

        <div>
          {product.brand ? (
            <p className="text-sm font-medium uppercase tracking-wide text-gray-500">{product.brand.name}</p>
          ) : null}
          <h1 className="mt-1 text-2xl font-bold text-gray-900">{product.name}</h1>
          <p className="mt-1 text-sm text-gray-500">SKU: {product.sku}</p>

          <div className="mt-4">
            <PurchasePanel
              product={product}
              businessInfo={businessInfo}
              isAuthenticated={isAuthenticated}
              initialInWishlist={initialInWishlist}
            />
          </div>

          {product.warranty_text ? (
            <p className="mt-4 text-sm text-gray-600">
              <span className="font-medium text-gray-800">Warranty:</span> {product.warranty_text}
            </p>
          ) : null}

          <div className="mt-4">
            <ProductEnquiry product={product} businessInfo={businessInfo} />
          </div>
        </div>
      </div>

      {product.description ? (
        <section className="mt-10">
          <h2 className="mb-2 text-lg font-semibold text-gray-900">Description</h2>
          <p className="whitespace-pre-line text-sm text-gray-700">{product.description}</p>
        </section>
      ) : null}

      {product.specifications.length > 0 ? (
        <section className="mt-10">
          <h2 className="mb-2 text-lg font-semibold text-gray-900">Specifications</h2>
          <SpecificationsTable specifications={product.specifications} />
        </section>
      ) : null}

      <RelatedProducts products={related} />
    </div>
  );
}
