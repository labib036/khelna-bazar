# Khelna Bazar — Panel Migration Report

**Date:** November 18, 2026  
**Branch:** `stitch-ui-launch`  
**Author:** Antigravity Engineering Team  
**Status:** Completed & Validated

---

## 1. Executive Summary

This report documents the end-to-end migration that decoupled **Khelna Bazar** (`khelnabazar.com.bd`) into three isolated panels with dedicated layouts, clean routing namespaces, and hierarchical role-based security:

1. **Panel A (Public Marketing Storefront):** Root paths (`/`, `/c/[...slug]`, `/p/[slug]`, `/cart`, `/checkout`, `/search`, etc.) now encapsulated inside route group `(store)` with dedicated storefront chrome.
2. **Panel B (Signed-in Customer Dashboard):** Dedicated namespace at `/dashboard/*` with isolated customer shell, sidebar drawer, and strict database-level ownership scoping (`userId === session.user.id`).
3. **Panel C (Management Console):** Dedicated namespace at `/admin/*` (canonical home `/admin/dashboard`) with role-aware operational navigation (`STAFF`, `ADMIN`, `SUPER_ADMIN`).
4. **Panel D (Focused Auth Experience):** Clean, distraction-free layout at `(auth)` without storefront banners or administrative chrome.

All migrations were executed in-place on a single Next.js application instance and single PostgreSQL database without breaking any existing URLs, SEO rankings, or operational workflows.

---

## 2. File Relocations & Route Group Organization

All public storefront routes were moved into `src/app/(store)/` using `git mv` to preserve full Git revision history:

| Original Path | Migrated Path | Route Surface | Layout Wrapper |
|---|---|---|---|
| `src/app/page.tsx` | `src/app/(store)/page.tsx` | Home (`/`) | `(store)/layout.tsx` |
| `src/app/c/[...slug]/page.tsx` | `src/app/(store)/c/[...slug]/page.tsx` | Category (`/c/*`) | `(store)/layout.tsx` |
| `src/app/p/[slug]/page.tsx` | `src/app/(store)/p/[slug]/page.tsx` | Product (`/p/*`) | `(store)/layout.tsx` |
| `src/app/cart/page.tsx` | `src/app/(store)/cart/page.tsx` | Cart (`/cart`) | `(store)/layout.tsx` |
| `src/app/checkout/page.tsx` | `src/app/(store)/checkout/page.tsx` | Checkout (`/checkout`) | `(store)/layout.tsx` |
| `src/app/search/page.tsx` | `src/app/(store)/search/page.tsx` | Search (`/search`) | `(store)/layout.tsx` |
| `src/app/deals/page.tsx` | `src/app/(store)/deals/page.tsx` | Deals (`/deals`) | `(store)/layout.tsx` |
| `src/app/new-arrivals/page.tsx` | `src/app/(store)/new-arrivals/page.tsx` | New Arrivals (`/new-arrivals`) | `(store)/layout.tsx` |
| `src/app/gift-finder/page.tsx` | `src/app/(store)/gift-finder/page.tsx` | Gift Finder (`/gift-finder`) | `(store)/layout.tsx` |
| `src/app/compare/page.tsx` | `src/app/(store)/compare/page.tsx` | Compare (`/compare`) | `(store)/layout.tsx` |
| `src/app/wishlist/page.tsx` | `src/app/(store)/wishlist/page.tsx` | Wishlist (`/wishlist`) | `(store)/layout.tsx` |
| `src/app/pages/[slug]/page.tsx` | `src/app/(store)/pages/[slug]/page.tsx` | CMS Pages (`/pages/*`) | `(store)/layout.tsx` |
| `src/app/track-order/page.tsx` | `src/app/(store)/track-order/page.tsx` | Order Track (`/track-order`) | `(store)/layout.tsx` |
| `src/app/order/[id]/page.tsx` | `src/app/(store)/order/[id]/page.tsx` | Order View (`/order/*`) | `(store)/layout.tsx` |
| `src/app/dev/ui/page.tsx` | `src/app/(store)/dev/ui/page.tsx` | Dev Playground (`/dev/ui`) | `(store)/layout.tsx` |

---

## 3. Root Layout Decontamination

### Before:
`src/app/layout.tsx` mounted the storefront header, footer, announcement bar, mini-cart drawer, and mobile bottom nav unconditionally across all routes. Admin screens and customer screens were rendered nested inside marketing chrome.

### After:
`src/app/layout.tsx` is now a pure root container containing only:
- HTML/Body structure and language tag (`lang="en"`)
- Global font declarations (Plus Jakarta Sans & Baloo 2)
- Global `<Providers>` (Theme, Session, QueryClient)
- Global notification `<Toaster />`

