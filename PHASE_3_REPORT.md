# Phase 3 Report — Public Website & Retail Shop

## 0. Shop photograph (your item #2)

No image was found in the upload directory for this environment this
phase. Per your explicit instruction ("do not substitute a random
storefront image and pretend it is Classic Computers... use a clearly
identified temporary placeholder"), the homepage hero renders a labeled
"Shop photograph not yet added" placeholder instead of any real or stock
photo. The `site_media` system (migration `0031`) is fully built and ready
— once you upload the real photograph (via a future admin screen, or
directly into the `site-media` Storage bucket + a `site_media` row with
`placement = 'homepage_hero'`), it will appear automatically with no code
changes.

## 1. Files created

**Migration**
- `supabase/migrations/0031_site_media.sql` — `site_media` table, new
  `site_media_placement_enum`, `site-media` Storage bucket + RLS/storage
  policies gated on `settings.write`.

**Data access layer (`lib/data/`)**
- `products.ts` — `getFeaturedProducts`, `searchShop`, `getProductBySlug`,
  `getRelatedProducts`, `logProductView`
- `categories.ts` — `getCategories`, `getCategoryBySlug`
- `brands.ts` — `getBrands`
- `reviews.ts` — `getApprovedReviews`
- `site-settings.ts` — `getPublicSetting`, `getBusinessInfo`, `getHours`,
  `getSiteStatistics`
- `site-media.ts` — `getSiteMedia`

**Supporting libs**
- `lib/format/money.ts` — MWK currency formatting (single source of truth)
- `lib/storage.ts` — rewritten as a universal (server+client-safe) public
  Storage URL builder
- `lib/shop-params.ts` — URL search params → typed shop filters

**Types**
- `types/catalog.ts` — domain shapes for the storefront
- `types/supabase.ts` — extended (still hand-written; see item 14 below)
  with Row types for every table Phase 3 queries

**Design system**
- `components/ui/badge.tsx`

**Product components**
- `components/product/stock-badge.tsx`
- `components/product/product-card.tsx`
- `components/product/product-grid.tsx`
- `components/product/product-gallery.tsx` (client)
- `components/product/purchase-panel.tsx` (client — variant selector;
  cart/wishlist honestly disabled, see item 26 below)
- `components/product/specifications-table.tsx`
- `components/product/product-enquiry.tsx` (real WhatsApp/phone links)
- `components/product/related-products.tsx`

**Storefront components**
- `components/storefront/site-header.tsx`
- `components/storefront/mobile-nav.tsx` (client)
- `components/storefront/search-box.tsx` (client)
- `components/storefront/site-footer.tsx`
- `components/storefront/hero.tsx`
- `components/storefront/category-section.tsx`
- `components/storefront/featured-products-section.tsx`
- `components/storefront/services-section.tsx`
- `components/storefront/reviews-section.tsx`
- `components/storefront/location-section.tsx`
- `components/storefront/shop-filters.tsx` (client)
- `components/storefront/sort-select.tsx` (client)
- `components/storefront/pagination.tsx`
- `components/storefront/coming-soon-notice.tsx`

**Routes** — see full list in section 3 below.

## 2. Files modified

- `app/layout.tsx` — added default Open Graph/Twitter metadata.
- `app/page.tsx` — **deleted**; replaced by `app/(storefront)/page.tsx`
  (the Phase 1 placeholder home is gone, superseded by the real homepage).

## 3. Routes created

```
(storefront) route group — wrapped in SiteHeader + SiteFooter:
  /                         real homepage (Hero, Featured, Categories,
                             Services, Reviews, Location — each section
                             cleanly omits itself if its data is empty)
  /shop                     full catalogue: filter, sort, search, paginate
  /shop/[category]          category-scoped catalogue, own SEO metadata
  /product/[slug]           full product detail, JSON-LD structured data
  /search                   query-driven results, no client-side filtering
  /rentals                  honest info + enquiry links (booking = later phase)
  /repairs                  links to /repairs/book, /repairs/track
  /repairs/book             honest placeholder (ticket creation = later phase)
  /repairs/track            honest placeholder (tracking = later phase)
  /corporate                honest info + enquiry links
  /student-deals            honest info + enquiry links
  /about                    honest placeholder — no invented company history
  /contact                  real business info + enquiry links
  /warranty                 honest placeholder — no invented warranty policy
  /returns                  honest placeholder — no invented returns policy
  /privacy                  honest placeholder — no invented legal text
  /terms                    honest placeholder — no invented legal text

Root-level:
  /sitemap.xml              generated from real published products + categories
  /robots.txt                disallows /account, /admin, /api, /search
```

Per your instruction #26, none of the placeholder pages simulate a working
form or button — each uses the shared `ComingSoonNotice` component plus
real WhatsApp/phone links (via `ProductEnquiry`), rather than a fake
"Submit" button that does nothing.

## 4. Components created

Listed in section 1. 22 new components across `components/product/` and
`components/storefront/`, plus one new design-system primitive (`Badge`).

## 5. Database queries / data access implemented

All storefront reads go through `lib/data/*.ts` — no component queries
Supabase directly, and nothing is hard-coded:
- Published-only product listing/search/detail (category, brand, price
  range, availability, text search across name/sku/description, five sort
  orders, pagination)
- Category and brand listings
- Approved-only reviews
- Public-only site settings (`business_info`, `hours`)
- Active-only site media by placement

Every one of these relies on the Phase 2 RLS policies as the real
boundary — the query filters (`.eq('status','published')` etc.) are
defense in depth, not the security boundary itself, per your item #23.

## 6. Site-media implementation

New `site_media` table + `site-media` public Storage bucket (migration
`0031`), separate from `product_images`. Supports placement (`homepage_hero`,
`homepage_banner`, `store_photo`, `rental_promo`, `corporate_promo`,
`other`), alt text, title, display order, active flag, timestamps — exactly
the metadata your brief asked for. No URLs are hard-coded in components;
`Hero` reads the active `homepage_hero` row through `getSiteMedia()` and
falls back to the labeled placeholder described in item 0.

## 7. Image handling implementation

- `getPublicStorageUrl()` builds Storage public URLs from `storage_path`
  at render time (server or client) — no absolute URLs stored anywhere.
- `next/image` used throughout (`ProductCard`, `ProductGallery`, `Hero`)
  with explicit `sizes` for responsive delivery and `fill` + a fixed-aspect
  wrapper to reserve layout space (no CLS).
- Primary product image gets `priority`; gallery thumbnails and below-fold
  images rely on `next/image`'s default lazy loading.
- `next.config.mjs` (Phase 1) already restricts `remotePatterns` to the
  configured Supabase project's storage path — this required no changes.

## 8. SEO implementation

- Per-product `generateMetadata`: title (from `seo_title` or name),
  description (from `seo_description`, else truncated `description`),
  canonical URL, Open Graph (with primary image), Twitter card.
- Per-category `generateMetadata` on `/shop/[category]`.
- JSON-LD `Product` structured data (name, sku, brand, images, condition,
  offer price/currency/availability) and `BreadcrumbList` structured data
  on every product page — both generated from real query results, nothing
  fabricated.
- `app/sitemap.ts` — dynamic, built from actual published products and
  categories (with `lastModified` from `updated_at`), not a static list.
- `app/robots.ts` — disallows `/account`, `/admin`, `/api`, `/search`.
- Semantic heading hierarchy (`h1` once per page, `h2` per section) and
  breadcrumb `<nav>` on shop/category/product pages.

## 9. Accessibility work

- Semantic landmarks: `<header>`, `<nav aria-label="...">`, `<main>`,
  `<footer>`, `<address>`.
- `MobileNav` uses `aria-expanded`/`aria-controls` on its toggle button.
- All form controls have associated `<label>` elements (search box, price
  filter inputs, variant selector).
- Focus-visible rings on every interactive element (inherited from the
  Phase 1 design system, applied consistently to new components).
- Product-count and search-result counts use `aria-live="polite"` so
  screen readers announce filter/search changes.
- Reviews use `aria-label` on the star rating rather than relying on color
  alone; stock status uses both color (via `Badge` variant) and text label.
- Pagination uses `aria-disabled` on the Previous/Next edges and a real
  `<nav aria-label="Pagination">` landmark.

## 10. Performance work

- Every storefront page is a Server Component by default; the only Client
  Components are the ones that genuinely need interactivity (`MobileNav`,
  `SearchBox`, `ShopFilters`, `SortSelect`, `ProductGallery`,
  `PurchasePanel`) — everything else (grids, cards, sections, footer,
  product detail scaffolding) stays server-rendered.
- Pagination (`pageSize: 24`) on both `/shop` and `/search` — the full
  catalogue is never loaded into the browser.
- `count: 'exact'` is requested only on the paginated list query, not on
  every read.
- No client-side product filtering anywhere — every filter/sort/search
  parameter round-trips through the URL and a fresh server query.

## 11. Tests executed and their results

**None were executed against a real environment**, for the same reason as
Phase 1 and 2: this container has no network access (cannot install npm
packages, cannot reach a Supabase project, cannot run the Next.js dev
server or a production build). I want to be exact rather than imply
partial testing.

**What I did instead (review, not execution):**
- Manually traced every import across all new files to confirm paths
  resolve (`@/lib/...`, `@/components/...`, `@/types/...`) against the
  existing `tsconfig.json` path alias.
- Re-read every Server Component/Client Component boundary (`"use client"`
  placement) to confirm interactivity is isolated correctly.
- Manually checked the shape returned by each `lib/data/*.ts` function
  against what each component destructures, field by field.
- Verified the RLS filters Phase 3 relies on (`products.status='published'`,
  `reviews.status='approved'`, `site_settings.is_public=true`,
  `site_media.is_active=true`) all exist in the Phase 2 migrations.

## 12. Tests NOT executed — please run these once you have a working dev environment

1. `npm install && npm run typecheck` — I extended `types/supabase.ts` by
   hand and used several `as any` casts at embedded-select join boundaries
   (documented inline in `lib/data/products.ts` and `reviews.ts`) because
   the hand-written type has no relationship metadata for joins like
   `brand:brands(...)`. These casts are a deliberate, narrow workaround —
   please run `typecheck` to confirm nothing else breaks, and treat this
   as the top candidate to fully resolve once you run `supabase gen types`
   against a real project (real generated types will type these joins
   correctly and the casts can likely be removed).
2. `npm run lint` — not run.
3. `npm run build` — not run; in particular I can't confirm `useSearchParams`
   in `ShopFilters`/`SortSelect`/`SearchBox` doesn't trigger a Next.js
   "should be wrapped in a Suspense boundary" build warning. Since the
   pages that use them already receive `searchParams` as a server prop
   (making the whole route dynamic), I expect this to be at most a
   warning, not a hard error, but I have not confirmed this by building.
4. **Every database-backed page, end to end, against a seeded dev
   Supabase project**: homepage with the dev seed product (draft status —
   you'll need to publish it or add a real published product to see
   anything on `/shop`/homepage), `/shop` filtering/sorting/pagination,
   `/shop/laptops` (or whichever category slug), `/product/dev-sample-
   laptop-do-not-publish` (note: the dev seed product is `status='draft'`
   intentionally, so it will correctly 404 on the public site until you
   either publish it or add a real product — that's expected, not a bug).
5. Mobile nav open/close, search box submit → `/search?q=...`, filter
   checkboxes/price range updating the URL correctly.
6. Structured data validation (Google's Rich Results Test) once a real
   published product with images exists.
7. `sitemap.xml`/`robots.txt` actually rendering at those paths in a
   running dev server.
8. Responsive layout at the breakpoints in the brief (320/375/390/414/
   768/1024/1280px) — I designed with Tailwind's responsive utilities
   throughout but have not visually confirmed any of it.

## 13. Migrations added

- `0031_site_media.sql` (see item 6).

## 14. Environment variables added

None beyond what Phase 1 already defined. `NEXT_PUBLIC_SITE_URL` (already
in `.env.example`) is now actually used by `app/sitemap.ts` and
`app/robots.ts`.

## 15. Remaining issues

- **Generated types still not real** (carried over from Phase 2 — see
  item 12.1 above). This is the single biggest piece of technical debt
  from Phases 2–3 and should be resolved as soon as you have a live
  Supabase project.
- `product_views` insert in `lib/data/products.ts` uses an `as any` cast
  rather than a typed table entry, since I didn't want to grow the
  hand-written `Database` type for one insert — same caveat as above.
- No image exists for any product yet (seed data has none), so `/shop`
  and the homepage will show "No image yet" placeholders in the product
  cards until real product photos are uploaded via Phase 2's
  `product-images` bucket (no admin UI for that yet — that's Phase 3's
  admin counterpart, planned for the admin-dashboard phase).
- `ShopFilters`/`SortSelect`/`SearchBox` use `useSearchParams()` without
  an explicit `<Suspense>` wrapper — flagged as a build-warning risk in
  item 12.3, not fixed because I can't run the build to confirm it's
  actually needed here.

## 16. Anything requiring your manual action

1. Provide the real Classic Computers shop photograph (this environment
   still has no access to it) so it can be uploaded to the `site-media`
   bucket with `placement='homepage_hero'`.
2. Provide real "About Us" copy, warranty policy, returns policy, privacy
   policy, and terms of service — all five are currently honest
   placeholders, not invented text.
3. Add at least one real product with `status='published'` (or flip the
   dev seed product's status, though that's explicitly labeled as a
   non-production sample) so `/shop` and the homepage have something to
   display when you test.
4. Run `npm install`, `npm run typecheck`, `npm run lint`, `npm run build`
   locally and report back what breaks — none of this has been executed.
5. Once you have a live Supabase project with these migrations applied,
   run `supabase gen types` and let me know if anything in the storefront
   needs adjusting once real types replace the hand-written ones.

## 17. Exact next step for Phase 4

Per your instructions, Phase 4 is not started. The next step, once you've
reviewed this report, is your explicit approval to begin Phase 4 — the
customer account system (or whichever phase you'd like to reorder next):
cart persistence, checkout, and order creation, building on the
`carts`/`orders`/`order_items` schema and the `apply_inventory_movement()`
function already in place from Phase 2. I have not started any of that
work — `PurchasePanel`'s cart/wishlist buttons are intentionally disabled
placeholders, not a partial implementation.

Stopping here per your instructions, waiting for your review.
