# Phase 4 Report — Customer Accounts + Ecommerce

## 1. Files created

**Migration**
- `supabase/migrations/0032_create_order_function.sql` — the transactional
  `create_order()` RPC: the atomic core of checkout.

**Services (`lib/services/`)**
- `cart.ts` — guest/authenticated cart identity resolution, guest cookie
  handling, `mergeGuestCartIntoCustomerCart()`
- `cart-items.ts` — add/update/remove with server-side validation and an
  explicit ownership check (see item 11, security review)
- `wishlist.ts` — toggle/list, customer-only
- `addresses.ts` — full CRUD, default-address handling
- `checkout.ts` — `submitCheckout()`: stale-item pruning, calls
  `create_order()` with the correct client, sets the guest confirmation
  cookie
- `compare.ts` — cookie-based compare list (max 4 products)

**Data access (`lib/data/`)**
- `cart.ts` — live cart summary + item count (always re-reads price/stock)
- `wishlist.ts` — wishlist joined with live product data
- `orders.ts` — `getMyOrders()`, `getMyOrderById()` (RLS-scoped)
- `order-confirmation.ts` — guest/authenticated confirmation lookup
- `compare.ts` — spec-driven comparison data

**Schemas**
- `schemas/cart.ts`, `schemas/checkout.ts`, `schemas/address.ts`

**Components**
- `components/product/add-to-cart-button.tsx` (client)
- `components/product/wishlist-button.tsx` (client)
- `components/product/compare-toggle.tsx` (client)
- `components/storefront/cart-item-controls.tsx` (client)
- Various account-page forms/buttons (profile, addresses, settings,
  wishlist-remove, compare-clear) — see the route list below.

**Routes** — see section 3.

## 2. Files modified

- `components/product/purchase-panel.tsx` — rewritten: real Add to Cart
  and Wishlist wired in, replacing the Phase 3 disabled placeholders.
- `components/product/product-card.tsx`, `product-grid.tsx` — compare
  toggle added.
- `components/storefront/site-header.tsx` — now async; shows a live cart
  item count badge.
- `app/(storefront)/product/[slug]/page.tsx` — fetches auth/wishlist state
  and passes it to `PurchasePanel`.
- `app/(auth)/actions.ts` — added `requestPasswordReset`, `updatePassword`;
  `signIn` now merges the guest cart into the customer's cart on success.
- `app/(auth)/sign-in/sign-in-form.tsx` — added a "Forgot password?" link.
- `lib/data/site-settings.ts` — added `getPaymentMethods()` (caught and
  fixed a self-inflicted syntax error from this edit before it went
  further — see item 16).
- `README.md` — was still describing Phase 1 status; corrected to Phase 3
  at the start of this session (flagged by you) before Phase 4 began.
- **Route reorganization**: the customer account area was moved from a
  standalone `app/account/` (Phase 1 placeholder) to
  `app/(storefront)/account/*`, so it shares the storefront header/footer
  and gets a proper sidebar layout. Middleware protection is unaffected
  (route groups don't change the URL; `/account` still matches the
  `pathname.startsWith("/account")` check — verified by inspection).

## 3. Routes created

```
/cart                                real cart, live pricing
/checkout                             guest + authenticated checkout form
/checkout/confirmation/[orderNumber]  order confirmation
/compare                              product comparison (works for guests too — cookie-based, not account data)
/account                              overview (moved from app/account/)
/account/profile                      name/phone
/account/addresses                    list, add, delete, set default
/account/orders                       order history
/account/orders/[id]                  order detail + status history
/account/wishlist                     view + remove
/account/settings                     change password (current-password verified)
/reset-password                       request reset email
/update-password                      set new password after reset link
/auth/callback                        exchanges Supabase email-link code for a session
```

## 4. Customer features implemented

Sign up, sign in, sign out (Phase 1) + email confirmation (Supabase
default) + password reset request + password update after reset link +
in-session password change with current-password re-verification. Profile
editing. Address CRUD with default-address handling. Wishlist add/remove/
view (customer-only; RLS-owned). Product comparison (guest-usable, cookie-
based, real spec data — see item 5 caveat).

## 5. Cart implementation

Both guest and authenticated carts work through one shared code path
(`getCartClient()` picks the RLS-bound client or the service-role client).
Guest identity is a random, httpOnly `session_token` cookie — never
exposed to the browser as a queryable ID, never set during Server
Component render (only from Server Actions, per Next.js's cookie-write
constraint). **Security fix made during this build, not after**: guest
cart mutations run through the service-role client, which bypasses RLS
entirely — I initially wrote `updateCartItemQuantity`/`removeCartItem`
trusting a bare `cartItemId` with no ownership check, which would have let
a guest modify *any* cart's items by id. Caught it before moving on and
added `assertOwnsCartItem()`, enforced for both guest and authenticated
paths. See item 11 for the full security review.

