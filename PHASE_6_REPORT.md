# Phase 6 Report (in progress) — Business Workflows & Customer Service Modules

**This is a progress report, not a completion report.** Phase 6 covers 12
sections in the brief; this document covers sections 1–8 and part of 9.
Sections 9 (account dashboard integration), 11 (admin nav grouping), and
the `/account/notifications` page are not started. I'm filing this now
because it should have accompanied the last two checkpoints and didn't —
that was an oversight, not a decision to skip it.

## 0. Most important finding — read this first

While wiring up referral attribution, I traced `orders.customer_id`'s
foreign key back to `customers(id)` and discovered **`handle_new_user()`
(Phase 1, migration `0004`) creates a `profiles` row on signup but never
creates a `customers` row.** Eleven tables have a foreign key to
`customers(id)`: `addresses`, `product_views`, `carts`, `orders`,
`reviews`, `student_verifications`, `referrals`, `rental_bookings`,
`repair_tickets`, `enquiries`, `wishlists`.

**Practical effect:** every one of those inserts — add to cart, place an
order, write a review, submit student verification, request a rental,
book a repair, submit an enquiry, save a wishlist item — would fail with
a foreign-key-violation error for any real, authenticated customer, from
the moment Phase 4 shipped, because there was never a matching
`customers` row for their `profiles.id`.

**Why this wasn't caught earlier:** nothing in this project has been
executed against a live database at any point — every phase report has
said so explicitly. This is the first time a change (referral attribution
reading `customers.referral_code`) required tracing the FK chain far
enough back to notice the row creation step was simply missing.

**Fix:** migration `0040_fix_missing_customer_row.sql` —
`CREATE OR REPLACE FUNCTION handle_new_user()` (identical trigger
signature, no `DROP` needed) now also inserts into `customers`, plus a
backfill `INSERT ... SELECT ... WHERE NOT EXISTS` for any profile that
predates the fix. Please treat this as the highest-priority thing to
verify once you have a real environment — it's foundational to
everything else in Phases 4–6.

## 1. Migrations added (0036–0041)

