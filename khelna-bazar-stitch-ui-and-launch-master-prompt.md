# KHELNA BAZAR: BUILD THE STITCH UI EXACTLY, AND MAKE THE SITE REAL (NO DEMO, READY TO PUBLISH)

> **How to use:** put the Stitch export in the repo at `design-reference/stitch/` (the folder `stitch_sensory_ui_experience_dashboard/` exactly as exported), keep this file in the repo root, and give Antigravity this single task: *"Read `khelna-bazar-stitch-ui-and-launch-master-prompt.md` completely and follow it exactly."* `design-reference/` is for reading only: exclude it from the production build and from deployment.

---

# PART 0: MISSION

You are a senior front-end engineer, design-systems lead, QA engineer and security reviewer, working autonomously in this repository: **Khelna Bazar** (খেলনা বাজার, `khelnabazar.com.bd`), a Bangladesh toy marketplace. Stack: Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, Prisma/PostgreSQL, Auth.js (`next-auth` v5 beta), Zustand, Zod.

**Two goals, both mandatory:**

1. **The whole website, storefront and admin, must look and feel exactly like the Google Stitch designs** in `design-reference/stitch/`: same layout, spacing, colors, radii, shadows, typography, icons, components, states, hover effects and animations. Not "inspired by". The same.
2. **The website must be real and publishable as soon as possible.** No demo accounts, no demo passwords, no fake data, no fake claims, no placeholder contact or payment details, no development backdoors. The Stitch files contain demo content; that content is a **visual reference only** and must be replaced by real data or honest empty states.

**Order of work:** security and "no demo" launch blockers first (Part 3, short and strict), then the UI port (Parts 4 to 9), then verification (Part 10). Do not skip ahead: a beautiful site with a login backdoor must never ship.

## Operating rules
- **Work autonomously and do not stop to ask.** Make the safest reasonable choice, record it in `docs/ASSUMPTIONS.md`, and continue. Genuinely missing owner information goes in `docs/OWNER_INPUTS_NEEDED.md` (Part 12) and the related UI is hidden until it exists.
- **Plan first.** Produce an Implementation Plan artifact and a Task List artifact before changing code. Keep `docs/PROGRESS.md` updated after every phase so the work survives interruptions.
- **Evidence for everything:** screenshots, test output, grep results. No "should work".
- **Branch and commit.** Work on `stitch-ui-launch`, commit per slice with clear messages. Never commit secrets.
- **Never test against production data.** Use a local/throwaway Postgres and console-mode notification providers.
- Keep the stack. Add a dependency only with a written reason and size note.
- **Never invent real-world facts** (phone numbers, addresses, licenses, certifications, merchant wallets, courier partners, delivery promises, statistics). Read from Settings/environment, hide when empty.

---

# PART 1: WHAT THE STITCH EXPORT CONTAINS (verified by reading the zip)

Folder `stitch_sensory_ui_experience_dashboard/` contains 16 screens (`code.html`, most with `screen.png`), 3 `DESIGN.md` files, and 2 logo images (`whatsapp_image_..._1/screen.png` and `..._2/screen.png`, the real Khelna Bazar logo: a red circle reading "Khelnabazar.com.bd" with an amber hand holding a spinning top, *latim*).

## 1.1 Which design system is FINAL
| Design system | Role | Use it? |
| --- | --- | --- |
| `joyful_toy_bazaar/DESIGN.md` | **LIGHT theme.** Brand red `#D71921`, amber gold `#FDB813`, joy blue `#1E5BFF`, warm cream surfaces (`#FFFBF9`, `#FFF8F6`), Plus Jakarta Sans, pill shapes, warm red-amber shadows. Matches the logo. | **YES, final light theme** |
| `nocturnal_toy_emporium/DESIGN.md` | **DARK theme.** Midnight slate `#0d1320` with glassmorphism, crimson `#ff4d58`, amber `#fdb813`, mint `#10b981`, text `#f8fafc`. | **YES, final dark theme** |
| `toy_wonderland_marketplace/DESIGN.md` | Early blue-primary (`#1E5BFF`) iteration. | **NO. Obsolete. Do not use.** |

**Important discrepancies to resolve (code wins):**
- In `joyful_toy_bazaar/DESIGN.md` front-matter, `primary` is `#ae0012` and `primary-container` is `#d71921`, but **every `code.html` and the written brand text use `primary = #D71921`** (the button red) and `primary-container = #AE0012`. Use the `code.html` values. (White text on `#D71921` is about 5.2:1, which passes WCAG AA.)
- Screenshots (`screen.png`) are **downscaled previews** (height capped at 1600 px, so widths vary and some headings render with a fallback serif font). **Do not pixel-diff against the PNGs.** Treat each `code.html` as the ground truth: render it yourself at 1440 px and 390 px with Playwright to produce reference images, and use the actual fonts named in its Tailwind config (**Plus Jakarta Sans** for headings/labels, **Inter** for body).
- Dark-mode headings in `nocturnal_toy_emporium` name **Outfit**. Check the dark `code.html` screens: if they load Outfit, keep it for dark headings only if it looks identical to the screen; otherwise use Plus Jakarta Sans in both themes for one consistent font system. Record the decision.