Storefront chrome is mounted exclusively in `src/app/(store)/layout.tsx` inside `<div data-testid="storefront-shell">`.

---

## 4. Customer Dashboard Infrastructure (`/dashboard/*`)

1. **Dedicated Shell (`src/components/customer/customer-dashboard-shell.tsx`):**
   - Implements `data-testid="customer-dashboard-shell"` and `data-testid="customer-sidebar"`.
   - Customer profile badge with role indicator.
   - Dedicated links: Overview (`/dashboard`), Orders (`/dashboard/orders`), Addresses (`/dashboard/addresses`), Profile (`/dashboard/profile`), Rewards (`/dashboard/rewards`).
   - "Back to Store" escape link and support card (Hotline `01712-039707` & WhatsApp).
   - Responsive mobile drawer with hamburger toggle.

2. **Customer Pages Created:**
   - `src/app/dashboard/layout.tsx`: Layout wrapper with `noindex, nofollow` metadata.
   - `src/app/dashboard/page.tsx`: Overview KPI cards (Total Orders, Pending Delivery, Total Spent, Saved Addresses), active parcel timeline tracker, quick action shortcuts.
   - `src/app/dashboard/orders/page.tsx`: Order history with search, status filtering, invoice modal triggers, order cancellation for pending orders.
   - `src/app/dashboard/orders/[orderId]/page.tsx`: Single order detail with strict database-level scoping (`where: { id: orderId, userId: session.user.id }`).
   - `src/app/dashboard/addresses/page.tsx`: Full address book CRUD (Home, Office, Other), default address toggles, BD 8-division dropdown.
   - `src/app/dashboard/profile/page.tsx`: Personal details update, contact sync, and secure password modification.
   - `src/app/dashboard/rewards/page.tsx`: Loyalty program information and coming-soon perks notice.

3. **Compatibility Redirects (`src/app/account/*`):**
   - `/account` ➔ 307 redirect to `/dashboard`
   - `/account/orders` ➔ 307 redirect to `/dashboard/orders`
   - `/account/addresses` ➔ 307 redirect to `/dashboard/addresses`
   - `/account/profile` ➔ 307 redirect to `/dashboard/profile`
   - `/account/rewards` ➔ 307 redirect to `/dashboard/rewards`

---

## 5. Admin Console Unification (`/admin/*`)

1. **Dedicated Shell (`src/components/admin/admin-layout.tsx`):**
   - Implements `data-testid="admin-dashboard-shell"` and `data-testid="admin-sidebar"`.
   - Role-aware sidebar displaying only links permissible for the current user's role:
     - `STAFF`: Overview, Orders & MFS
     - `ADMIN`: Overview, Orders, Catalog, Stock, Coupons, Store Settings
     - `SUPER_ADMIN`: All above plus Staffing Directory (`/admin/staff`) and Audit Logs (`/admin/audit-logs`)
   - "View Live Store" escape link.

2. **Admin Pages Created / Refactored:**
   - `src/app/admin/layout.tsx`: Single source of truth for admin chrome.
   - `src/app/admin/dashboard/page.tsx`: Canonical dashboard home with real-time KPIs, active orders table, low stock alerts.
   - `src/app/admin/page.tsx`: Redirects permanently to `/admin/dashboard`.
   - `src/app/admin/staff/page.tsx`: Provisioning form and role-assignment table for Super Admin.
   - `src/app/admin/audit-logs/page.tsx`: Tamper-evident immutable audit log viewer with diff viewer for Super Admin.
   - Removed nested `<AdminLayout>` wrappers from `/admin/orders`, `/admin/products`, `/admin/inventory`, `/admin/coupons`, `/admin/settings` to prevent duplicate chrome.

---

## 6. Authentication Layout (`(auth)`)

- `src/app/(auth)/layout.tsx`: Centered card layout with Khelna Bazar brand mark, "Back to Store" navigation link, trust badges, and copyright.
- Completely free of navigation menus, shopping carts, or admin elements.

---

## 7. Migration Verification Summary

| Verification Target | Expected Result | Actual Result | Status |
|---|---|---|---|
| **TypeScript Typecheck** | `npx tsc --noEmit` exits with 0 | Clean run (0 errors) | PASSED |
| **Vitest Test Suite** | 90+ tests passing across 10 files | 90 / 90 tests passed | PASSED |
| **Next.js Production Build** | `npm run build` succeeds | Optimized build generated for all 41 routes | PASSED |
| **Role Protection** | Non-staff blocked from `/admin/*` | Redirected to `/dashboard` | PASSED |
| **Customer IDOR Scoping** | Customer cannot view another's order | 404 / Unauthorized enforced | PASSED |
| **Compatibility Redirects** | `/account/*` maps to `/dashboard/*` | 307 redirect at Edge and Page level | PASSED |
