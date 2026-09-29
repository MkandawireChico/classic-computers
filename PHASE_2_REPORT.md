# Phase 2 Report — Database Foundation

## Database architecture & ERD

See `PHASE_2_DATABASE_ARCHITECTURE.md` for the full ERD (Mermaid), complete
table-by-table column/key/constraint/index list, RLS strategy table,
storage bucket strategy, and role/permission model — reviewed before any
SQL was written, per your instruction.

## Migration files created (30, numbered, one concern per file)

```
supabase/migrations/
  0001_extensions.sql                    pgcrypto, citext
  0002_enums.sql                         every enum type used below
  0003_roles_and_permissions.sql         roles, permissions, role_permissions,
                                         user_roles + RLS + catalogue seed
  0004_profiles.sql                      profiles + auto-create-on-signup trigger
  0005_helper_functions.sql              has_permission(), has_role(),
                                         set_updated_at(), log_audit_event(),
                                         + write policies on role tables
  0006_customers_and_addresses.sql       customers, addresses, referral code gen
  0007_brands_and_categories.sql
  0008_products.sql                      + audit trigger
  0009_specification_definitions.sql
  0010_product_variants.sql
  0011_product_specifications.sql
  0012_product_images.sql
  0013_product_views.sql
  0014_inventory.sql                     + status-sync trigger
  0015_inventory_movements.sql           append-only ledger +
                                         apply_inventory_movement() function
  0016_carts.sql
  0017_orders.sql                        + order_number generator, status
                                         history trigger, audit trigger
  0018_discounts.sql                     + audit trigger
  0019_reviews.sql
  0020_student_verifications.sql        + audit trigger, syncs customers.student_status
  0021_referrals.sql
  0022_rentals.sql                       + status history trigger
  0023_repairs.sql                       + ticket number generator, audit trigger
  0024_enquiries.sql
  0025_notifications.sql
  0026_site_settings.sql                 + seed keys (site_statistics disabled)
  0027_wishlists.sql
  0028_audit_logs.sql
  0029_storage_buckets.sql               3 buckets + storage.objects policies
  0030_specification_definitions_seed.sql  spec-field catalogue (real config)

supabase/seed.sql                        DEV-ONLY sample data — not a numbered
                                         migration, so `supabase db push`
                                         never applies it to production;
                                         only `supabase db reset` (local) does
```

**34 tables** created across the migrations above (matching the suggested
core list plus `repair_parts`, `rental_status_history`, `order_status_history`,
`product_views`, exactly as scoped in the architecture doc).

## RLS

Every one of the 34 tables has `alter table ... enable row level security`
plus explicit policies (no table is left to default-deny-by-omission alone,
except the intentionally-omitted write policies documented inline — e.g.
`audit_logs` and `inventory_movements` genuinely have no INSERT policy for
any role, by design, since writes go through `security definer` functions
instead).

## Roles & permissions

- Roles: `admin`, `staff`, `sales`, `technician`, `customer` — seeded in `0003`.
- Permissions: all 25 keys from your list — seeded in `0003`.
- Default grants: admin gets everything; staff/sales/technician get the
  subsets described in the architecture doc; customer gets none (ownership-
  based access instead). All of this is data, not code — changeable later
  via an `/admin/users` screen (Phase 6) without a migration.

## `has_permission()` (your item #15)

Implemented in `0005_helper_functions.sql` exactly as specified: `security
definer`, reads `user_roles`/`role_permissions`/`permissions`, returns only
a boolean. `lib/auth/permissions.ts` (built in Phase 1) calls this via
`supabase.rpc('has_permission', ...)` — that dependency is now satisfied.

**On your instruction not to bypass RLS just because a service-role client
exists:** the service-role client (`lib/supabase/server-admin.ts`, Phase 1)
is not used by anything in this schema. Every table's RLS policies are the
actual authorization boundary for both the anon-session server client and
any future server-role usage. The only places the schema itself bypasses
RLS are the handful of narrow `security definer` functions
(`has_permission`, `has_role`, `log_audit_event`, `apply_inventory_movement`,
the auto-signup trigger, and the small number of "sync a derived field"
triggers like `sync_customer_student_status`) — each does exactly one
well-defined, audited thing and is documented inline with why it needs to
bypass RLS to do it. Broader service-role usage (bulk admin jobs, etc.) is
deferred to whichever later phase actually needs it, and will be justified
the same way when it's added.