## 1.2 Which screens are final, and which are obsolete
| Stitch screen folder | Theme | Status | Maps to |
| --- | --- | --- | --- |
| `khelna_bazar_wonder_toy_storefront_home` | light | **FINAL** | `/` home |
| `khelna_bazar_interactive_toy_catalog_filters` | light | **FINAL** (no PNG; render from `code.html`) | `/c/[...slug]`, `/search`, `/deals`, `/new-arrivals` |
| `khelna_bazar_product_detail_page_safety_panel_cosmic_bot_3000` | light | **FINAL** | `/p/[slug]` |
| `khelna_bazar_slide_out_mini_cart_drawer_free_shipping_meter` | dark | **FINAL** (dark design; derive the light version from the same tokens) | mini-cart drawer |
| `khelna_bazar_one_page_3_step_express_checkout` | light | **FINAL** | `/checkout` |
| `khelna_bazar_order_success_celebration_confetti` | light | **FINAL** | order success (`/order/[id]` after placing) |
| `khelna_bazar_live_order_tracking_timeline_kb_89210_dh` | dark | **FINAL** | `/track-order`, `/order/[id]` |
| `khelna_bazar_parent_account_rewards_dashboard_brand_red_synced` | light | **FINAL** | `/account`, `/account/rewards`, `/account/orders` |
| `khelna_bazar_wishlist_toy_comparison_tray` | dark | **FINAL** | `/wishlist` + compare tray |
| `khelna_bazar_interactive_wishlist_toy_comparison_matrix_deluxe` | dark | **FINAL** | `/compare` |
| `khelna_bazar_magical_4_step_gift_finder_quiz_ultra_luxurious_edition` | dark | **FINAL** (latest of 3 iterations) | `/gift-finder` |
| `khelna_bazar_magical_4_step_gift_finder_quiz_enhanced` and `khelna_bazar_4_step_magical_gift_finder_quiz` | light | Earlier iterations: use only as the **light-theme** version of the gift finder, matching the ultra-luxurious layout | `/gift-finder` (light) |
| `khelna_bazar_customer_support_help_center` | dark | **FINAL** (new page) | new `/help` |
| `khelna_bazar_toy_store_admin_management_console_2` | light (red) | **FINAL admin look** | `/admin` dashboard |
| `khelna_bazar_toy_store_admin_management_console_1` | light (blue) | **OBSOLETE** (blue primary). Use only for layout cross-checks | none |

Where a final screen exists in only one theme, **create the other theme yourself with the other design system's tokens, keeping the identical layout** (light from `joyful_toy_bazaar`, dark from `nocturnal_toy_emporium`).

## 1.3 Known mistakes inside the Stitch screens (do NOT copy these)
1. **The admin screens are wrapped in the storefront header, announcement bar, footer and newsletter.** The real admin must have its **own shell** (sidebar + top bar only), with no storefront chrome. Copy the admin *content area* design (KPI cards, charts, queue, table, "needs attention" banner, sidebar styling), not the storefront wrapper.
2. **USD appears in every screen** (e.g. `$38.99`, `$184,920.00`, "orders over $45", "Global Storefront US/INTL ($ USD)"). The site is **BDT only: `৳`**, formatted with `Intl.NumberFormat('en-BD')`.
3. **Fake or unverifiable claims and content:** "ASTM F963 & CE Certified", "100% Non-Toxic & Safety Certified", "Choking Hazard Audited", "14,000+ Verified Delighted Parents", "4.9 Average Store Rating", "Verified Parent Buyer" testimonials with names, the sample reviews and Q&A, fake order queue customers (Elena Restova, Arthur Pendelton in Austin, Dr. S. Al-Hassan in London), "Wonder Club Gold", "Live Deal Sprint" timers, "Use code WONDER10", "15% off your first order", fake SKUs and sales numbers, "Parent CSAT 98.7%".
4. **International shipping/payment fiction** (FedEx, Royal Mail, Apple Pay, Visa, UK/Texas addresses). The shop delivers within Bangladesh; payments are Cash on Delivery plus bKash/Nagad if the owner enables them.
5. **Broken/placeholder images** (a missing logo shows alt text in one screen; product photos are AI/stock images). Use the owner's real logo and uploaded product images; show a branded placeholder when an image is missing.
6. **Runtime dependencies that must not ship:** Tailwind CDN script, Google Fonts `<link>` tags, Material Symbols from Google's CDN, remote images. Re-implement with the project's build (Tailwind 4 `@theme`, `next/font` self-hosted fonts, self-hosted/subset icons, `next/image`).
7. Stitch is English-only; the real site **must keep English + Bangla** with the same design (Hind Siliguri for Bangla, no clipping).