| Migration | What it does |
|---|---|
| `0036_phase6_repairs_rentals_notifications.sql` | Guest tracking tokens for repairs/rentals; `repair_parts` inventory linkage columns; customer-facing notification triggers for repair/rental/student/referral status changes; **fixes a missing anon INSERT policy on `repair_tickets` and `rental_bookings`** (guest booking was previously impossible under RLS) |
| `0037_rental_status_lost.sql` | Adds `'lost'` to `rental_status_enum` (standalone — `ALTER TYPE ADD VALUE` can't share a transaction with a statement that uses the new value) |
| `0038_student_discount_enforcement.sql` | **Fixes `create_order()`**: `discounts.scope = 'student'` existed since Phase 2 but was never matched by the discount-selection query — a student discount would silently never apply to anyone |
| `0039_enquiry_internal_notes.sql` | Adds `internal_notes` to `enquiries` and `corporate_enquiries` (neither had any notes column at all) |
| `0040_fix_missing_customer_row.sql` | **The critical fix described above** |
| `0041_referral_attribution.sql` | New `auth.users` trigger that attributes a referral from signup metadata (referrals has no customer-facing INSERT policy by design, so attribution must happen server-side) |

None of `0001`–`0035` were modified.

## 2. Real gaps found by inspection (per the brief's own instruction to inspect before changing anything)

1. `repair_tickets`/`rental_bookings` had no guest tracking mechanism and
   no way for RLS to ever let a guest read their own record back.
2. `repair_tickets`/`rental_bookings` had no anon INSERT policy at all —
   guest booking was impossible, not just insecure.
3. `repair_parts` had zero linkage to inventory/products — free text only.
4. `rental_status_enum` had no `'lost'` value despite the brief requiring
   it as a distinct outcome from `'damaged'`.
5. `discounts.scope = 'student'` was dead code in `create_order()`.
6. `enquiries`/`corporate_enquiries` had no notes column of any kind.
7. `referrals` had no INSERT path for anyone but admin — meaning nothing
   could ever create a referral row automatically at signup.
8. **The `customers` row was never created at all** (section 0).

I want to be direct about the pattern here: this project has now found a
foreign-key-breaking bug, two silently-nonfunctional discount scopes, and
three missing RLS policies across five phases — all because nothing has
ever been run against a real database. Each was caught by inspection, not
execution, which is a weaker guarantee than actually testing. Please
prioritize getting a real dev Supabase project running before treating
any of Phases 4–6 as production-ready.

## 3. Modules completed

### Repairs (brief section 3)
- Public: `/repairs/book` (real submission, guest or authenticated),
  `/repairs/track` (guest tracking via ticket number + secure token,
  never by ID alone).
- Account: `/account/repairs`, `/account/repairs/[id]` — RLS-owned,
  internal technician notes never selected in the query at all, not just
  hidden in the UI.
- Admin: `/admin/repairs`, `/admin/repairs/[id]` — server-enforced status
  transitions (allow-list, not arbitrary), technician assignment with a
  real "must be assigned to act" check for the technician role separate
  from staff/admin, quotes, customer-visible vs. internal notes, parts
  tracking that consumes real inventory through `apply_inventory_movement()`
  with `inventory_movement_id` guarding against double-consumption.

### Rentals (section 5)
- Public: `/rentals` — real rentable products from the catalogue (never
  hard-coded), live availability checking re-verified server-side at
  submission (not trusted from the client display), guest tracking widget.
- Account: `/account/rentals`, `/account/rentals/[id]`.
- Admin: `/admin/rentals`, `/admin/rentals/[id]` — status transitions with
  real inventory effects (`rental_checkout` decrements, `rental_return`
  restores, `damaged`/`lost` record a zero-delta ledger entry for
  auditability without restocking).
- **Known limitation, stated plainly**: availability checking is a
  check-then-insert, not a locking transaction like `create_order()`. It
  is correct for normal use but does not have the same atomic guarantee
  against a genuine simultaneous double-booking race. This is documented
  in code, not silently presented as equivalent.

### Student verification (section 6)
- Account: `/account/student-verification` — submission with optional
  private document upload (JPEG/PNG/PDF, 5MB limit), status display.
- Admin: `/admin/students`, `/admin/students/[id]` — signed URLs (5-minute
  expiry) generated under the reviewing staff member's own session (the
  bucket's existing SELECT policy already gates this on
  `students.verify`; no service-role client needed here), approve/reject
  with a "must currently be pending" guard against re-deciding an
  already-decided request.
- Student discount enforcement fixed at the database layer (section 2,
  item 5) — this is what makes "a non-verified customer must not receive
  a student discount by modifying request data" actually true, since the
  check now happens inside `create_order()` itself, not the UI.

### Corporate & general enquiries (section 7)
- `/corporate` and `/contact` now submit real data (previously honest
  Phase-3 placeholders pointing at WhatsApp/phone only).
- `/account/enquiries` — general enquiries only (`corporate_enquiries`
  has no `customer_id` in the schema at all — it's organisation-level,
  not tied to an account, which matches the brief's implicit design).
- Admin: `/admin/enquiries` with general/corporate tabs, inline status +
  internal notes editing per row.
- **Design simplification, stated plainly**: I built inline row-level
  editing on the list page rather than the separate `/admin/enquiries/[id]`
  detail route the brief suggests. Same capabilities, less code. If you'd
  prefer the dedicated detail route, say so and I'll split it out.

### Referrals (section 8)
- `/account/referrals` — shows the customer's own code (already
  auto-generated since Phase 2) and their referral history. No invented
  rewards, percentages, or payouts anywhere — `reward_amount`/
  `reward_status` are only ever displayed if actually set on the row.
- `/sign-up?ref=CODE` captures a referral code, passed through Supabase
  Auth signup metadata, attributed by the new `0041` trigger — the first
  time referral attribution has actually worked in this project.
