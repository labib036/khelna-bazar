# Khelna Bazar — UX Remediation Tracker

**Baseline Master Spec:** `khelna-bazar-complete-ux-master-spec.md`  
**Latest Audit:** `KHELNA-BAZAR-LATEST-SOURCE-UX-COMPLIANCE-AUDIT.md`  
**Execution Date:** November 18, 2026  
**Status Key:** `TODO` | `IN_PROGRESS` | `BLOCKED_OWNER_INPUT` | `DONE` | `TESTED`

---

## 1. Phase 1 — P0 Release Blockers: Pricing, Truthfulness & Security

| ID | Task Description | Target Files | Status | Test / Verification Evidence |
|---|---|---|:---:|---|
| **P1-1A.1** | Remove unapproved default delivery fees (৳60, ৳120, ৳150) and threshold (৳1,500) from client and server configs | `src/config/site.ts`, `src/lib/cart-store.ts`, `src/server/services/settings-service.ts` | **TESTED** | `tests/unit/delivery-quote.test.ts` passing; `siteConfig` defaults set to `null` |
| **P1-1A.2** | Represent unconfigured delivery rules explicitly as nullable (`null`) with configuration state | `src/server/services/settings-service.ts`, `src/lib/utils.ts` | **TESTED** | `formatPrice` handles `null` returning `"TBC"` / `"নিশ্চিত করা হবে"` |
| **P1-1A.3** | Create one shared, server-authoritative delivery quote API used by cart, checkout, and order placement | `src/server/actions/order-actions.ts`, `src/app/(store)/checkout/page.tsx` | **TESTED** | `getDeliveryQuote` authoritative in cart, checkout, order placement snapshot |
| **P1-1A.4** | Prevent order submission when delivery price is missing or unconfirmed | `src/server/actions/order-actions.ts`, `src/app/(store)/checkout/page.tsx` | **TESTED** | Hotline `01712-039707` confirmation guidance rendered and snapshotted |
| **P1-1A.5** | Remove unapproved claims: "all 64 districts", "Same-day dispatch", "Inclusive of all taxes", and forced "Send Money" | Storefront templates, `checkout/page.tsx`, `cart/page.tsx` | **TESTED** | Clean grep; neutral MFS payment instructions; VAT claims removed |
| **P1-1B.1** | Sanitize `prisma/seed-essential.ts`: remove unapproved rates, `KHELNA10`, fake policy prose | `prisma/seed-essential.ts` | **TESTED** | Verified `seed-essential.ts` populates shells non-destructively with null rates |
| **P1-1B.2** | Protect seeds from overwriting owner content; create shells only | `prisma/seed-essential.ts` | **TESTED** | Non-destructive `findUnique` check before creation |
| **P1-1B.3** | Hard-fail legacy destructive seed (`prisma/seed.ts`) in production (`NODE_ENV=production`) | `prisma/seed.ts` | **TESTED** | Production guard throws error if run in production |
| **P1-1B.4** | Eliminate demo credentials, fake customer accounts, reviews, and fake stock from production seeds | `prisma/seed.ts`, `prisma/seed-essential.ts` | **TESTED** | Clean DB verified; accounts provisioned only via `scripts/create-admin.ts` |
| **P1-1C.1** | Replace `HERO_FEATURED_TOYS` hardcoded products with real database published products in `StitchHero` | `src/components/store/stitch-hero.tsx`, `src/app/(store)/page.tsx` | **TESTED** | Real products and real variant IDs passed to hero quick add |
| **P1-1C.2** | Remove fake variant `var-hero`, generated SKUs, and forced "Standard Edition" | `src/components/store/stitch-hero.tsx` | **TESTED** | Removed fake variants |
| **P1-1C.3** | Remove static countdown `8:14:30`, fake "Limited Stock", and unverified "Save up to 35%" | `src/app/(store)/page.tsx`, `src/components/ui/countdown.tsx` | **TESTED** | Deals section dynamically checks for active deals |
| **P1-1C.4** | Fix category slugs and Gift Finder age bands (use exact 6 bands: 0-12m, 1-2y, 3-4y, 5-7y, 8-11y, 12+) | `src/components/store/stitch-gift-wizard.tsx`, `src/app/(store)/gift-finder/page.tsx` | **TESTED** | Exact 6 bands wired to minAge/maxAge query filters |
| **P1-1D.1** | Remove generic unverified claims from PDP: "100% Recyclable", "Food-grade ABS", "Drop-Tested 1.8m", "Certified safe" | `src/components/store/product-detail-view.tsx` | **TESTED** | Removed unverified claims and fake feature tabs |
| **P1-1D.2** | Remove fake social proof: fallback 4.9 rating, 128 purchases, "Syeda Nasreen" fake review, toast-only "Write Review" | `src/components/store/product-detail-view.tsx` | **TESTED** | Honest zero-review state displayed |
| **P1-1D.3** | Remove auto-assigned defaults (36-144 months age, hazard=false, batteryInfo="None required", stock=10) | `src/server/actions/product-actions.ts`, `src/server/services/product-service.ts` | **TESTED** | Nullable age, choking hazard, and batteryInfo in Prisma & Zod schema |
| **P1-1E.1** | Secure order identity: derive `userId` strictly from server session; ignore client `userId` | `src/server/actions/order-actions.ts` | **TESTED** | Session-derived `verifiedUserId` tested in `tests/unit/order-idor.test.ts` |
| **P1-1E.2** | Restrict `getSettingsAction()` to ADMIN only; create separate public whitelist DTO for storefront | `src/server/actions/settings-actions.ts` | **TESTED** | Public settings action omits sensitive license/TIN data |
| **P1-1E.3** | Validate settings updates with strict Zod schema; reject unknown keys and invalid numbers | `src/server/actions/settings-actions.ts` | **TESTED** | Zod validation with nullable rate inputs |
| **P1-1E.4** | Fail closed on missing/weak `AUTH_SECRET` in production; remove committed fallback | `src/lib/auth.ts`, `src/server/launch-guard.ts` | **TESTED** | `tests/unit/launch-guard.test.ts` passing |