---

# PART 2: REPOSITORY REALITY CHECK (verified by reading the latest source zip)

The latest source zip is **not** the hardened version from the previous round: it has lost middleware, the Auth.js API route, the seed split, special pages and ESLint, and it still contains a demo backdoor. **First check git history/branches for the earlier hardened state** (search commits for `middleware`, `seed-essential`, `launch-guard`, `error.tsx`, `src/app/api/auth`); if it exists, use it as the base and cherry-pick. Otherwise re-implement everything in Part 3.

| ID | Sev | Finding | Where |
| --- | --- | --- | --- |
| L-01 | **P0** | **Hardcoded demo login accepted as ADMIN.** `authorize()` returns an ADMIN session for `admin@khelnabazar.com` / `Admin@Khelna123` (and a CUSTOMER for `customer@khelnabazar.com` / `Customer@Khelna123`). The `catch` branch has **no production check**, so when the database errors in production, anyone using that known password becomes admin. | `src/lib/auth.ts` (~lines 50 to 120) |
| L-02 | **P0** | **Fallback `AUTH_SECRET`** is a literal string in source; if the env var is missing, sessions can be forged. | `src/lib/auth.ts:22` |
| L-03 | **P0** | **Demo credentials are published** in the login page UI, `README.md`, `ADMIN_GUIDE.md`, `BEGINNER_GUIDE.md`, `DATABASE_GUIDE.md` and `prisma/seed.ts` (which also creates demo users/orders). | those files |
| L-04 | **P0** | **No route protection:** no `middleware`/`proxy`, no `src/app/api/auth/[...nextauth]` route. `/admin/*` and `/account/*` are not protected server-side. `auth-store.ts` (Zustand persist) still exists; confirm it is not used for login/roles, and remove it. | `src/` |
| L-05 | **P0** | **Fake payment wallet shown to customers:** checkout tells shoppers to "Send payment to our merchant wallet: 01700-000…". Customers could send money to a fake number. Payment instructions must come from Settings and the method must be hidden/disabled until the owner sets real details. | `src/app/checkout/page.tsx` (~line 813) |
| L-06 | P1 | **Placeholder contact data:** `+880 1700-000000` in `site.ts`, `wa.me/8801700000000` in `account-nav.tsx`, `+880 1711-000001` etc. | `src/config/site.ts`, `account-nav.tsx`, `auth.ts` |
| L-07 | P1 | **No rate limiting / lockout / bot protection** on login, register, reset, track-order, coupons, checkout. | `src/**` |
| L-08 | P1 | **Missing production files:** `loading.tsx`, `error.tsx`, `not-found.tsx`, `sitemap`, `robots`, `manifest`; no `next/font` (fonts never load); no ESLint config (`npm run lint` is `next lint` with no config); no Playwright. | `src/app/**`, root |
| L-09 | P1 | **Design debt:** about 415 hardcoded `[#hex]`, 427 `white/slate/gray`, 308 `dark:` classes. | `src/**` |
| L-10 | P2 | **Repo hygiene:** duplicate logo files restored (`logo.png`, `logo-animated.gif/mp4` alongside `khelna-bazar-logo.*`), internal guides in root (`BEGINNER_GUIDE.md`, `GITHUB_GUIDE.md`, `PROJECT_PROGRESS.md`, `DECISIONS.md` mention "PlayNest"), `/dev/ui` route reachable. | repo root, `public/images` |

---

# PART 3: PHASE A: LAUNCH BLOCKERS FIRST (security and "no demo")

Complete and verify **all** of this before the UI port. Keep it tight; do not over-engineer.

**A1. Remove every demo credential and backdoor**
- Delete the hardcoded accounts from `authorize()` (both branches, including the `catch`). On any DB error, `authorize()` must return `null` (log the error), never a session.
- Delete `src/lib/auth-store.ts` (client auth) if still present; sessions come only from Auth.js. Remove "Seeded Demo Credentials"/demo boxes from the login and register pages.
- **Delete `prisma/seed.ts`.** Provide `prisma/seed-essential.ts` (settings defaults, policy page shells, optional starter categories; no users, no orders, no reviews, no ratings) and a development-only `prisma/seed-sample.ts` that refuses to run when `NODE_ENV=production`. No script may wipe data in production.
- Create `scripts/create-admin.ts` (`npm run admin:create`): takes `ADMIN_EMAIL`/`ADMIN_PHONE` from env or prompt, generates a strong one-time password printed once, sets `mustChangePassword`, hashes with bcrypt. No default admin exists.
- Remove credentials from `README.md`, `ADMIN_GUIDE.md`, `BEGINNER_GUIDE.md`, `DATABASE_GUIDE.md`, `DECISIONS.md` and everywhere else; delete or archive internal guides not meant for the public repo. Run the searches in Part 9 and report the output.

