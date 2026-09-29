# Classic Computers LLC

Classic Computers LLC is a Malawi-based electronics retailer platform built with Next.js, React, TypeScript, Tailwind CSS, and Supabase. The application combines a customer-facing storefront with internal business workflows for orders, inventory, customer accounts, rentals, repairs, student verification, referrals, and admin management.

## Overview

This repository contains a full-stack commerce and operations platform for a local computer and electronics business. It includes:

- A storefront for browsing products, searching, filtering, and purchasing
- A customer account area for orders, addresses, profile management, and wishlist features
- An admin dashboard for product and order management
- Support workflows for repairs, rentals, student verification, and corporate enquiries
- Supabase-powered authentication, authorization, storage, and database access

## Tech stack

- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Supabase (Postgres, Auth, Storage, RLS)
- Zod for validation

## Features

### Storefront
- Product catalog with filtering and pagination
- Search and category pages
- Product detail pages with stock and variant handling
- Cart and checkout flow
- Guest and authenticated customer checkout
- Order confirmation and customer tracking

### Customer account
- Profile and address management
- Wishlist and compare functionality
- Order history and status tracking
- Repair, rental, and enquiry tracking
- Password reset and account settings

### Admin
- Product management
- Order oversight and status updates
- Inventory controls
- Customer and staff views
- Referral, enquiry, repair, and rental management
- Dashboard summary cards and business reporting

## Prerequisites

- Node.js 18.18 or newer
- A Supabase project for development
- A local terminal with Git available

## Quick start

1. Clone the repository.

   ```bash
   git clone <repo-url>
   cd classic-computers
   ```

2. Install dependencies.

   ```bash
   npm install
   ```

3. Copy the environment template and fill in your values.

   ```bash
   cp .env.example .env.local
   ```

4. Configure the environment variables in `.env.local`.

   ```env
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_ROLE_KEY=
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

   Notes:
   - `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are safe for browser use.
   - `SUPABASE_SERVICE_ROLE_KEY` is server-only and must never be exposed to client code.
   - `.env.local` is gitignored and should never be committed.

5. Start Supabase locally or link to a development project.

   For local development:

   ```bash
   npx supabase start
   npx supabase db reset
   ```

   For a linked Supabase project:

   ```bash
   npx supabase login
   npx supabase link --project-ref <your-project-ref>
   npx supabase db push
   ```

6. Generate database types if needed.

   ```bash
   npx supabase gen types typescript --linked --schema public > types/supabase.ts
   ```

7. Run the app.

   ```bash
   npm run dev
   ```

   Open http://localhost:3000 in your browser.

## Available scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
npm run format
npm run format:check
```

### Script purposes

- `npm run dev` — start the local development server
- `npm run build` — create a production build
- `npm run start` — run the production build locally
- `npm run lint` — lint the app with ESLint
- `npm run typecheck` — run TypeScript checks without emitting files
- `npm run format` — format the project with Prettier
- `npm run format:check` — check formatting without modifying files

## Project structure

```text
app/
  (storefront)/
  admin/
  api/
  auth/
components/
  admin/
  product/
  storefront/
  ui/
lib/
schemas/
supabase/
  migrations/
  seed.sql
  config.toml
types/
PHASE_1_REPORT.md
PHASE_2_REPORT.md
PHASE_2_DATABASE_ARCHITECTURE.md
PHASE_3_REPORT.md
PHASE_4_REPORT.md
PHASE_4_CORRECTION_REPORT.md
PHASE_5_REPORT.md
PHASE_6_REPORT.md
PHASE_6_FINAL_REPORT.md
```

The phase reports contain the implementation history and notes for the platform build. They are useful when reviewing what was implemented at each stage.

## Database and Supabase notes

- The app depends on Supabase for authentication, storage, and database access.
- Local development is easiest with the Supabase CLI.
- The project includes migrations and seed data under the `supabase/` folder.
- Keep your service-role key only on the server and never import it into client components.

## Security notes

- Never commit `.env.local`.
- `SUPABASE_SERVICE_ROLE_KEY` bypasses Row Level Security and must only be used in trusted server-side code.
- Route protection and middleware are not the only security boundary; database policies and server-side checks are the real protections.

## Development guidance

This project is an active full-stack application. If you are making changes, keep the following in mind:

- Respect the existing app-router structure and route organization.
- Do not expose server-only secrets to the browser.
- Keep business logic and database access within server-safe code paths.
- Use the phase reports for context before making large changes.

## License

This project is for internal business use unless otherwise specified by the project owner. Check the repository status or legal docs for production deployment licensing requirements.
