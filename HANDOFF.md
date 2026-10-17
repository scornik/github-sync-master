# Little Petal — Handoff for the next agent

Original brief: luxury baby fashion e-commerce for a Bangladesh brand ("Little Petal", configurable in `src/lib/brand.ts`). Full phased plan: `.lovable/plan/little-petal-baby-fashion-store-staged-build-2026-10-17.md`.

## Stack
TanStack Start v1 + React 19 + Tailwind v4 (tokens in `src/styles.css`: ivory/blush/sage/butter/lavender/charcoal, Cormorant Garamond + DM Sans). shadcn UI in `src/components/ui`.

## Current state (works in preview, typecheck clean)
- `/` home (simple editorial sections — cinematic version still TODO)
- `/shop` filters (category, gender, size, colour, fabric, occasion, price, stock, sale, wishlist, search, sort)
- `/product/$slug` gallery, colour/size picker (sold-out sizes disabled), low-stock note, size guide, related items, sticky mobile buy bar
- `/cart` bag with qty edit, free-delivery progress
- `/checkout` BD districts, phone validation, coupons, COD + bKash/Nagad/card (labelled demo simulations)
- `/order/$id` confirmation + 7-step tracking timeline
- Header/footer/Toaster/StoreProvider mounted in `src/routes/__root.tsx`

## Important: no database yet
The original project used a backend that is NOT connected here. Currently:
- Products: static `src/lib/demo-products.json` (12 products × 2 colours × 8 sizes), served via `src/lib/products.ts` (`productsQuery`). Original SQL schema + seed: see `drizzle/` in the original GitHub zip (`products`, `product_variants`, `wishlist`, roles).
- Cart, wishlist, orders: browser localStorage (`lp-cart`, `lp-wish`, `lp-orders`) in `src/lib/store.tsx` and `checkout.tsx`.
- Sign-in: header user icon links to `/` (no auth page yet).

## Business rules (demo values — confirm with owner)
`src/lib/checkout.ts`: inside Dhaka ৳70, outside ৳130, free from ৳5,000; coupons PETAL10 (10%), EID500 (৳500, min ৳3,000). Tests: `src/lib/checkout.test.ts` (`bunx vitest run`).

## Session log (2026-10-17, 07:00 UTC)
- Code imported into a fresh Lovable project (blank TanStack template) from this repo via the GitHub connector (tarball). Copied `src/` (excluding `src/integrations/supabase` and `src/start.ts`, which reference a backend not connected), AGENTS.md, plan, drizzle schema. `.env` and `supabase/config.toml` NOT copied.
- Template `package.json` kept (no supabase-js/drizzle deps). Tests pass (7/7).
- Nothing from "Next steps" started yet — begin at step 1 (Enable Lovable Cloud). After enabling, the generated `src/integrations/supabase/*` + `attachSupabaseAuth` in `src/start.ts` will be recreated.
- Paused due to credit limit.

## Next steps (in order)
1. Enable Lovable Cloud; recreate tables (products, product_variants, orders, order_items, order_status_history, coupons, user_roles, wishlist) with RLS; seed from demo-products.json; switch `productsQuery` to the DB.
2. Auth page `/auth` + admin role (user_roles table + has_role function); point header icon to it.
3. Server-side order placement (createServerFn): re-validate prices/coupons, atomic stock decrement (Postgres function with row locks), order number, status history. Replace localStorage orders; public tracking by order id + phone.
4. Admin dashboard under `_authenticated/admin`: overview, products, inventory adjustments/low stock, order status lifecycle + courier (Pathao/Steadfast/RedX simulated), customers, coupons.
5. Cinematic homepage (GSAP ScrollTrigger 2.5D hero, reduced-motion support), sections per plan Phase 4, footer credit "Demo crafted by Hakeemify".
6. Polish: mobile, a11y, per-page SEO, more tests.