**A2. Secrets**
- Require `AUTH_SECRET` (≥ 32 chars) and `ORDER_TOKEN_SECRET`; **throw at startup in production** if missing. No literal fallback anywhere. Add a `launch-guard` that also fails the production build/start when placeholder phone/email/address, demo flags, localhost `NEXT_PUBLIC_SITE_URL`, or a missing admin user are detected.

**A3. Authentication and authorization**
- Auth.js Credentials provider with Prisma + bcrypt (cost 12): login with **BD phone or email** (normalize `+8801…`/`8801…` to `01…`, valid `^01[3-9]\d{8}$`), generic failure message, blocked-account message that actually reaches the user, JWT/session with `id` and `role`, httpOnly/Secure/SameSite cookies, **role re-checked from the database** on sensitive requests (so a demoted/blocked user loses access).
- Add `src/app/api/auth/[...nextauth]/route.ts`.
- **Registration creates a real user** (server-side Zod validation, duplicate phone/email rejected, `CUSTOMER` role only, role from request body ignored).
- **Route protection in two layers:** (1) `middleware.ts` or `proxy.ts` (check which convention this Next 16 version uses and test it in a production build) for `/admin/*` and `/account/*`; (2) a server-side role check inside **every** admin Server Action and data query. ADMIN everything; STAFF no settings/staff/financial reports. Redirect unauthenticated users to `/login?next=<path>` with a validated same-site path.
- Forgot/reset password (single-use, expiring token; token never exposed to the browser; notification through a provider abstraction with a console logger in development only).
- Rate limit and lock out login, register, reset, track-order, coupon apply, newsletter and order placement (Upstash if configured, otherwise a database-backed limiter). Add a CAPTCHA (e.g. Cloudflare Turnstile) on register and guest checkout.

**A4. Orders and money**
- One server-side `placeOrder` path: re-load prices and stock from the database (ignore client prices), validate coupon and shipping from Settings, run in **one transaction** (create order, decrement stock, write stock movement, increment coupon use, log an event), idempotency key against double submit, server-generated order number, **never a fake success when the write fails**. Order links use a secret HMAC token; `/track-order` requires order number **and** phone.
- **Payments:** COD works by default. bKash/Nagad are individually toggleable in Settings and **hidden until the owner enters real merchant details**; show only owner-provided numbers and instructions; record sender number + TrxID as "awaiting verification" with an admin verify/reject action.

**A5. Placeholder and fake business data**
- Replace every placeholder (`+880 1700-000000`, `01700000`, `wa.me/8801700000000`, fake addresses, fake emails) with values from Settings; hide any empty field (no empty "Hotline:" label). Trust claims (certifications, "Safety Certified", "ASTM", "100% Non-Toxic", "authentic", delivery promises) appear **only if the owner enables them in Settings** or if the product record contains the data.

**A6. Production hygiene**
- Add `loading.tsx`, `error.tsx`, `not-found.tsx`, `sitemap.ts`, `robots.ts` (disallow `/admin`, `/account`, `/cart`, `/checkout`, `/api`), `manifest.ts`. Make `/dev/ui` unreachable in production. Add a working ESLint config. Security headers (CSP, HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `frame-ancestors`; drop `X-XSS-Protection`). Keep `design-reference/` out of the build. Add Playwright and write e2e tests that prove: customers cannot open `/admin`, the old demo credentials are rejected, an order placed by a guest appears in admin.

**Gate A:** build, type-check, lint and unit tests pass; the Part 9 searches return no hits; e2e auth tests pass. Only then continue.

---

# PART 4: PHASE B: DESIGN TOKENS (port Stitch exactly)

