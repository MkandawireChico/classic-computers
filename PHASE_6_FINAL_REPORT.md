# Phase 6 — Final Report

This supersedes `PHASE_6_REPORT.md` (filed earlier as a progress report
covering sections 1–8). This document covers the three remaining items
plus the full cross-module integrity review requested.

## 1. Phase 6 completion status

**Complete**, with known issues and untested items listed honestly below
rather than glossed over. All 12 sections of the original brief plus the
three follow-up items (notifications page, dashboard integration, admin
nav grouping) and the integrity review are done. Nothing has been
executed against a live database — see section 6.

## 2. All Phase 6 migrations (0036–0043)

| # | Purpose |
|---|---|
| `0036` | Guest tracking tokens (repairs/rentals); `repair_parts` inventory linkage; customer notification triggers for repair/rental/student/referral; **fixes missing anon INSERT policy** on `repair_tickets`/`rental_bookings` |
| `0037` | Adds `'lost'` to `rental_status_enum` (standalone, per `ALTER TYPE ADD VALUE` rules) |
| `0038` | **Fixes `create_order()`**: `discounts.scope = 'student'` was dead code since Phase 2 |
| `0039` | Adds `internal_notes` to `enquiries` and `corporate_enquiries` |
| `0040` | **Critical fix**: `handle_new_user()` never created a `customers` row — every customer-owned table's FK would have failed for real signups. Backfills existing profiles too. |
| `0041` | Referral attribution trigger, reading a code from signup metadata |
| `0042` | Customer-facing order status notifications (previously only staff got notified) |
| `0043` | **Fixes a bug I introduced earlier this same phase**: the admin rental "notes" editor was writing to the customer's own `notes` field instead of a separate internal one — caught during this integrity review, not after. |

`0001`–`0035` were not modified, per the instruction.

## 3. All Phase 6 routes

**Public:** `/repairs/book`, `/repairs/track`, `/rentals`, `/corporate`,
`/contact` (now with a real enquiry form).

**Account:** `/account` (rebuilt with real summary cards), `/account/repairs`,
`/account/repairs/[id]`, `/account/rentals`, `/account/rentals/[id]`,
`/account/student-verification`, `/account/enquiries`,
`/account/referrals`, `/account/notifications`.

**Admin:** `/admin/repairs`, `/admin/repairs/[id]`, `/admin/rentals`,
`/admin/rentals/[id]`, `/admin/students`, `/admin/students/[id]`,
`/admin/enquiries` (general/corporate tabs), `/admin/referrals`.

**Nav:** admin sidebar regrouped into Commerce / Operations / Content /
Administration (`lib/admin-nav.ts`, `components/admin/admin-sidebar.tsx`).
Every existing route is unchanged — only the sidebar's presentation
changed; no route was moved, renamed, or removed.

## 4. Remaining known issues

- **Rental availability checking is check-then-insert, not a locking
  transaction** like `create_order()`. Correct for normal use, not
  guaranteed atomic against a genuine simultaneous double-booking race.
  Documented in code (`lib/services/rentals.ts`), not silently presented
  as equivalent.
- **Enquiries admin uses inline row editing**, not the separate
  `/admin/enquiries/[id]` route the brief sketches. Same capabilities,
  less code — flagged for your call on whether to split it out.
- **Repair parts quick-add doesn't yet expose a product picker** in the
  UI — `addRepairPart` supports linking a real `product_id` (and would
  correctly deduct inventory if one is passed), but the current form
  only submits free-text parts. The service-layer capability exists; the
  UI to use it fully doesn't yet.
- **The nested PostgREST embed** in `lib/data/admin/referrals.ts`
  (`referrer:referrer_customer_id ( profiles ( full_name ) )`, a two-hop
  relationship) is unverified against a live PostgREST instance and may
  need adjustment.
- **Inventory movement history doesn't resolve `created_by` to an email**
  (carried over from the Phase 5 report — would need the admin client
  per row).
- Corporate enquiries have no customer-visible reply mechanism (no
  `customer_id` in that table's design at all — organisation-level, not
  account-tied, by the existing schema).

## 5. Security findings

**From this review, not previously reported:**
- **The `orders.notes` vs `internal_notes` split (Phase 4 fix) was not
  applied consistently** — I made the identical mistake again for
  `rental_bookings` earlier in this same phase (admin "notes" editor
  overwriting and exposing to the customer what should have been
  staff-only). Caught and fixed in `0043` during this review, not
  reported as clean before checking.