- Admin: `/admin/referrals` — status updates only; the schema has no
  admin notes field on `referrals` and I did not add one (not asked for
  in the brief for this table specifically).

## 4. Security review for everything in this report

- Every new admin page/action follows the same three-layer pattern as
  Phases 5: route access (nav filtering, cosmetic), server-side
  `requirePermission()`, RLS underneath.
- Reused existing permissions throughout rather than inventing new ones,
  per the brief's instruction to review before adding: `repairs.read/
  write`, `rentals.read/write`, `students.read/verify`, `customers.read/
  write` (for enquiries — matches the RLS design already in 0024),
  `settings.write` (for referrals and discounts, matching existing
  precedent from Phase 5).
- Guest tracking (repairs, rentals) is gated by an unguessable token
  matched in application code via the privileged client — the same
  established pattern as guest cart/guest order confirmation, not a new
  one invented for this phase.
- Student documents: signed URLs only, 5-minute expiry, generated under
  the staff member's own session so the bucket's existing permission
  gate applies naturally.
- No new use of the service-role client beyond what Phase 5 already
  established (guest cart/checkout, listing Supabase Auth users, one
  customer's email lookup) — repairs/rentals/students/enquiries/referrals
  admin all use the normal RLS-bound client under the staff member's own
  session throughout.
- Technician role: verified `assertCanActOnTicket()` actually restricts a
  technician to tickets assigned to them, separate from and in addition
  to RLS's own equivalent restriction (0023).

## 5. Tests executed

**None.** Same constraint as every phase — no network access in this
environment, no live Supabase project.

## 6. Tests NOT executed — critical ones for this phase specifically

1. **Sign up a brand-new user and confirm a `customers` row actually gets
   created** — this is now the single most important test in the whole
   project given section 0.
2. Sign up with `?ref=CODE` from an existing customer's referral code and
   confirm a `referrals` row appears.
3. Guest repair booking → guest tracking with the returned token → confirm
   it works and that a wrong token returns nothing.
4. Guest rental booking → same.
5. Rental availability: book right up to capacity for overlapping dates,
   confirm the next request is correctly rejected or reduced.
6. Student verification → admin approve → place an order with a
   `student`-scope discount → confirm it actually applies. Then reject a
   different student's verification and confirm the discount does NOT
   apply to them.
7. Repair part linked to a real product → confirm inventory actually
   decrements via the ledger, and that removing the part restores it.
8. Technician role: sign in as a technician, confirm they can only act on
   their own assigned tickets, not others.
9. The nested PostgREST embed in `lib/data/admin/referrals.ts`
   (`referrer:referrer_customer_id ( profiles ( full_name ) )`) — this is
   a two-hop relationship embed I could not verify against a live
   PostgREST instance; it may need adjustment.
10. `npm run typecheck && npm run lint && npm run build`.

## 7. Remaining work in Phase 6 (not started)

- `/account/notifications` page — the triggers that create customer
  notifications already exist (`0036`); there's just no UI to read them
  yet, same gap as the admin notification bell before Phase 5's version
  was built.
- Account dashboard summary cards (recent orders, active repairs, active
  rentals, student status, etc. — brief section 10).
- Admin nav grouping into Commerce/Operations/Content/Administration
  sections (brief section 11) — currently a flat list.
- A final cross-module security review sweep once everything above is in
  place (brief implies this happens at the end of Phase 6, not per-module).

## 8. Manual action required

1. Get a real dev Supabase project running and apply migrations
   `0001`–`0041`, then run the tests in section 6 — especially #1.
2. Decide whether the enquiries admin's inline-editing simplification
   (section 3) is acceptable or whether you want the dedicated `/[id]`
   route instead.
3. Let me know whether to continue with the remaining Phase 6 items
   (notifications page, dashboard integration, nav restructuring) or
   address something else first.

Waiting for your direction before continuing.