1. **Extract the Tailwind config** from the final `code.html` files (the `tailwind.config = {...}` block holds the full color map, font families, `borderRadius`, spacing and shadows). Convert it to **Tailwind 4 `@theme`** in `src/styles/globals.css` using the Stitch token names (`surface`, `surface-container-low/…/highest`, `on-surface`, `on-surface-variant`, `outline`, `outline-variant`, `primary`, `on-primary`, `primary-container`, `secondary-container`, `tertiary`, `error`, etc.) so the Stitch markup maps almost 1:1.
2. **Light theme** from `joyful_toy_bazaar` (values from `code.html`: `primary #D71921`, `primary-container #AE0012`, `secondary-container #FCB812/#FDB813`, `tertiary` blue `#1E5BFF`, `background #FFF8F6`/`#FFFBF9`, `on-surface #221A18`/`#271E1C`). **Dark theme** from `nocturnal_toy_emporium` (`surface #0D1320`, `primary-container #FF525C/#FF4D58`, `secondary #FFD07C`, mint `#4EDEA3/#10B981`, text `#F8FAFC`/`#DDE2F5`).
3. **Keep theme switching exactly as today but token-driven:** class-based `.dark`, System/Light/Dark toggle, pre-paint script, live OS listener, no flash. Remove the legacy aliases and every hardcoded `[#hex]`, `white/slate/gray` and redundant `dark:` class (target: zero outside token definitions).
4. **Typography:** `next/font` (self-hosted, `display: swap`) for **Plus Jakarta Sans** and **Inter** with the Stitch type scale (`headline-xl/lg/md/sm`, `body-lg/md/sm`, `label-lg/md/sm`, mobile variants), plus **Hind Siliguri** for Bangla. Tabular numerals for prices.
5. **Radii, spacing, shadows, motion** exactly as in the Stitch CSS and `DESIGN.md`: pill buttons (`9999px`), cards `24 to 32px`, 12-column grid (max width 1280 px, gutter 20 px, mobile 4 columns/16 px margin), the warm red/amber shadow stack (resting, hover with `translateY(-3px)`, drawer/modal with 8 px blur backdrop) and the dark-mode glass surfaces (`rgba(26,34,52,.75)` with `blur(16px) saturate(180%)`, 1 px `rgba(255,255,255,.08)` borders, glow shadows).
6. **Icons:** the designs use **Material Symbols Outlined** (about 90 per screen). To match exactly, use Material Symbols but **self-host a subset** (only the icons used, via font subsetting or by converting them to inline SVG components); do **not** load the full icon font or the Google CDN. Remove `lucide-react` usage where it creates a visible mismatch, or map each icon one to one. Document the icon list.
7. **Contrast:** verify and, only where necessary, adjust minimally (keep the look): white on `#D71921` passes; **dark-mode crimson `#FF4D58/#FF525C` with white text is about 3.2:1 and fails**, so use the dark ink token on-primary-container (`#5B000E`) or a slightly deeper crimson for filled dark-mode buttons; check amber buttons with `#271E1C` text, pale pills, muted text and every gradient. Fix the old "invisible hero text / empty button" class of bug permanently.

---

# PART 5: PHASE C: COMPONENT LIBRARY (build from the Stitch markup)

Build `src/components/ui/*` as accessible, token-based components that reproduce the Stitch components exactly (read their HTML for structure and classes): Button (primary red pill, amber accent "pop", secondary outlined, ghost, icon, loading), Pill chip/filter chip, Badge/sticker pills (amber discount, blue "Ages 3+", red "Hot seller"), Input/search pill with red search button and blue focus ring, rounded checkbox/radio, Quantity stepper (circular +/−), Price (৳, strike-through, discount), Rating (amber stars), Progress bars (stock, free-delivery meter), Countdown (flip digits), Tabs, Accordion, Dialog, Drawer/Sheet (right drawer, bottom sheet), Dropdown, Tooltip, Toast, Skeleton set, EmptyState, Timeline/Stepper, Table, KPI card with sparkline, Status pill, Avatar, Toy product card (all states), Category tile, Age tile. Document every variant, in both themes, on the non-production `/dev/ui` page. Use headless accessible primitives (e.g. Radix) or correct hand-built ARIA; focus trap, Escape, focus return, `aria-live`, 44 px tap targets.

---

# PART 6: PHASE D: STOREFRONT PAGES (match each Stitch screen)

For each screen: read its `code.html` (structure, classes, inline script behavior), render it as the reference, rebuild with real components and real data, then screenshot and compare (Part 10). Use real data from the database, **skeleton, empty and error states** where Stitch shows none, light **and** dark, English **and** Bangla, mobile (390) **and** desktop (1440).