Cart totals are never persisted — `cart_items` still has no price column
(by Phase 2 design); `/cart` and checkout always re-read current price
from `products`/`product_variants`.

**Caveat**: `PurchasePanel`'s stock check is product-level only — a
product with variants that have independently-tracked stock doesn't get
a variant-specific "in stock" check on the product page (flagged in code
and in Phase 3's report already; still not resolved here).

## 6. Checkout implementation

`CheckoutForm` collects guest contact info (name/phone required, email
optional) or uses the signed-in customer; fulfillment type (pickup/
delivery); a saved address (authenticated) or free-text address (guest —
see item 9); and payment method, filtered to only the methods enabled in
`site_settings.payment_methods`. Before calling `create_order()`,
`submitCheckout()` prunes any cart items that have gone unpublished/
inactive since being added — this was a bug I caught and fixed during the
build (see item 16) rather than letting checkout fail outright over a
stale item the `/cart` page had already visually excluded.

## 7. Order implementation

`create_order()` (migration `0032`) is a single Postgres function call —
one implicit transaction. It: verifies cart ownership; validates every
item's product/variant is still published/active; computes authoritative
unit price (variant sale price → variant price → product sale price →
product base price, never client-supplied); finds and applies the best
single matching active discount per line (percentage/fixed, respecting
`min_quantity` and `max_discount_amount`); decrements inventory via a
locking `UPDATE` (see item 8); writes `order_items` snapshots; clears the
cart; queues an internal staff notification; returns the order number.
Any `RAISE EXCEPTION` anywhere in the loop rolls back everything done so
far in that call — no partial orders are possible.

**Known limitation**: `discounts.min_order_total` is not enforced (only
`min_quantity`, active window, and scope are checked). Documented in the
migration's own comment; not silently ignored.

## 8. Inventory integration

Inventory is decremented with `update inventory set quantity_on_hand =
quantity_on_hand - N where id = ...` inside `create_order()`. This
statement takes a row lock for the duration of the transaction; a second,
concurrent checkout for the same (now-locked) inventory row blocks until
the first commits, then evaluates the `quantity_on_hand >= 0` CHECK
constraint (0014) against the correct post-commit value — so two
customers racing for the last unit cannot both succeed. This relies on
ordinary Postgres MVCC/row-locking semantics, not a custom locking
scheme, and **has not been tested under actual concurrent load** (see
item 12) — the correctness argument is sound Postgres behavior, but I
want to be clear that "should work by how Postgres locking works" and
"tested under real concurrency" are different claims, and only the first
is true right now.

## 9. Discount integration

Implemented inside `create_order()` per line item: best matching active
discount by scope (`all`/`product`/`category`), respecting active window
(`starts_at`/`ends_at`), `min_quantity`, percentage-vs-fixed calculation,
and `max_discount_amount` cap. `min_order_total` is the one documented gap
(item 7).

## 10. Notification integration

`create_order()` inserts one `notifications` row targeted at the
`admin`/`staff`/`sales` roles on every order creation (using the existing
Phase 2 `notifications` schema — `recipient_role_id`, per-role targeting).
There is no UI yet to read/display notifications (not in this milestone's
scope) and no external email/SMS — exactly as instructed ("keep the
architecture ready for later integration").

## 11. Security review

- **Cart ownership (guest)**: fixed during build — see item 5.
- **Price authority**: `cart_items` has no price column; `create_order()`
  re-reads price from `products`/`product_variants` inside the same
  transaction that creates the order. No code path anywhere accepts a
  client-supplied price.
- **Guest checkout uses the service-role client**: the only two sanctioned
  uses of `createAdminClient()` in this codebase are (a) guest cart
  read/write, gated by the httpOnly session cookie, and (b) invoking
  `create_order()` for a guest, where cart ownership was already verified
  by construction (the cart id came from the guest's own cookie lookup).
  No other code path uses the privileged client.
- **Order confirmation for guests**: guarded by a separate, short-lived
  (1 hour) httpOnly cookie set only by a successful checkout — not by
  order-number secrecy, since order numbers are sequential and low-
  entropy. Without the cookie, the confirmation page returns nothing,
  regardless of whether the order number in the URL is correct.
- **Order history/detail**: relies entirely on Phase 2 RLS
  (`orders.customer_id = auth.uid()`) — `getMyOrderById()` adds no extra
  filter because there's no unauthenticated path into it.
- **Address ownership**: RLS (0006) plus an explicit `.eq("customer_id",
  ...)` in the service layer as defense in depth.
- **Wishlist ownership**: RLS (0027); `toggleWishlist()`/
  `getWishlistProductIds()` both resolve the customer id from the session,
  never from a client-supplied id.
- **Password change**: re-verifies the current password via
  `signInWithPassword()` before calling `updateUser()` — Supabase's own
  `updateUser()` would otherwise accept a new password for any active
  session without re-proof of the old one.
- **Zod validation**: `schemas/cart.ts`, `schemas/checkout.ts`,
  `schemas/address.ts` validate every mutation input server-side (client-
  side HTML `required`/`type` attributes are UX only).
- Nothing places `SUPABASE_SERVICE_ROLE_KEY` in client code — every use of
  `createAdminClient()` is in a file under `lib/services/`, imported only
  by Server Actions/Route Handlers.

## 12. RLS tests

**Not executed** — same constraint as every prior phase: no network
access in this environment, so no live Supabase project to run any test
against. What I did instead: re-read every new query against the specific
RLS policy it depends on (cited by migration number in the code comments
above) to confirm the policy actually covers the access pattern the code
uses. That is a review, not a test.

## 13. Tests executed

**None.** `npm run typecheck`, `npm run lint`, and `npm run build` were
not run — no network access to install dependencies in this container.

## 14. Tests NOT executed — please run all of these

1. `npm install && npm run typecheck && npm run lint && npm run build`
2. Sign up → confirm email → sign in → sign out
3. Password reset: request → email link → `/auth/callback` → 
   `/update-password` → sign in with new password
4. In-session password change (correct and incorrect current password)
5. Profile edit persists
6. Address add/delete, default-address switching; confirm a second
   customer cannot see or delete the first customer's addresses
7. Wishlist add/remove from a product page and from `/account/wishlist`;
   confirm ownership (second customer can't see the first's wishlist)
8. Compare: add up to 4 products from `/shop`, view `/compare`, clear
9. **Guest cart**: add items with no session, view `/cart`, verify a
   fresh incognito session doesn't see the same cart
10. **Guest → account merge**: build a guest cart, sign in, confirm items
    appear in the now-authenticated cart and the guest cart cookie is gone
11. Quantity changes (increment/decrement/remove), including hitting the
    1/20 bounds
12. An item going out of stock (or unpublished) after being added to cart,
    then attempting checkout — confirm the item is pruned rather than the
    whole checkout failing
13. Full checkout: guest pickup, guest delivery (free-text address),
    authenticated pickup, authenticated delivery (saved address)
14. Order confirmation: guest can view their own via the cookie gate;
    confirm a guest **cannot** view another guest's confirmation URL by
    guessing/incrementing the order number
15. Order history (`/account/orders`, `/account/orders/[id]`) — confirm
    ownership (second customer can't view the first's order by URL/ID)
16. **Concurrency**: two simultaneous checkouts for the last unit of an
    item — confirm exactly one succeeds and inventory never goes negative
    (this is the most important test in this whole phase and the one I'm
    least able to substitute review for)
17. A discount (percentage and fixed, product/category/all scope) applied
    correctly at checkout
18. Mobile layout for cart, checkout, account pages

## 15. Database migrations added

`0032_create_order_function.sql` only.

## 16. Known issues

- `discounts.min_order_total` not enforced in `create_order()` (item 7).
- Guest delivery has no structured address (folded into `notes` as text —
  a real Phase 2 schema gap: `orders.delivery_address_id` references
  `addresses`, which requires a `customer_id` guests don't have).
- Product-level-only stock check on variant products (carried from
  Phase 3, still open).
- I made and caught two real bugs while building this phase rather than
  shipping them silently: the guest cart-item ownership gap (item 5) and
  a duplicate `const client` declaration in `checkout.ts` that would have
  been a harmless but sloppy shadowing issue — both fixed in place before
  packaging.
- `types/supabase.ts` is still hand-written (carried from Phase 2); this
  phase adds more `as any` casts at query boundaries the placeholder type
  doesn't cover (`cart_items`, `wishlists`, `addresses` writes, the
  `create_order` RPC call itself). All are commented at the call site.

## 17. Manual actions required

1. Run the full test list in item 14 against a real dev Supabase project —
   nothing in this phase has been executed.
2. Confirm your Supabase project's Auth email templates/redirect URLs
   include `{site}/auth/callback` for both signup confirmation and
   password-reset links (Auth → URL Configuration).
3. Decide whether `min_order_total` discounts matter for your business
   before Phase 5 (if so, it needs adding to `create_order()`).
4. Decide whether guest delivery orders are acceptable long-term as free-
   text addresses, or whether it's worth a schema change (e.g., an
   `order_delivery_snapshot` field) to store guest delivery details
   structurally.

## 18. Recommendations for Phase 5

Per your Phase 4 brief, the admin dashboard, rental management, repair
management, student verification management, and corporate enquiry
management are explicitly out of scope here and still don't exist. Given
orders now flow all the way through to a real `orders` table with
`order_status`/`payment_status`, the most natural Phase 5 is the admin
order/inventory/product management screens — staff currently have no way
to see or act on the orders this phase now allows customers to create.

Stopping here per your instructions, waiting for your review.
