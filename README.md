# Classic Computers LLC — Platform

Ecommerce and business-management platform for Classic Computers LLC
(Blantyre, Malawi). This repository is being built in phases and is
currently through **Phase 6: business workflows and customer service
modules.** See `PHASE_1_REPORT.md` through `PHASE_5_REPORT.md`,
`PHASE_6_REPORT.md` (progress) and `PHASE_6_FINAL_REPORT.md` (completion)
(+ `PHASE_2_DATABASE_ARCHITECTURE.md` and `PHASE_4_CORRECTION_REPORT.md`)
for exactly what exists at each stage.

**Before anything else, read `PHASE_6_FINAL_REPORT.md` section 2, migration
`0040`.** `handle_new_user()` never created a `customers` row on signup,
which every customer-owned table (carts, orders, reviews, and more)
depends on via foreign key — this would have broken the entire
authenticated customer experience the moment it was tested against a
real database. It's fixed, but has not been verified against a live
project, since none has been available in this environment at any phase.

**What exists right now:** project foundation + auth (Phase 1), full
database schema/RLS/roles/permissions (Phase 2), a real public storefront
(Phase 3), a complete customer/ecommerce flow (Phase 4, corrected), a
real admin area (Phase 5), and complete repairs/rentals/student-
verification/corporate-enquiry/referral workflows with public booking,
account tracking, and admin management, plus a customer notifications
page and account dashboard summary (Phase 6). **What's genuinely
untested:** everything — no phase of this project has been executed
against a live Supabase project.

## Stack

Next.js (App Router) · React · TypeScript · Tailwind CSS · Supabase
(Postgres, Auth, Storage) · Zod

## Prerequisites

- Node.js ≥ 18.18
- A Supabase project (free tier is fine for development) — **create a new
  one for this platform; do not point this at any existing production
  database.**

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the environment template and fill in your **development** Supabase
   project's values (Project Settings → API in the Supabase dashboard):

   ```bash
   cp .env.example .env.local
   ```

   - `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are
     browser-safe.
   - `SUPABASE_SERVICE_ROLE_KEY` is server-only — never commit it, never
     reference it from a Client Component.

3. Apply the database schema (all migrations through Phase 4's
   `create_order()` function) to your Supabase project:

   ```bash
   npx supabase login
   npx supabase link --project-ref <your-project-ref>
   npx supabase db push
   ```

   For local development with the Supabase CLI's local stack instead:

   ```bash
   npx supabase start
   npx supabase db reset   # applies all migrations + supabase/seed.sql
   ```

   `supabase/seed.sql` is dev-only sample data (one draft, non-public
   product) — `db push` to a real project never applies it; only local
   `db reset` does.

4. Generate real database types (replaces the hand-written placeholder —
   see "Known limitations" below):

   ```bash
   npx supabase gen types typescript --linked --schema public > types/supabase.ts
   ```

5. Run the dev server:

   ```bash
   npm run dev
   ```

   Visit `http://localhost:3000`.

## Testing what exists so far

1. **App runs**: `npm run dev` starts without errors.
2. **Type checking**: `npm run typecheck` passes.
3. **Linting**: `npm run lint` passes.
4. **Env wiring**: visit `/api/health` — reports `true`/`false` per
   required env var (never the values themselves).
5. **Auth flow**: sign up at `/sign-up`, sign in at `/sign-in`, land on
   `/account`, sign out. Visiting `/account` while signed out redirects to
   `/sign-in`.
6. **Storefront** (requires the Phase 2+3 migrations applied and at least
   one product with `status = 'published'`):
   - `/` — homepage sections render (each cleanly omits itself if its
     underlying data is empty — e.g. no approved reviews yet).
   - `/shop` — filter by brand/price/availability, sort, paginate.
   - `/shop/[category-slug]` — category-scoped version of the above.
   - `/product/[slug]` — gallery, variant selector (if variants exist),
     specifications table, related products, Add to Cart / Wishlist.
   - `/search?q=...` — text search across name/sku/description.
   - `/sitemap.xml`, `/robots.txt` — generated, not static files.
7. **Cart & checkout** (Phase 4 — see `PHASE_4_REPORT.md` item 14 for the
   full list; the two most important to actually run):
   - Add items to cart as a guest (no session) and as a signed-in
     customer; confirm quantities, removal, and live pricing on `/cart`.
   - Full checkout (guest and authenticated, pickup and delivery) through
     to `/checkout/confirmation/[orderNumber]`, then confirm the order
     appears in `/account/orders` for the authenticated case.
   - **Concurrency**: two simultaneous checkouts for the last unit of one
     product — confirm exactly one succeeds and stock never goes negative.
     This has not been tested by the assistant building this and is the
     single highest-priority item to verify.
8. **Account area** (`/account/*`): profile edit, address add/delete,
   wishlist add/remove, `/compare` (works for guests too), password reset
   (`/reset-password` → email link → `/update-password`) and in-session
   password change (`/account/settings`).