- **Header/chrome (all storefront pages):** top announcement bar (text from Settings, hidden if empty), logo + pill search with category dropdown and instant suggestions, wishlist, cart pill with count and total, account avatar; category/age chip row; sticky behavior and mobile bottom navigation exactly as in the designs. **Logo:** use the owner's real logo (`whatsapp_image_..._1/screen.png`, red circle with spinning top). It is a low-resolution JPEG with a white background, so **ask for the original vector/PNG** in `OWNER_INPUTS_NEEDED.md`; until then, clean it up (transparent background, 96/192/512 px WebP/PNG, dark-mode safe) and use that. Header shows the compact circular mark plus "Khelna Bazar" wordmark in Plus Jakarta Sans as in the designs. **No duplicate or GIF/MP4 logos in the header.**
- **Home:** hero ("Childhood Wonders Come Alive"-style layout, CTA buttons, trust avatars only if real), "Shop Delights by Age" tiles (0-12m, 1-2y, 3-4y, 5-7y, 8-11y, 12+ with the correct filter links), **Flash deal band with real countdown from a real `FlashDeal` and stock bars (hidden when no active deal)**, curated category tiles from real categories, **birthday gift-finder gradient banner** (links to `/gift-finder`), product rails with tabs (Best sellers / New arrivals / Top rated, real data, hidden if empty), safety-standard strip (**only owner-enabled claims**), "Community stories" section (**only real moderated reviews; hide the section if none**), newsletter band (stores subscribers; discount text only if a real coupon exists), value strip, footer with real contact details.
- **Listing/search/deals/new arrivals:** filters (category tree, age, price slider, brand, rating, in-stock, discount), chips, sort, grid/list, bottom-sheet filters on mobile, URL-synced state, skeletons, empty and error states, instant search suggestions via `/api/search`.
- **Product card:** exactly as designed (image well, sticker badges, rating only with real reviews, red circular "+" quick add, wishlist heart animation, add-to-cart morph to stepper, hover lift).
- **Product page:** gallery with thumbnails/zoom, price block (৳, struck old price, discount %), variant chips, quantity, district delivery estimator (from Settings), COD/returns rows (owner-enabled), **age and safety panel built from real product fields** (age range, materials, choking-hazard warning when the product has small parts; certification badges only if entered), tabs, "frequently bought together" (real products), **reviews with distribution bars and Q&A only from real data** (honest "No reviews yet" state), related products, sticky mobile buy bar.
- **Mini-cart drawer:** the dark design plus its light twin: steppers capped at stock, undo remove, **free-delivery meter driven by the Settings threshold with celebration at unlock**, coupon field (real coupons only), upsell strip, sticky checkout button.
- **Checkout:** the one-page 3-step express checkout design: Bangladesh phone validation `^01[3-9]\d{8}$`, division > district > area, saved addresses, Inside/Outside Dhaka/Express zone cards with live fees, payment cards (COD default; bKash/Nagad only if enabled), gift wrap/note, collapsible summary with always-visible total, sticky Place Order with loading and double-submit protection, inline errors.
- **Order success:** animated check and confetti, order number with copy button, real expected delivery, items, track/continue buttons (no fake loyalty rewards unless the points system really grants them).
- **Tracking:** lookup (order number + phone) and the animated dark timeline (Placed, Confirmed, Packed, Shipped, Delivered, plus Cancelled/Returned) with courier and tracking number from the order.
- **Account:** the red-synced dashboard: profile header, points ring/tier from real `LoyaltyTransaction` data, recent orders, orders list/detail, addresses (add/edit/delete/default), rewards, profile/settings (change password, delete account). **Hide any section that has no real data source**, rather than showing sample numbers.
- **Wishlist and compare:** the dark wishlist tray and the comparison matrix (up to 4 products, highlight-differences toggle, sticky label column on mobile).
- **Gift finder:** the 4-step quiz (recipient, age, interest, budget in ৳) with real scoring against real products (dark ultra-luxurious design plus light twin).
- **Help center `/help`:** the support design: searchable FAQ, topics, contact options, **only with real contact channels from Settings**; FAQ content written from the real policies; no fake "live chat" or agent names.

---

# PART 7: PHASE E: ADMIN DASHBOARD (match `admin_console_2`)

- **Own shell, no storefront chrome:** locked viewport (`h-dvh`), fixed sidebar (grouped: Dashboard Overview, Orders & Fulfillment with live badge, Catalog & Variants, Age & Categories, Customers, Flash Deals & Promo, Reviews & Q&A, Revenue Analytics, System Settings, Safety/Certifications only if the owner uses it), top bar with command palette (Cmd/Ctrl+K), search, notifications, theme toggle, user menu; only the main pane scrolls; collapsible rail on small screens with mobile drawer.
- **Dashboard (design as in the screenshot):** greeting/title with live-sync indicator and date picker; four KPI cards with sparklines and trend chips (**real**: revenue ৳, orders to pack, average order value, and a fourth real metric such as new customers; **drop "Parent CSAT" unless real review data exists**); red "Needs attention" banner (real: low stock, unconfirmed orders, unverified payments, pending returns/reviews, expiring coupons, each with an action); weekly revenue area chart vs previous period; fulfillment donut; **Active Orders Queue with real orders**, filter chips, and a one-click status action that obeys the legal status machine; top-selling products table with stock countdown and real margin only if cost data exists; "Open fulfillment Kanban board" link to a working board (drag and drop with valid transitions).
- **Pages without a Stitch design must follow the same visual language** (same cards, tables, pills, buttons): Orders (list + Kanban + detail with timeline, invoice/packing-slip print, courier/tracking), Products (list, editor with image upload/reorder, variants, SEO), Inventory (stock bars, adjustments with reason), Coupons, Settings (store info, delivery zones/rates, payment methods and merchant details, social, SEO, maintenance mode), and, if absent, Categories, Customers, Banners/Flash deals, Reviews moderation, Returns, Reports, Staff (ADMIN only), Audit log. Tables: sticky header, sortable, filters, pagination, bulk toolbar, CSV export, mobile card layout.
- **A brand-new store must look good:** every widget has a designed empty state and an onboarding checklist ("Add store details, add categories, add your first product, set delivery rates, enable payments, publish policies"). No sample numbers anywhere in production.
- Charts are lazy-loaded (Recharts) and themed with the tokens; accessible text alternatives.

