You're right — the design system has been kept deliberately minimal/functional through all six phases (tokens exist, but nothing's been polished). Here's a prompt tailored to your actual codebase you can paste into Copilot:

```
You are styling an existing Next.js App Router project — Classic Computers LLC, 
a computer/electronics retailer in Blantyre, Malawi. The app is functionally 
complete (storefront, cart/checkout, customer account, admin dashboard, repairs/
rentals/student verification/enquiries/referrals) across Tailwind CSS + a small 
design-system in components/ui/ (button.tsx, card.tsx, badge.tsx, alert.tsx) and 
tokens in tailwind.config.ts (brand/surface/status colors, "card" border-radius). 

The functionality must not change. This is a visual/styling pass only — do not 
touch data fetching, Server Actions, business logic, or route structure. Do not 
rename props or component APIs in ways that break existing usages; if you must 
change a component's API, update every call site.

GOAL
Take this from "functional but visually generic" to "looks like a real, 
trustworthy, professional electronics retailer" — not a generic SaaS/AI-template 
look. Reference points: how Apple, Best Buy, or a well-run independent electronics 
shop's website feels — clean, confident, product-forward, not flashy.

DESIGN DIRECTION
- Keep it restrained: no gradients, no glassmorphism, no excessive shadows or 
  animation. Products and prices are the visual focus, not decoration.
- Establish a real typographic scale (currently everything leans on default 
  Tailwind text sizes with no hierarchy). Give headings actual weight/tracking 
  distinction from body text.
- Tighten and rationalize spacing — audit for inconsistent padding/gaps between 
  similar components (cards, form fields, page sections).
- Elevate the existing brand color (#1f56f0) into a more considered palette: keep 
  it as primary, but check contrast ratios and make sure status colors 
  (success/warning/danger/info) feel cohesive with it, not arbitrary.
- Add tasteful, minimal empty/loading states — check components/ui and any 
  "No X yet" text-only states across the account and admin areas; give them a 
  bit more visual structure (icon or illustration-free, just better layout).
- Every interactive element needs a visible, on-brand focus state (already 
  partially there via focus-visible:ring — audit consistency).

SCOPE — apply consistently across all three surfaces:
1. STOREFRONT (app/(storefront)/): homepage hero, category grid, featured 
   products, product cards, product detail page (gallery/purchase panel/specs 
   table), shop grid + filters, cart, checkout form, search results.
2. ACCOUNT (app/(storefront)/account/): the sidebar layout, dashboard summary 
   cards, orders/repairs/rentals/enquiries lists and detail pages, forms 
   (addresses, profile, settings).
3. ADMIN (app/admin/): the grouped sidebar nav, dashboard stat cards, data 
   tables (products/orders/inventory/repairs/rentals/customers/reviews), detail 
   pages with their status-control panels, and every form.

SPECIFIC THINGS TO FIX
- Data tables throughout admin currently use bare <table> with minimal styling — 
  give them proper zebra striping, hover states, sticky headers where long, and 
  responsive horizontal scroll treatment that doesn't look broken on mobile.
- Status badges (components/ui/badge.tsx) are used everywhere (order status, 
  repair status, rental status, review status) — make sure the variant colors 
  are visually distinct and legible at a glance across a long list.
- Forms (checkout, repair booking, rental booking, admin product/discount forms) 
  are plain stacked inputs — improve label/input rhythm, add clear required-field 
  conventions, and make multi-column layouts (e.g. checkout, product form) 
  responsive and well-aligned.
- The product card and product gallery are the most important commerce surfaces — 
  give them the most polish: proper aspect-ratio handling, hover treatment, price/
  sale-price hierarchy, stock badge placement.
- Buttons (components/ui/button.tsx) — review variant/size combinations for 
  visual consistency; make sure isLoading and disabled states look intentional, 
  not just faded.

CONSTRAINTS
- MWK currency formatting must not change.
- Do not add new npm dependencies for icons/animation unless you check package.json 
  first and confirm nothing already covers it — prefer inline SVG or Tailwind-only 
  solutions to keep the bundle lean.
- Do not touch anything in supabase/migrations/, lib/services/, lib/data/, or any 
  Server Action file's exported function signatures.
- Preserve all existing accessibility attributes (aria-label, focus-visible, 
  semantic HTML) — improve on them, never remove them.
- This is a Malawi-based local business — keep the tone professional and 
  trustworthy, not flashy or "startup." No stock photography, no fabricated 
  imagery — the codebase already has honest empty states for missing product/
  site images; keep that pattern, just make the empty state itself look better.

Work through this file by file, starting with tailwind.config.ts and 
components/ui/ (the shared primitives), then the storefront, then account, 
then admin — since later surfaces inherit from the primitives you improve first.
```

A few notes on using this:

- Feed it the actual repo (open the workspace in VS Code) so Copilot can see the real file contents rather than guessing — it'll do a much better job with the real `tailwind.config.ts` and `components/ui/*` in context.
- Consider running it in stages (primitives → storefront → account → admin) rather than one giant pass, since that matches how the prompt is sequenced and gives you checkpoints to review/revert.
- Worth committing to git before running this, so a bad styling pass is a one-command revert, not a headache.