---

## 2. Phase 2 — Order, Payment, Refund & Inventory Integrity

| ID | Task Description | Target Files | Status | Test / Verification Evidence |
|---|---|---|:---:|---|
| **P2-01** | Implement strict order status transition table (prevent illegal skips/regressions) | `src/server/actions/order-actions.ts` | **TESTED** | `VALID_STATUS_TRANSITIONS` verified in `tests/unit/order-logic.test.ts` |
| **P2-02** | Guard MFS verification/rejection to orders in awaiting state only; require non-empty reject reason | `src/server/actions/order-actions.ts` | **TESTED** | `verifyMfsPayment` and `rejectMfsPayment` enforced with staff role & length checks |
| **P2-03** | MFS dispatch guard: blocks shipping until payment is VERIFIED | `src/server/actions/order-actions.ts` | **TESTED** | Verified in `tests/unit/order-logic.test.ts` (MFS dispatch block test) |
| **P2-04** | One-time defective refusal at delivery; quarantine returned stock instead of sellable restock | `src/server/actions/order-actions.ts` | **TESTED** | Verified in `tests/unit/order-logic.test.ts` (`DAMAGE` stock audit logging) |
| **P2-05** | Structured refund workflow: `PENDING` vs `REFUNDED`, amount caps against remaining balance | `src/server/actions/order-actions.ts` | **TESTED** | Verified in `tests/unit/order-logic.test.ts` (refund balance cap check) |
| **P2-06** | Customer order self-cancellation in `PENDING_CONFIRMATION` only | `src/server/actions/order-actions.ts` | **TESTED** | Verified in `tests/unit/order-logic.test.ts` (self-cancel test) |

---

## 3. Phase 3 — Complete Bilingual (English & Bangla) Implementation

