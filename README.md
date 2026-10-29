# Classic Computers LLC Website

Classic Computers LLC is an ICT and electronics retailer based in Blantyre,
Malawi. This full-stack web platform brings together online product discovery
and ordering with business services such as corporate supply, laptop rentals,
and computer repairs.

[Visit the website](https://classiccomputers.mw/) · [View the GitHub
repository](https://github.com/MkandawireChico/classic-computers)

## Contents

- [Project overview](#project-overview)
- [Features](#features)
- [Technology stack](#technology-stack)
- [Screenshots](#screenshots)
- [Project structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting started](#getting-started)
- [Environment configuration](#environment-configuration)
- [Database and Supabase setup](#database-and-supabase-setup)
- [Available scripts](#available-scripts)
- [Testing and quality checks](#testing-and-quality-checks)
- [Payment and checkout workflow](#payment-and-checkout-workflow)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [Business information and contact](#business-information-and-contact)
- [License](#license)

## Project overview

This repository contains the customer-facing website and a role-protected
administration area. Product, order, inventory, account, and service data are
managed through Supabase. Public-facing business details and payment-method
availability are read from the database, so the information shown on the site
depends on the connected Supabase project.

## Features

### Shopping and product discovery

- Browse products by category and brand.
- Search, sort, filter, and paginate the catalogue.
- View product pages with images, specifications, variants, and availability.
- Add products to a cart and review it before checkout.

### Checkout and payments

- Check out as a guest or signed-in customer.
- Choose pickup or delivery and submit contact and order details.
- Select from the payment methods enabled in site settings: pay at the shop,
  bank transfer, mobile money, or cash on delivery.
- For bank transfer and mobile money, select a provider to view its account or
  wallet details maintained by the application, along with transfer
  instructions.
- Copy account details and optionally supply a transaction reference.

Bank transfers and mobile-money payments use manual instructions. The
repository does not implement a payment-gateway integration or automatic
payment confirmation. Orders using manual payment remain unpaid until a
payment is verified.

### Business and customer services

- Submit a corporate or bulk-supply enquiry.
- Browse available laptop rentals, request a booking, and view rental records.
- Book and track computer repairs.
- Review student deals and submit student verification information.

### Customer accounts

- Register, sign in, reset or update a password, and manage account settings.
- Manage a profile and saved delivery addresses.
- Review orders, notifications, wishlist items, referrals, enquiries, rentals,
  repairs, and student-verification status.

### Administration

The permission-aware admin area includes workflows for the product catalogue,
brands and categories, inventory, orders, customers, discounts, reviews,
enquiries, referrals, rentals, repairs, student verification, site settings,
site media, and staff users. Available pages and actions depend on the signed-in
staff member's permissions.

## Technology stack

| Technology                                  | Role                                                                       |
| ------------------------------------------- | -------------------------------------------------------------------------- |
| Next.js 14 App Router                       | Web application, server-rendered pages, route handlers, and server actions |
| React 18                                    | User interface components                                                  |
| TypeScript                                  | Application and database-client types                                      |
| Tailwind CSS                                | Utility-first styling                                                      |
| Supabase                                    | PostgreSQL database, authentication, and object storage                    |
| `@supabase/ssr` and `@supabase/supabase-js` | Supabase clients for server-rendered and browser contexts                  |
| Zod                                         | Input and data validation                                                  |
| Supabase CLI                                | Local Supabase development and database migrations                         |
| ESLint and Prettier                         | Linting and formatting                                                     |

## Screenshots

There are no verified application screenshots in the repository yet. To add
them later, commit approved screenshots and link them in this section using
their repository-relative paths and descriptive alt text.

## Project structure

```text
app/
  (auth)/                 Sign-in, sign-up, and password pages
  (storefront)/           Storefront, account, checkout, and service pages
  admin/                  Permission-aware administration pages
  api/                    Route handlers, including the health endpoint
  auth/                   Authentication callback and verification pages
components/
  admin/                  Admin interface components
  product/                Product and catalogue components
  storefront/             Storefront forms, navigation, and sections
  ui/                     Shared interface primitives
lib/
  auth/                   Authentication and permissions helpers
  data/                   Database-backed read functions
  payments/               Manual payment-provider details and parsing
  services/               Server-side business workflows
  supabase/               Supabase client setup
schemas/                  Zod validation schemas
supabase/
  migrations/             Ordered SQL schema and policy migrations
  seed.sql                Local development seed data
types/
  supabase.ts             Supabase database types
```

## Prerequisites

- Node.js 18.18 or newer.
- npm and Git.
- A Supabase project, either the local Supabase stack or a development project.
- Docker Desktop or another Docker-compatible runtime when running Supabase
  locally.

The repository does not pin a separate npm version or Node.js version file.
`package.json` declares the minimum Node.js version.

## Getting started

Clone the repository and install the locked dependencies:

```bash
git clone https://github.com/MkandawireChico/classic-computers.git
cd classic-computers
npm ci
```

Create a local environment file from the example. Use the command for your
shell:

**Bash**

```bash
cp .env.example .env.local
```

**Windows PowerShell**

```powershell
Copy-Item .env.example .env.local
```

Configure the Supabase values as described in
[Environment configuration](#environment-configuration).

To run against the local Supabase stack:

```bash
npx supabase start
npx supabase db reset
npm run dev
```

`supabase db reset` recreates the local database from the migrations and runs
the configured seed script. It resets local database data. Open
<http://localhost:3000> after the development server starts.

## Environment configuration

The application reads the following variables. `.env.example` is the template;
put local values in `.env.local`, which is ignored by Git.

| Variable                        | Purpose                                                                                                                             |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL. Required by browser and server clients.                                                                       |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key. Required by browser and server clients.                                                                          |
| `SUPABASE_SERVICE_ROLE_KEY`     | Server-only key required for privileged server operations, including guest cart and checkout flows. Never expose it to the browser. |
| `NEXT_PUBLIC_SITE_URL`          | Public site origin for metadata and authentication redirects. Set it to the correct origin for the environment.                     |

Example values below are placeholders, not working credentials:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=replace-with-your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=replace-with-your-server-only-service-role-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

For local development, start the Supabase stack and use the local API URL and
keys printed by the CLI. For a hosted Supabase project, use that project's API
URL and keys. Keep the service-role key only in trusted server-side
configuration. Never add real credentials to documentation, source control, or
browser code.

## Database and Supabase setup

The database schema and policies are defined by the ordered SQL files in
[`supabase/migrations`](./supabase/migrations). Supabase CLI is a project
dependency, and [`supabase/config.toml`](./supabase/config.toml) enables
migrations and the local seed file.

The local workflow is:

1. Start Docker and run `npx supabase start`.
2. Copy the local API URL and keys shown by the CLI into `.env.local`.
3. Run `npx supabase db reset` to apply migrations and seed the local database.

[`supabase/seed.sql`](./supabase/seed.sql) is for local development. It creates
sample categories and brands plus a clearly labeled draft sample product; it
is not a production catalogue. The Supabase configuration runs this seed as
part of a local database reset. The application does not create or populate a
Supabase project automatically.

Before applying schema changes to any shared or production database, review the
migrations and coordinate with the project owner. No hosted database project or
production migration procedure is configured in this repository.

## Available scripts

| Command                | Description                                           |
| ---------------------- | ----------------------------------------------------- |
| `npm run dev`          | Start the Next.js development server.                 |
| `npm run build`        | Create a production build.                            |
| `npm run start`        | Run the production server; run `npm run build` first. |
| `npm run lint`         | Run the Next.js ESLint checks.                        |
| `npm run typecheck`    | Run TypeScript without emitting build output.         |
| `npm run format`       | Format project files with Prettier.                   |
| `npm run format:check` | Check project formatting without writing changes.     |

## Testing and quality checks

The project provides lint, type-check, build, and formatting scripts. It does
not currently define an automated unit- or integration-test script, and no
test/spec files are maintained in the repository.

Before submitting a change, run the checks relevant to it:

```bash
npm run lint
npm run typecheck
npm run format:check
npm run build
```

The production build may require the same Supabase configuration as the
application, depending on which routes and data sources are evaluated.

## Payment and checkout workflow

Checkout supports pay at the shop, bank transfer, mobile money, and cash on
delivery when enabled in site settings. Bank-transfer and mobile-money
selections show the provider-specific details maintained in the application's
manual-payment records and the transfer instructions. Customers can provide a
transaction reference, but placing an order or entering a reference does not
confirm payment.

There is no integrated card processor, payment-initiation link, or automatic
payment reconciliation in the repository. Staff must verify a manual payment
before treating the order as paid.

## Deployment

The repository provides a Next.js production build and start workflow:

```bash
npm run build
npm run start
```

No hosting-provider configuration, container deployment, or CI/CD deployment
workflow is present. Choose a hosting environment that supports the project's
Next.js version. Configure the `NEXT_PUBLIC_` variables in the environment used
to build the application and set the required server-side variables for the
running application. Arrange Supabase database migrations separately before
deployment; this repository does not define a production migration procedure.

## Troubleshooting

### Supabase configuration errors

Check that `.env.local` exists and contains the URL and anon key for the
intended Supabase project. Restart `npm run dev` after changing environment
variables. The `GET /api/health` endpoint reports whether the Supabase URL,
anon key, and service-role key are configured; it does not verify database
connectivity.

### Local Supabase does not start

Ensure Docker is running, then retry `npx supabase start`. If the local
database schema or seed data is out of sync, `npx supabase db reset` reapplies
the migrations and seed, but resets local database contents.

### Dependency installation fails

Use the Node.js version declared in `package.json` or newer, and install from
the checked-in lockfile with `npm ci`. If installation still fails, review the
first npm error for network, registry, or platform-specific causes.

### Production build fails

Run `npm run typecheck` and `npm run lint` to surface code issues. Confirm the
required environment variables are configured for the build environment and
review the first build error; a missing Supabase connection or schema mismatch
may cause database-backed pages to fail.

## Contributing

1. Create a focused branch for the change.
2. Follow the existing App Router, component, service, and validation patterns.
3. Keep secrets and local environment files out of commits.
4. Update the relevant documentation when application behavior or setup
   changes.
5. Run the applicable lint, type, formatting, build, and manual checks.
6. Submit a pull request with a concise summary and verification notes.

Database changes should be represented by reviewed migration files rather than
undocumented manual schema changes.

## Business information and contact

Classic Computers LLC is based in Blantyre, Malawi. The storefront's public
business contact details are managed in Supabase site settings rather than
maintained as static values in this repository.

- Website: [classiccomputers.mw](https://classiccomputers.mw/)

## License

No license has been specified in the repository.