---

# PART 8: PHASE F: INTERACTIONS AND MOTION (as designed)

Read the inline scripts and classes in each `code.html` (home has about 12 handlers, product page about 24, success page and admin a few) and the `animate-*`/`transition` classes, then reimplement the behavior in React: tabs and accordions, wishlist heart toggle, quantity steppers, variant selection, gallery switching, countdowns, filter chips, quiz steps, confetti on success, pulse/bounce accents, mini-cart open/close, tracker progression. Write `docs/INTERACTION_MAP.md` (screen, element, behavior, status).

Motion rules: only `transform`/`opacity`; reveal-on-scroll with stagger; card lift on hover; button press feedback; fly-to-cart; flip countdown; success confetti; tracking truck/progress; dashboard count-up. Provide `useMotionTier()` (full / reduced / none) driven by `prefers-reduced-motion`, data-saver, slow connection and low-end device hints; heavy effects lazy-load and pause when off-screen.

---

# PART 9: DE-DEMO CHECKLIST (run, fix, report output)

After every phase and at the end, run these searches across `src/`, `prisma/`, `scripts/`, `public/`, docs and config; **each must return nothing** (except tests that assert rejection):
- Credentials: `admin123`, `staff123`, `customer123`, `Admin@Khelna`, `Staff@Khelna`, `Customer@Khelna`, `password123`, "Seeded Demo", "demo account", "quick login", `usr_admin_demo`, `usr_customer_demo`.
- Placeholders: `1700-000000`, `01700000`, `8801700000000`, `1711-000001`, `example.com`, "Elena Restova", "Tanzim Ahmed", "Arthur Pendelton", "Cosmic Bot", "Austin", "London, UK", "WONDER10", "Wonder Club Gold", "Live Deal Sprint".
- Currency: `$` before a digit, "USD", "US/INTL", "FedEx", "Royal Mail", "Apple Pay", "Visa" in UI copy.
- Fake claims: "14,000", "Verified Parent", "ASTM", "CE Certified", "Safety Certified", "Non-Toxic", "Choking Hazard Audited", "98.7", "4.9 Average", "Lab Audit" (allowed only when rendered from owner-enabled Settings or real product data).
- Remote assets: `cdn.tailwindcss.com`, `fonts.googleapis.com`, `lh3.googleusercontent.com`, `images.unsplash.com`, `cdn.jsdelivr` in runtime code.
- Dev leftovers: `console.log`, `TODO`, `FIXME`, "lorem", `/dev` links, `PlayNest`, committed zip files, `.env` files.
- Mock imports: nothing under `src/` may import `mock-data` or seed files at runtime.

---

# PART 10: VERIFICATION (prove it looks the same and works)

1. **Reference renders:** for every final Stitch screen, render `code.html` with Playwright at 390x844 and 1440x900 (network allowed for its CDN assets only in this reference step) and save to `design-reference/rendered/`. For dark-only or light-only screens, also render the theme twin you built from the tokens.
2. **Fidelity loop (per screen):** run the real page with realistic seeded test data at the same viewport, screenshot, and compare side by side with the reference: layout structure, spacing, colors, radii, shadows, fonts, icons, states, hover/focus, animation. Fix until visually near-identical; allowed differences are only real content, ৳ currency, Bangla text, and the safety fixes in Part 1.3. Record `docs/FIDELITY_REPORT.md` (screen, route, what matches, intentional differences with reason, screenshots).
3. **Automated checks (Playwright + axe) on every route, both themes, EN/BN, 320/390/768/1440 px:** zero console errors, hydration warnings or Next.js dev-overlay issues; no horizontal scroll; contrast scanner for text over gradients/images; no empty-looking buttons; no broken images; 44 px tap targets; axe with zero serious/critical issues.
4. **Functional e2e:** register on one browser and log in from a fresh one; log in with phone and with email; wrong/old-demo credentials rejected; customer blocked from `/admin`; guest and logged-in checkout (COD); double-click Place Order creates one order; stock decrements; order appears in admin and updates in tracking after a status change; coupon rules; search suggestions; filters in URL; wishlist and compare; gift finder; password reset; language and theme switching.
5. **Performance (production build, mobile profile, Slow 4G, 4x CPU):** Lighthouse Performance 90+ (home 85+ if documented), Accessibility 95+, Best Practices 95+, SEO 95+, LCP ≤ 2.5 s, CLS ≤ 0.05, INP ≤ 200 ms; no CDN dependencies; images optimized with `next/image`.
6. `npm run build`, `npx tsc --noEmit`, `npm run lint`, `npm test` and the Playwright suite all pass with zero errors.

