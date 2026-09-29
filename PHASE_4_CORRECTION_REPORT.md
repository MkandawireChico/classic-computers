# Phase 4 Correction Pass — Report

Scope: items 1–6 of the correction brief. No rebuild of Phase 4, no new
project, migrations 0001–0032 untouched. Phase 5 not started (waiting for
your go-ahead per the brief's own stop instruction).

## 1. Files created

- `supabase/migrations/0033_order_delivery_snapshot_and_min_order_total.sql`
  — new `orders.delivery_snapshot jsonb` column + `create_order()` updated
  in place for the snapshot and for `min_order_total` enforcement.
- `PHASE_4_CORRECTION_REPORT.md` (this file).

## 2. Files modified

- `schemas/checkout.ts` — replaced `guestDeliveryAddressText` (free text)
  with structured `guestDeliveryLine1/Line2/City/District`.
- `lib/services/checkout.ts` — stopped folding guest delivery address into
  `notes`; now passes the structured fields straight through to the
  updated `create_order()` RPC.
- `app/(storefront)/checkout/checkout-form.tsx` — guest delivery textarea
  replaced with line1/line2/city/district fields matching the schema.
- `lib/data/orders.ts` — added `delivery_snapshot`/`DeliverySnapshot` to
  `OrderDetail` and selected it; **also fixed a pre-existing bug** found
  while touching this file (see item 8).
- `lib/data/order-confirmation.ts` — selects `delivery_snapshot`.
- `app/(storefront)/checkout/confirmation/[orderNumber]/page.tsx` and
  `app/(storefront)/account/orders/[id]/page.tsx` — both now render the
  delivery snapshot when `fulfillment_type = 'delivery'`, with an honest
  "this order predates address-snapshot tracking" note for pre-migration
  orders on the order-detail page rather than showing nothing unexplained.
- `types/catalog.ts` — added `inventory_by_variant` to `ProductDetail`.
- `lib/data/products.ts` — `getProductBySlug()` now builds a
  variant-id → status map; `toListItem()` (used by every product card/
  grid) now aggregates stock across variants when no product-level
  inventory row exists, instead of silently showing "Available on
  request" for every multi-variant product regardless of real stock.
- `components/product/purchase-panel.tsx` — stock badge, "can order"
  logic, and the disabled state passed to `AddToCartButton` now key off
  the **selected variant's own** inventory status for products that have
  variants, not the product-level row.

## 3. New migrations

`0033_order_delivery_snapshot_and_min_order_total.sql` only. Existing
migrations 0001–0032 were not edited, per the instruction.

## 4. Database changes

- `orders.delivery_snapshot jsonb` (nullable). Existing rows get `null` —
  no backfill was attempted, per "do not invent missing historical
  delivery information."
- `create_order()` replaced with a 12-parameter version (4 new guest
  delivery-address parameters, all with defaults). **I explicitly
  `DROP FUNCTION`'d the old 8-parameter signature first** — `CREATE OR
  REPLACE FUNCTION` only replaces an identical parameter signature, so
  without the explicit drop, the old Phase 4 version would have remained
  callable as a stale second overload rather than being replaced. Caught
  this during the build, not after.
- Subtotal is now computed via one aggregate query **before** the
  per-line discount-selection loop (previously it was accumulated
  line-by-line during that same loop), so `min_order_total` has the real
  order subtotal to compare against for every line, regardless of which
  line the matching discount happens to apply to.
- Variant-aware inventory lookup and the `sale`-type inventory movement
  insert were **already correct** in the Phase 4 version (confirmed by
  reading the code before touching anything) — items 3 and 4 of the
  correction brief required no database change; the gap was UI-only (see
  item 6 below for item 4's explicit confirmation).

## 5. Security changes

No security regressions and no new broad grants. Specifically reviewed:

- **Delivery snapshot authority**: for an authenticated customer, the
  snapshot is built server-side inside `create_order()` from the
  `addresses` row the customer owns (looked up by `p_delivery_address_id`
  + `customer_id = v_customer_id`, raising an exception if not found/not
  theirs) and from `profiles`/`auth.users` — never from client-supplied
  text. For a guest, the snapshot is built from the structured checkout
  fields, which is appropriate since a guest has no server-side address
  record to compare against in the first place — there's nothing to
  spoof relative to (it's their own order).
- **Guest/authenticated cart and order ownership, address ownership,
  wishlist ownership, the guest confirmation cookie, service-role
  usage**: unchanged by this pass; re-read each of the corresponding code
  paths, confirmed no correction-pass edit touched their logic.
  `createAdminClient()` usage is still exactly the same four files as
  before this pass (verified by search) — no new use was introduced.
- No RLS policy was weakened or broadened. No new "authenticated users
  can access everything" policy was added.
- Zod (`schemas/checkout.ts`) still validates every checkout field
  server-side, including the new structured guest address fields.

## 6. Tests executed

**None** — same constraint as every prior phase: no network access in
this container, so no live Supabase project, no `npm install`, no way to
run `typecheck`/`lint`/`build` or any of the 12 flows listed in the
correction brief's testing section.

**What I did instead (review, not execution):**
- Re-read `create_order()` end to end after the rewrite, tracing the new
  parameter list against every call site (`checkout.ts`) to confirm
  argument order/names match.
- Manually traced the `min_order_total` fix: confirmed `v_subtotal` is
  now computed once, before the loop, and referenced (not recomputed) in
  both the discount `WHERE` clause and the final `UPDATE orders` — so the
  same number is what's checked against and what's stored.
- Confirmed by direct inspection (grep, cited above) that the Phase 4
  variant-inventory lookup and sale-movement logging were already
  correct, rather than assuming and "fixing" something that wasn't
  broken.
- Confirmed no new `createAdminClient()` call sites were introduced.

## 7. Tests NOT executed — please run once you have a real dev environment

Exactly the 12 items from the correction brief's testing section:

1. Guest delivery checkout — confirm `delivery_snapshot` is populated
   correctly and matches what was typed on the form.
2. Authenticated delivery checkout — confirm the snapshot matches the
   chosen saved address, not a live join.
3. **Historical delivery address stability**: place an authenticated
   delivery order, then edit or delete the address used, then reload the
   order detail page and confirm the displayed address is unchanged.
4. Percentage discount with `min_order_total` — one cart below the
   threshold (discount should NOT apply) and one above (should apply).
5. Fixed discount with `min_order_total` — same two cases.
6. Product-level inventory still works for products with no variants.
7. **Variant-level inventory**: a product with two variants, one in stock
   and one out of stock — confirm the out-of-stock variant disables
   "Add to cart" while the in-stock variant remains orderable, and
   switching the dropdown updates the stock badge live.
8. Variant out-of-stock at checkout — confirm `create_order()` still
   rejects it (unchanged logic, but worth confirming end to end).
9. Concurrent checkout for the final unit — still the single most
   important untested item across this whole project.
10. Inventory movement history — confirm exactly one `sale` movement per
    order line, no duplicates.
11. Guest cart ownership — unchanged from Phase 4, but re-verify since
    `apply_inventory_movement`-adjacent code was touched this pass.
12. Authenticated order ownership — unchanged, re-verify.
13. `npm run typecheck` — the `lib/data/orders.ts` cast fix (item 8
    below) should resolve a real compile error I found; worth confirming
    it's actually clean now.

## 8. Remaining known issues

- **Item 5 (Supabase types)**: still no live Supabase project available
  in this environment, so real generated types were **not** produced —
  per the instruction, I did not fake this. `types/supabase.ts` remains
  the hand-written placeholder. The exact regeneration command is
  documented in `README.md` ("Local setup" step 4). Files that currently
  carry a temporary `as any` cast because of the placeholder (compiled by
  `grep -rl "as any"` this session):
  ```
  app/(storefront)/account/profile/actions.ts
  app/(storefront)/account/profile/page.tsx
  app/(storefront)/compare/page.tsx
  lib/data/cart.ts
  lib/data/compare.ts
  lib/data/order-confirmation.ts
  lib/data/orders.ts
  lib/data/products.ts
  lib/data/reviews.ts
  lib/data/wishlist.ts
  lib/services/addresses.ts
  lib/services/cart-items.ts
  lib/services/cart.ts
  lib/services/checkout.ts
  lib/services/wishlist.ts
  ```
  Once real types are generated, each of these is a candidate to have its
  cast removed — but that should happen against the real generated
  shapes, not guessed at here.
- `addresses` has no `district` column (Phase 2 schema), so an
  authenticated customer's delivery snapshot always has `district: null`
  — correct and honest (not invented), just worth knowing the field
  exists in the snapshot shape mainly for the guest path.
- The product-list card aggregate stock rollup (item 3, `toListItem`) is
  a genuine simplification: it shows "in_stock" if *any* variant is in
  stock, which is reasonable for a card but is intentionally coarser than
  the product-page behavior, which is correctly variant-specific.

## 9. Anything requiring your manual action

1. Run the 13 tests in item 7 against a real dev Supabase project — this
   pass has not been executed against a live database, same as every
   prior phase.
2. Once you have a live project, run `supabase gen types` and revisit the
   file list in item 8 to remove now-unnecessary casts.
3. No other action required before Phase 5 — reply when you'd like me to
   proceed to the Phase 5 admin core.

Stopping here per the correction brief's own instruction. Waiting for
your review before Phase 5.