## Storage buckets (your item #9)

- `product-images` — **public**, read open to everyone, writes gated on
  `products.write`.
- `repair-documents` — **private**, no anon access at all.
- `student-documents` — **private**, no anon access; upload restricted to
  the uploader's own folder (`{auth.uid()}/...` path convention enforced by
  policy), staff read gated on `students.verify`.

## Auth configuration (your item #2)

Documented in the architecture doc: email/password only, email confirmation
required, password reset enabled, no phone/Google/Facebook/social providers.
**These are settings you configure in the Supabase dashboard (Auth →
Providers / Auth → Email templates) once your project exists** — a
migration file cannot set them, since they're project configuration, not
schema. I have not (and cannot, without your project) configured them
myself; treat this as an instruction for your setup, not something already
done.

## Generated types (your item #14)

**Not regenerated from a live database** — this container has no network
access to reach a Supabase project or run `supabase gen types`. I've left
`types/supabase.ts` as an accurate hand-written placeholder (now including
`has_permission`, `has_role`, and `apply_inventory_movement` function
signatures) with the exact command to run once you've applied these
migrations to your project:

```bash
npx supabase gen types typescript --linked --schema public > types/supabase.ts
```

Please run that yourself and replace the file — I did not fabricate a full
generated-types file, since claiming it matches a schema I've never run
would be a guess, not a fact.

## Tests executed

