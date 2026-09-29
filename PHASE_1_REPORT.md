# Phase 1 Report — Project Foundation

## 0. Backend-inspection note (your item #1)

I could only inspect the **public, unauthenticated** pages of
`classiccomputers.mw` (home, products, admin login screen) via web fetch —
I have no access to its server, source repository, or database, and I
did not attempt to log into `admin.html` or guess anything. From the
rendered HTML alone I cannot determine the backend technology, how
products/images/reviews/repairs/enquiries/referrals/student data are
actually stored, or what API endpoints exist — that information isn't
present in what a browser receives.

**To answer your item #1 properly, I need you to provide (whichever apply):**
- The website's source code / repository (or a zip of the site's files as
  they sit on the server), so I can see the admin backend, any config
  files, and how it talks to a database.
- Server access details are **not** needed from you as credentials — I'm
  not asking for a password. If you can export the current admin login and
  navigate it yourself, screenshots of the network requests it makes
  (browser DevTools → Network tab, while using admin.html) would also tell
  me a lot: look for requests to a `.php` file, a `/api/...` path, or a
  third-party service (Firebase, Airtable, etc.).
- Any existing database export (SQL dump, CSV, or similar) for products,
  images, reviews, repair tickets, enquiries, referrals, or student
  verifications, if one exists.
- Confirmation of where the site is hosted (e.g., a cPanel host) so I know
  whether "the database" is likely MySQL/MariaDB (common on cPanel) versus
  something else.

Until I have at least one of these, I have **not** written a migration
script or assumed a source schema — the migration plan in the earlier
architecture document remains the fallback (manual re-entry of verified
current listings as labeled seed data) unless you provide something better.
This did not block Phase 1, since project foundation doesn't touch the
existing system.

## 1. What was built

A working Next.js App Router foundation with:

- TypeScript, Tailwind CSS, ESLint, Prettier configured.
- A **new, separate** Supabase integration — three distinct client
  factories so client/server/privileged access can never be confused:
  - `lib/supabase/client.ts` — browser client (anon key, RLS-bound).
  - `lib/supabase/server.ts` — Server Component/Action/Route Handler
    client (anon key + user's session cookie, RLS-bound).
  - `lib/supabase/server-admin.ts` — service-role client, marked
    `server-only` (build fails if ever imported into client code); not
    used anywhere yet, reserved for privileged operations added in later
    phases.
- Session-refresh middleware (`lib/supabase/middleware.ts` + root
  `middleware.ts`) that keeps auth sessions alive and redirects
  unauthenticated visitors away from `/account` and `/admin` — explicitly
  documented in-code as a **UX convenience, not the security boundary**.
- A real (not simulated) email/password auth flow: `/sign-up`, `/sign-in`,
  sign-out, backed by Supabase Auth via Server Actions, validated with a
  shared Zod schema (`schemas/auth.ts`) on the server.
- `lib/auth/permissions.ts` — the server-side permission-check function
  every future privileged Server Action/Route Handler will call
  (`requirePermission("products.write")` etc.). It calls a Postgres
  function `has_permission` that **does not exist yet** — it will be
  created in the Phase 2 migrations. This is a known, intentional gap;
  see "Known issues" below.
- A first slice of the design system: `Button`, `Card`
  (+ Header/Title/Description), `Alert`, plus Tailwind design tokens
  (brand colors, surface colors, status colors) in `tailwind.config.ts`.
- App-wide error boundary (`app/error.tsx`), loading state
  (`app/loading.tsx`), and 404 page (`app/not-found.tsx`) — none of them
  expose raw error details to the user.
- `/api/health` — reports (as booleans only, never values) whether the
  required Supabase env vars are configured.
- A placeholder home page and a minimal placeholder `/account` page,
  both clearly labeled in-code as temporary so nobody mistakes them for
  finished storefront/account pages.
- `.env.example`, `.gitignore` (excludes `.env.local` and all secrets),
  and this project's `README.md` with setup/testing instructions.

## 2. Complete folder structure

```
classic-computers/
├── .env.example
├── .eslintrc.json
├── .gitignore
├── .prettierrc
├── README.md
├── PHASE_1_REPORT.md
├── middleware.ts
├── next.config.mjs
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── app/
│   ├── layout.tsx
│   ├── page.tsx                  (temporary placeholder home)
│   ├── globals.css
│   ├── error.tsx
│   ├── loading.tsx
│   ├── not-found.tsx
│   ├── account/
│   │   └── page.tsx              (temporary placeholder, protected route)
│   ├── (auth)/
│   │   ├── actions.ts            (signIn / signUp / signOut Server Actions)
│   │   ├── sign-in/
│   │   │   ├── page.tsx
│   │   │   └── sign-in-form.tsx
│   │   └── sign-up/
│   │       ├── page.tsx
│   │       └── sign-up-form.tsx
│   └── api/
│       └── health/
│           └── route.ts
├── components/
│   └── ui/
│       ├── button.tsx
│       ├── card.tsx
│       └── alert.tsx
├── lib/
│   ├── utils.ts
│   ├── auth/
│   │   └── permissions.ts
│   └── supabase/
│       ├── client.ts
│       ├── server.ts
│       ├── server-admin.ts
│       └── middleware.ts
├── schemas/
│   └── auth.ts
├── types/
│   └── supabase.ts               (placeholder, regenerate in Phase 2)
└── supabase/
    └── migrations/
        └── README.md             (empty until Phase 2)
```

## 3. Files created

All files listed in the tree above — every one of them is new; nothing
existed before this phase.

## 4. Files modified

None (fresh project).

## 5. Dependencies (to be installed via `npm install` — not run in this
environment, since it has no network access; you'll run this locally)

**Runtime:** `next@14.2.15`, `react@18.3.1`, `react-dom@18.3.1`,
`@supabase/ssr@^0.5.2`, `@supabase/supabase-js@^2.45.4`, `zod@^3.23.8`.

**Dev:** `typescript`, `@types/node`, `@types/react`, `@types/react-dom`,
`tailwindcss`, `postcss`, `autoprefixer`, `eslint`, `eslint-config-next`,
`prettier`, `prettier-plugin-tailwindcss`.

## 6. Environment variables required

See `.env.example` for the full annotated list. Required to run anything
beyond the placeholder page:

- `NEXT_PUBLIC_SUPABASE_URL` (browser-safe)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (browser-safe)
- `SUPABASE_SERVICE_ROLE_KEY` (server-only — not used by any code path yet,
  but the client wrapper exists and validates it's present before use)
- `NEXT_PUBLIC_SITE_URL` (defaults to `http://localhost:3000`)

## 7. Supabase setup required (on your side)

1. Create a **new** Supabase project for this platform (do not reuse or
   modify anything tied to the existing site).
2. Copy the Project URL and anon key into `.env.local`.
3. Copy the service-role key into `.env.local` (server-only — never share
   this with me, never put it in a client file).
4. No schema/migrations to run yet — Phase 2 introduces
   `supabase/migrations/0001_...sql` onward, including the
   `has_permission()` function that `lib/auth/permissions.ts` already
   expects.
5. Leave email confirmation on Supabase Auth's default setting for now;
   we'll revisit auth settings (password policy, confirmation requirement)
   explicitly in Phase 2 alongside roles.

## 8. Security measures implemented in this phase

- Three-tier Supabase client separation (anon browser / anon server /
  service-role server-only) so a privileged key can't accidentally leak
  into client code — enforced at build time via the `server-only` import.
- `SUPABASE_SERVICE_ROLE_KEY` is read in exactly one file, and that file
  throws if the key is missing rather than silently proceeding.
- `.env.local` and all `.env*.local` variants are gitignored; `.env.example`
  contains placeholders only.
- Middleware protects `/account` and `/admin` at the routing layer, clearly
  documented as a UX layer, not the authorization boundary.
- `lib/auth/permissions.ts` establishes the pattern every future privileged
  action must follow (fail closed, throw a typed `AuthorizationError`,
  never trust a client-supplied role).
- Generic, non-revealing error messages on sign-in/sign-up (no "email not
  found" vs "wrong password" distinction).
- Global error boundary never surfaces raw error text to the user.
- Zod validation on both auth forms, shared type between client and
  Server Action.

## 9. Commands to run locally

```bash
npm install
cp .env.example .env.local   # then fill in your dev Supabase values
npm run dev
```

Other useful commands: `npm run lint`, `npm run typecheck`,
`npm run format`, `npm run build`.

## 10. How to test the foundation

See the "Testing the foundation" section of `README.md` — in short:
confirm the dev server starts, `/` renders, `npm run lint` and
`npm run typecheck` pass, `/api/health` reflects your env setup, and
(once you've created a dev Supabase project) the sign-up → sign-in →
`/account` → sign-out loop works, and that visiting `/account` while
signed out redirects to `/sign-in`.

**I have not run any of these commands myself** — this environment has no
network access to install npm packages or reach a Supabase project, so I
have reviewed the code carefully but cannot claim it's been executed. That
verification is the next step for you before we treat Phase 1 as fully
confirmed working, per the "don't claim something works unless tested" rule.

## 11. Known issues / gaps (intentional, to be closed in later phases)

- `lib/auth/permissions.ts` calls a Postgres function (`has_permission`)
  that doesn't exist until Phase 2's migrations create it — calling it
  today would error. Nothing in Phase 1 calls it yet; it's foundation code
  waiting for its dependency.
- `types/supabase.ts` is a hand-written placeholder, not the real
  generated schema types — replace it via the Supabase CLI once Phase 2's
  schema exists.
- No admin route/page exists yet (intentionally — there's no admin
  functionality to protect until later phases; the middleware rule for
  `/admin` is future-proofing, not yet exercised).
- I have not run `npm install`/`next build` in this environment (no
  network access here) — please run the local test steps above before
  relying on this as "working."

## 12. Decisions requiring your approval before Phase 2

1. **Backend inspection (item #1)** — please provide source files/exports/
   screenshots as described in section 0 above, or confirm you want me to
   proceed with the "manual re-entry as seed data" fallback with no
   further migration attempt.
2. Confirm the Supabase auth defaults are fine for now (email confirmation
   required, no phone auth, no social login) — Phase 2 will formalize the
   `roles`/`permissions`/RLS model on top of whatever we confirm here.
3. Confirm this folder/module structure is what you want to keep building
   on before Phase 2 adds the full database schema on top of it.

I'm stopping here per your instructions. Not proceeding to Phase 2 until
you've reviewed this and responded on the items above.