---

# PART 11: PHASE I: PRODUCTION READINESS

- `.env.example` with a comment per variable (database, auth secret/URL, order token secret, SMS/email providers, payment gateway, image storage, CAPTCHA, rate-limit store, error tracking, site URL). Production fails fast on missing values.
- Image upload for products/banners to object storage (Cloudinary, Vercel Blob or S3): MIME/size validation, no SVG scripts, auto-resize, alt text.
- Error monitoring (e.g. Sentry), `/api/health` with a DB ping, structured logs without personal data, automated daily database backups and a documented restore.
- Legal/policy pages (Terms, Privacy, Returns/Refund, Shipping, Cancellation, About, Contact, FAQ) editable from admin, in English and Bangla, containing **only owner-provided business details** (shown only when filled in); cookie consent; account data export/deletion.
- Hosting note: a public store with real orders should not run on a non-commercial free plan; keep the app host-portable and document deployment. Maintenance-mode toggle in Settings.
- Rewrite `README.md`, `ADMIN_GUIDE.md`, `SECURITY.md`, `LAUNCH_CHECKLIST.md`, `DESIGN_SYSTEM.md` with **no credentials**.

---

# PART 12: OWNER INPUTS (the agent must not guess these; put them in `docs/OWNER_INPUTS_NEEDED.md` and hide the related UI until provided)

Real hotline and WhatsApp number; support email; business address; trade licence/TIN/BIN (if any); original vector or high-resolution transparent logo; bKash/Nagad merchant numbers and instructions (or gateway credentials); courier choice; SMS and email provider accounts; domain and DNS access; free-delivery threshold and zone fees; return window; which safety/certification claims are truthful and provable; social media URLs; policy text approval; real product catalogue and photos (the starter catalogue must be replaced). Also ask the owner to confirm Bangladesh e-commerce registration requirements with a qualified local advisor (this is not legal advice).

---

# ACCEPTANCE CRITERIA (all must pass)

1. **No demo anywhere:** all Part 9 searches are clean; no demo accounts, passwords, backdoor branches, fake data, fake claims, placeholder contact or payment details; production refuses to start without strong secrets and with placeholders present.
2. **Real auth and protection:** accounts live in the database; works across devices; `/admin` and every admin action are blocked server-side for visitors and customers; demoted/blocked users lose access; rate limits proven.
3. **Orders are real:** a customer order appears in admin, reduces stock, is trackable, uses server-side prices, creates one order on double submit, and failures never show success.
4. **UI matches Stitch:** every final screen in Part 1.2 is implemented in light and dark, mobile and desktop, with the Stitch tokens, fonts, radii, shadows, icons, components, states and animations; `docs/FIDELITY_REPORT.md` shows side-by-side evidence for every screen; remaining differences are only real content, ৳ and the safety fixes.
5. **Admin looks like `admin_console_2`** with its own shell, real data, empty states for a new store, and the same visual language on every admin page.
6. English and Bangla both look intentional; light, dark and system themes switch live with no flash; WCAG 2.2 AA contrast everywhere (including dark crimson buttons and text over gradients).
7. No runtime CDN dependencies; fonts and icons self-hosted; performance and accessibility targets in Part 10 met.
8. All builds, lint, type-check, unit and Playwright tests pass; zero console/hydration/dev-overlay issues.
9. Docs are clean and complete, with no credentials; `OWNER_INPUTS_NEEDED.md` lists everything still required from the owner.

---

# FINAL DELIVERABLES

- All work on branch `stitch-ui-launch`, committed in logical slices.
- `docs/FIDELITY_REPORT.md` (side-by-side screenshots per screen, light/dark, mobile/desktop, EN/BN), `docs/INTERACTION_MAP.md`, `docs/PROGRESS.md`, `docs/ASSUMPTIONS.md`, `docs/OWNER_INPUTS_NEEDED.md`, `DESIGN_SYSTEM.md`.
- Playwright e2e + visual-regression + accessibility suites, plus expanded Vitest coverage.
- Lighthouse and axe reports (before/after).
- A final **Go / No-Go statement** with evidence and an honest list of anything unfinished or unverified. Do not claim "launch ready" unless every acceptance criterion passed with evidence.

---

# START NOW

1. Create the branch, check git history for the hardened baseline, and run the baseline (`npm ci`, `prisma generate`, build, type-check, tests).
2. Produce the Implementation Plan and Task List, then complete **Phase A (Part 3)** and pass Gate A.
3. Port the tokens (Part 4), build the components (Part 5), then rebuild pages slice by slice (Parts 6 to 8), running the fidelity loop and the Part 9 searches after every slice.
4. Finish with production readiness (Part 11) and the final verification (Part 10).