**None, and I want to be exact about why rather than imply partial
testing:** this container has no network access (cannot reach Supabase,
cannot install/run the Supabase CLI or a local Postgres — I checked; `psql`
isn't even present in this environment) and no live database of any kind.
Nothing here has been run against a real Postgres instance.

## What I did instead (review, not execution)

- Manually traced every foreign key, enum reference, and function call
  across all 30 files to confirm forward references resolve in creation
  order (e.g. `has_permission()` in 0005 before it's used in 0006 onward;
  `set_updated_at()` in 0005 before its first trigger use in 0006).
- Checked every RLS-enabled table has at least one applicable policy per
  the access pattern in the architecture doc.
- Checked constraint logic by hand (e.g. `sale_price < base_price`,
  `end_date >= start_date`, `referrer_customer_id <> referred_customer_id`,
  the percentage-discount ≤100 check).
- Re-read the negative-stock path: `apply_inventory_movement()` relies on
  the existing `quantity_on_hand >= 0` CHECK constraint on `inventory` to
  reject the whole call inside its transaction — I did not add a redundant
  application-level check, to keep the single point of truth, but this
  interaction (trigger + CHECK + function in one call) is exactly the kind
  of thing that should be tested against a real database before you trust
  it, not just read.

## Tests NOT executed — please run these once you have a dev Supabase project

1. `supabase db push` (or `db reset` locally) applies cleanly, in order,
   with no errors.
2. `supabase db reset` locally applies `seed.sql` and the dev sample
   product/inventory row appears; confirm `supabase db push` against a
   remote project does **not** apply it.
3. **RLS negative tests (your item #13), as two authenticated test users A and B:**
   - A cannot `select`/`update` B's row in `orders`, `order_items`,
     `repair_tickets`, `student_verifications`, `rental_bookings`,
     `addresses`, `wishlists`.
   - A signed-in `customer`-role user cannot call
     `apply_inventory_movement()` or write to `inventory`/`products` (no
     `inventory.write`/`products.write`).
   - A `staff`-role user cannot access `roles.manage`/`users.manage`-gated
     rows (role/permission assignment).
   - A `technician` can read only repair tickets assigned to them, not
     every ticket, and never `is_internal = true` updates on tickets they
     don't own via the customer-facing policy.
   - An anonymous (unauthenticated) request cannot read
     `student_verifications`, `audit_logs`, `inventory_movements`, or
     unpublished `products`.
   - Uploading to `student-documents` outside your own `auth.uid()` folder
     is rejected by the storage policy.
4. `has_permission()`/`has_role()` return correct booleans for a seeded
   admin/staff/sales/technician/customer test user each.
5. `apply_inventory_movement()` actually rejects a delta that would drive
   `quantity_on_hand` negative, and the ledger row is NOT written when the
   update is rejected (i.e., the two operations really are atomic).
6. The `handle_new_user()` trigger successfully creates a `profiles` row
   and a `customer`-role `user_roles` row on a real Supabase Auth signup.
7. `npm run typecheck` in the Phase 1 app still passes now that
   `types/supabase.ts` references three new RPC function names (it should —
   they're additive to the placeholder shape) — worth confirming once you
   regenerate real types, since the real generated file's shape may differ
   slightly from my hand-written placeholder.

## Known issues / decisions worth flagging

- **Guest carts** (`carts.session_token`, no RLS-visible identity) are
  documented as needing a Server Action using the privileged client rather
  than a direct client-side policy — this is the first place the
  service-role client will actually be used; I've left it as a documented
  TODO rather than building the Server Action itself, since that's Phase 5
  (cart/checkout) work, not schema work.
- `student-documents` read access for the *owning customer themselves* (not
  just staff) is deferred to a signed-URL-issuing Server Action in a later
  phase, rather than a direct storage policy — flagged inline in
  `0029_storage_buckets.sql`.
- I used the contact phone/WhatsApp/email/hours you can see displayed on
  the current public `classiccomputers.mw` site as the seed values in
  `business_info`/`hours` (I did not invent these — I read them off the
  live site). **Please confirm these are still correct** before this seed
  data is ever treated as production-accurate; I did not invent numbers you
  hadn't shown me, but "found on your own website" and "confirmed by you"
  aren't quite the same thing.
- Per your item #10, `site_statistics` is seeded `{"enabled": false, ...}`
  with every figure `null` — the old "500+ Products / 5+ Years / 1K+ Happy
  Clients" numbers are not present anywhere in this schema or its seed data.

## Security considerations carried forward

- No table relies on frontend restriction; RLS is enabled everywhere and is
  the described boundary in every case above.
- Sensitive tables (`audit_logs`, `inventory_movements`, `student_verifications`
  documents) have no broad write/read path — writes are either
  permission-gated or funneled through one `security definer` function.
- `has_permission()`/`has_role()` are the same functions used by both the
  database (RLS) and the application (`lib/auth/permissions.ts`), so the
  two layers can't silently drift apart.

## Exact instructions to test locally

```bash
# 1. Install the Supabase CLI (see supabase.com/docs/guides/cli) and Docker,
#    then from the project root:
npx supabase init        # if not already initialized
npx supabase start       # spins up local Postgres + Auth + Storage
npx supabase db reset    # applies all 30 migrations + seed.sql

# 2. Confirm no errors, then spot-check a few things in the Supabase Studio
#    UI (opened automatically by `supabase start`):
#    - Table Editor: all 34 tables exist, roles/permissions/site_settings
#      have the seeded rows, one dev sample product exists.
#    - Authentication: create two test users; SQL Editor:
#        insert into user_roles (user_id, role_id)
#        select '<user-a-id>', id from roles where name = 'staff';
#      then test the RLS scenarios in "Tests NOT executed" above, either
#      via the Studio's "Run as user" feature or by hitting PostgREST with
#      each user's JWT.

# 3. Once satisfied, generate real types and point your dev .env.local at
#    this project or a hosted one:
npx supabase gen types typescript --linked --schema public > types/supabase.ts
```

Stopping here per your instructions. Waiting for your review — in
particular, please confirm the `business_info`/`hours` seed values and let
me know if you'd like anything about the role/permission default grants
changed before Phase 3 (public shop: home, `/shop`, product pages, search,
SEO) begins.
