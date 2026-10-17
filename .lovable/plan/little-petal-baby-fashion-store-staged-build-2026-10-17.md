# Little Petal — Baby Fashion Store (staged build)

The brief is very large, so it will be built in the 5 phases it defines. Each phase ends in a working, viewable state.

## Phase 1 — Foundation (this turn after approval)
- Design system: ivory / blush / sage / butter / lavender / charcoal / taupe palette, Cormorant Garamond headings, DM Sans body, fluid type.
- Configurable brand settings (name, tagline, contact).
- Announcement bar, sticky header with mega-menu (category images), mobile drawer, search, bag and wishlist badges.
- Lovable Cloud: products, variants (color x size with own stock), categories, customers, roles (admin), wishlist.
- ~24 demo products with generated photography, prices in BDT.
- Shop / category pages with all filters (category, gender, age, size, color, price, fabric, occasion, stock), sorting, chips, counts, load more.
- Sign up / sign in, admin role.

## Phase 2 — Shopping
- Product page: gallery with zoom, variant picker blocking out-of-stock, size guide, care/fabric, related + recently viewed, sticky mobile buy bar.
- Cart drawer + cart page, coupons.
- Bangladesh checkout: districts, inside/outside Dhaka delivery fee, Cash on Delivery, bKash/Nagad/card shown as clearly labeled simulations.

## Phase 3 — Orders and admin
- Server-side order placement: price + coupon re-validation, atomic stock reservation (no overselling), order number, price snapshots, status history.
- Confirmation page and public order tracking with 8-step timeline; demo couriers (Pathao, Steadfast, RedX — simulated).
- Admin dashboard: overview stats, products, inventory adjustments + low stock, orders lifecycle, shipments, customers, coupons, reports.

## Phase 4 — Cinematic homepage
- 2.5D scroll hero (layered dress imagery, GSAP ScrollTrigger, 4 scenes, pointer parallax, reduced-motion support).
- Sections A–J: moments, new arrivals, editorial, bestsellers, shop by age, occasionwear parallax, complete the look, why us, stories (labeled demo), newsletter + footer with "Demo crafted by Hakeemify".

## Phase 5 — Polish
- Mobile, accessibility, SEO per page, tests for pricing / stock / delivery rules, end-to-end demo run.

## Technical notes
- TanStack Start routes per page; server functions for all order/stock logic; Postgres function with row locks for reservation.
- Payment gateways and couriers are simulated and labeled — real ones need credentials later.