- Verified `0040`'s fix line by line rather than trusting that the SQL
  "looked correct": confirmed the `customers` table's `NOT NULL
  referral_code` is satisfied by the existing `set_customer_referral_code`
  trigger (0006) firing automatically on the new insert (no duplicate
  logic needed); confirmed the backfill's `NOT EXISTS` correctly targets
  only profiles missing a customers row; confirmed the FK chain (11
  tables) is fully covered by a single-row insert into `customers`.
- Verified `0041`'s trigger-ordering assumption is real Postgres
  behavior (same-event triggers on the same table fire in alphabetical
  order by trigger name — documented Postgres semantics, not assumed) —
  `on_auth_user_created` (0004) necessarily fires before
  `z_handle_referral_signup` (0041), so the `customers` row exists before
  attribution runs.
- Verified `create_order()`'s student-discount check (`0038`) correctly
  treats a `NULL` `v_customer_is_verified_student` (guest, or — before
  `0040` — a customer with no row) as excluded from matching, since
  `NULL AND x` is never `TRUE` in a `WHERE` clause. Not a bug, but worth
  confirming rather than assuming.
- Verified every new Phase 6 RLS policy: only two were added (`0036`'s
  guest INSERT policies, both narrowly scoped to `customer_id is null`).
  No policy was dropped, altered, or broadened — confirmed by grep across
  every Phase 6 migration file, not by memory.
- Verified all service-role (`createAdminClient()`) usage project-wide:
  exactly 7 files, all previously documented (guest cart/checkout, guest
  order confirmation, admin user listing, one customer's email lookup,
  guest repair/rental tracking). No new, undocumented use introduced.
- Verified `repair_parts`'s new columns (`0036`) inherit the existing
  table-level RLS correctly (Postgres RLS is row-level, not
  column-level, so no gap from adding nullable columns).
- Verified the `rentals.write` UPDATE policy (0022) covers the new
  `internal_notes` column with no additional policy needed (same
  row-level reasoning).
- Technician restriction (`assertCanActOnTicket` in
  `lib/services/admin/repairs.ts`) re-confirmed: a technician can only
  act on tickets assigned to them; staff/admin with `repairs.write`
  bypass that check by design.
- Customer notification ownership re-confirmed: `getMyNotifications()`
  adds no manual filter because RLS (`recipient_user_id = auth.uid()`,
  0025) is the only path in — role-targeted staff notifications have no
  `recipient_user_id` and are therefore structurally absent from this
  query, not merely filtered out.

## 6. Tests actually executed

- `npm install` — **executed, failed**: `403 Forbidden` from the npm
  registry in this environment. This is a real attempt with a real
  result, not an assumption.
- Because of that failure, `npm run typecheck`, `npm run lint`, and
  `npm run build` **were not run** — there is no `node_modules` for them
  to run against, and attempting them would just fail immediately on a
  missing `next` binary, which isn't a meaningful test result to report.
- Static checks executed successfully: brace-balance scan across every
  file touched this session (clean), grep-based confirmation of no
  `DROP POLICY`/`ALTER POLICY`/broadened policy across Phase 6 migrations
  (clean), grep-based confirmation of complete service-role usage
  inventory (7 files, all justified), grep-based confirmation no stale
  references remain to the renamed rental notes function (clean).

## 7. Tests still requiring a real Supabase environment

In priority order:

1. **Sign up a new user and confirm a `customers` row is actually
   created** — the single most important test in the whole project.
2. Confirm the backfill in `0040` correctly populates `customers` for
   any pre-existing `profiles` row, if your project already has any.
3. Sign up with `?ref=CODE` and confirm referral attribution actually
   fires (`0041`).
4. Place an order, change its status via admin, confirm the customer
   receives a notification (`0042`) and it shows correctly in
   `/account/notifications`.
5. Guest repair/rental booking → tracking with the returned token →
   confirm a wrong token returns nothing.
6. Student verification approval → place an order with a
   `student`-scope discount → confirm it applies; confirm it does NOT
   apply for an unverified customer (`0038`).
7. Admin rental: add an internal note, confirm the customer's own
   `notes` field is unchanged and the internal note is invisible on
   `/account/rentals/[id]` and to guest tracking (`0043`).
8. Repair part linked to a real product → confirm inventory actually
   decrements via the ledger; remove it → confirm it's restored.
9. Technician sign-in → confirm they see only their assigned tickets.
10. Full `npm install && npm run typecheck && npm run lint && npm run build`
    once you have real network access to the npm registry.
11. RLS negative tests: a second customer attempting to read another's
    repair/rental/student verification/referral/enquiry/notification by
    ID or by guessing a tracking token.

## 8. Manual steps required before Phase 7

1. **Get a real dev Supabase project running and apply migrations
   `0001`–`0043` before anything else** — apply `0040` early in your own
   testing and watch for it specifically, given what it fixes.
2. Run the test list in section 7, especially items 1–3.
3. Decide on the two flagged design simplifications (enquiries inline
   editing vs. dedicated route; repair-part product picker UI) — both
   are functional as built, just narrower than the brief's literal
   suggestion.
4. Once you have real npm registry access, run the three build commands
   for real and report back what breaks, if anything — this has never
   been done for this codebase at any phase.

Stopping here per your instruction. Not starting Phase 7.