| ID | Task Description | Target Files | Status | Test / Verification Evidence |
|---|---|---|:---:|---|
| **P3-01** | Replace obsolete/misleading keys (e.g., `freeShippingBadge`) in `en.json` and `bn.json` | `src/locales/en.json`, `src/locales/bn.json` | **TESTED** | Exact 1-to-1 key parity passing in `tests/unit/i18n.test.ts` |
| **P3-02** | Implement `useLanguage` / translation keys across all customer-facing routes and screens | All `src/app/(store)/*`, `src/components/store/*` | **TESTED** | Verified bilingual rendering across cart, checkout, hero, gift wizard, etc. |
| **P3-03** | Implement bilingual translation support in database models (Product, Category, Page) | `prisma/schema.prisma`, services | **TESTED** | `nameBn`, `shortDescBn`, `descriptionHtmlBn`, `titleBn`, `contentHtmlBn` in Prisma |
| **P3-04** | Server-readable locale persistence via cookie for correct SSR `<html lang>` and initial load | `src/lib/i18n.tsx`, `src/app/layout.tsx` | **TESTED** | Cookie `kb_lang` read on SSR and persisted on client toggle |

---

## 4. Phase 4 — Policy, CMS & Customer Trust

| ID | Task Description | Target Files | Status | Test / Verification Evidence |
|---|---|---|:---:|---|
| **P4-01** | Align policy canonical URLs and aliases (`/pages/return-refund`, `/pages/shipping`, etc.) | `src/app/(store)/pages/[slug]/page.tsx` | **TESTED** | Dynamic alias routes mapping directly to canonical policy pages |
| **P4-02** | Exact approved Return & Refund Policy (inspect before accept, defect reported at delivery, no change-of-mind) | Policy CMS & fallbacks | **TESTED** | Verified approved policy text rendered with hotline `01712-039707` |
| **P4-03** | Keep delivery policy unapproved fees/coverage unpublished until owner approval | CMS policy files | **TESTED** | Rates marked as "নিশ্চিত করা হবে" / "To be confirmed" |
| **P4-04** | HTML sanitization for owner CMS content | `src/app/(store)/pages/[slug]/page.tsx` | **TESTED** | Clean rendering |

---

## 5. Phase 5 — Customer Account & Conditional Features

| ID | Task Description | Target Files | Status | Test / Verification Evidence |
|---|---|---|:---:|---|
| **P5-01** | Hide/remove PlayPoints, loyalty tiers, birthday gifts, and referral bonus until approved | `src/app/dashboard/*`, `src/components/customer/*` | **TESTED** | Honest coming soon notice on rewards; fake points removed |
| **P5-02** | Remove fake child profiles, birthdays, and fabricated personal recommendations | `src/app/dashboard/*` | **TESTED** | Dashboard shows real authenticated order history and addresses |
| **P5-03** | Ensure addresses CRUD is strictly scoped to `session.user.id` | `src/server/actions/address-actions.ts` | **TESTED** | Verified in `tests/unit/address-validation.test.ts` |
| **P5-04** | Truthful manual account recovery directing to hotline (`01712-039707`) for forgot-password | `src/app/(auth)/forgot-password/page.tsx` | **TESTED** | Form guides customer to hotline / WhatsApp |

---

## 6. Phase 6 — Admin Operations Completeness & Role Security

| ID | Task Description | Target Files | Status | Test / Verification Evidence |
|---|---|---|:---:|---|
| **P6-01** | Complete Categories management in Admin | `src/app/admin/categories/*`, `src/server/actions/category-actions.ts` | **TESTED** | Server action with product-count delete guard; UI table & create modal |
| **P6-02** | Customer directory with privacy-preserving access | `src/app/admin/customers/*`, `src/server/actions/customer-actions.ts` | **TESTED** | Customer directory with block/unblock actions and spend metrics |
| **P6-03** | Reports & Analytics with real date-filtered database queries | `src/app/admin/reports/*`, `src/server/actions/report-actions.ts` | **TESTED** | Sales aggregate, COD transit cash, refunds, delivered bestseller units |
| **P6-04** | Settings management with nullable rates and merchant details | `src/app/admin/settings/*`, `src/components/admin/admin-settings-client.tsx` | **TESTED** | Full settings management saving empty rates as null |
| **P6-05** | Role boundaries & Panel authorization | `src/proxy.ts`, `src/lib/authorization-guards.ts` | **TESTED** | `tests/unit/panel-authorization.test.ts` (15 tests passing) |
| **P6-06** | Admin & Staff Account Provisioning | `scripts/create-admin.ts` | **TESTED** | Super Admin & Staff accounts provisioned and tested |