9. **Placeholder pages** (`/rentals`, `/repairs`, `/repairs/book`,
   `/repairs/track`, `/corporate`, `/student-deals`, `/about`,
   `/warranty`, `/returns`, `/privacy`, `/terms`) should render an honest
   "coming soon" notice — none of them should look like a working form.

See each `PHASE_N_REPORT.md` for the exact, phase-by-phase breakdown of
what was reviewed vs. actually executed — nothing in this repository has
been run against a live environment by the assistant building it (no
network access in that environment); all of the above needs to be
confirmed by you.

## Available scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Start the local dev server |
| `npm run build` | Production build |
| `npm run start` | Run a production build locally |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run format` | Prettier (writes) |
| `npm run format:check` | Prettier (check only, for CI) |

## Project structure

See `PHASE_1_REPORT.md` for the base folder tree, `PHASE_2_REPORT.md` for
the full migration list, `PHASE_3_REPORT.md` for every storefront
route/component, `PHASE_4_REPORT.md` for cart/checkout/account, and
`PHASE_4_CORRECTION_REPORT.md` for the delivery-snapshot/min_order_total/
variant-inventory fixes made after Phase 4 review.

## Known limitations

- **`handle_new_user()` did not create a `customers` row until migration
  `0040`** — fixed, but unverified against a live project. Treat this as
  the top item to confirm once you have real Supabase access; see
  `PHASE_6_FINAL_REPORT.md` section 7, item 1.
- `types/supabase.ts` is still hand-written, not the real
  `supabase gen types` output — see step 4 above to fix this once you have
  a live project. `PHASE_4_CORRECTION_REPORT.md` item 8 lists every file
  currently carrying a documented `as any` cast because of this.
- No product images exist in the seed data — product cards/pages will show
  "No image yet" until real photos are uploaded to the `product-images`
  bucket.
- No homepage hero photograph exists yet — see `PHASE_3_REPORT.md` item 0.
- `addresses` has no `district` column (Phase 2 schema) — an authenticated
  customer's order delivery snapshot always has `district: null`; guest
  snapshots can capture one since the checkout form collects it directly.
- Rental availability checking (`lib/services/rentals.ts`) is
  check-then-insert, not a locking transaction like `create_order()` —
  correct for normal use, not atomic against a genuine simultaneous
  double-booking race. See `PHASE_6_FINAL_REPORT.md` section 4.
- Admin enquiries uses inline row editing rather than a dedicated
  `/admin/enquiries/[id]` route; the repair-parts admin form doesn't yet
  expose a product picker (the service layer supports linking a real
  product for inventory deduction, the UI just doesn't call it yet).

Fixed since Phase 4 (see `PHASE_4_CORRECTION_REPORT.md` for detail):
`discounts.min_order_total` is now enforced at checkout; guest delivery
addresses are now a structured `orders.delivery_snapshot` instead of free
text folded into notes; product pages now show the *selected variant's*
own stock status instead of a product-level reading that usually didn't
exist for multi-variant products.

Fixed during Phase 6 (see `PHASE_6_FINAL_REPORT.md` for detail):
`discounts.scope = 'student'` was dead code in `create_order()` since
Phase 2; `repair_tickets`/`rental_bookings` had no guest INSERT policy at
all (guest booking was impossible); orders never notified the customer,
only staff; and a bug I introduced earlier in this same phase — the
admin rental notes editor overwriting and leaking the customer's own
notes — was caught and fixed by the phase's own closing integrity review.

## Security notes

- Never commit `.env.local` (already gitignored).
- `SUPABASE_SERVICE_ROLE_KEY` bypasses Row Level Security — it is only ever
  read from `lib/supabase/server-admin.ts`, which is marked `server-only`
  and will fail the build if imported into client code. As of Phase 6 it
  has exactly seven call sites project-wide, all narrowly scoped and
  documented inline: guest cart read/write, invoking `create_order()` on
  a guest's behalf, guest order confirmation lookup, listing Supabase
  Auth users for the staff-management screen, one customer's email
  lookup by known ID, and guest repair/rental tracking (both gated by an
  unguessable token, matched in application code, never by ID alone). No
  other code path in the repository uses it — confirmed by a full-project
  grep during the Phase 6 integrity review, not assumed.
- Middleware-based route protection (`middleware.ts`) is a UX convenience,
  not the security boundary — Row Level Security (Phase 2) and server-side
  permission checks (`lib/auth/permissions.ts`) are what actually protect
  data.
- Every public storefront query filters on the relevant published/approved/
  active/public flag as defense in depth, but RLS is the real boundary in
  every case (see `PHASE_2_DATABASE_ARCHITECTURE.md` for the full policy
  table).
#   c l a s s i c - c o m p u t e r s  
 