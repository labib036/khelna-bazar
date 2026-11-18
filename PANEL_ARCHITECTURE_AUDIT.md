# Khelna Bazar — Panel Architecture Audit

**Date:** November 17, 2026  
**Status:** Audit Completed · Ready for Implementation  
**Target:** Separation of Public Storefront, Signed-In Customer Dashboard (`/dashboard/*`), and Admin Management Console (`/admin/dashboard/*`)

---

## 1. Executive Summary & Root Cause Analysis

### The Problem
In the baseline application, all pages—including `/admin/*` operations and `/account/*` customer screens—inherited the storefront chrome from the root layout (`src/app/layout.tsx`). The root layout globally rendered:
- `<AnnouncementBar />`
- `<Header />` (Storefront mega-menu, cart pill, search bar)
- `<Footer />` (Storefront marketing footer)
- `<MiniCartDrawer />`
- `<MobileBottomNav />` (Storefront navigation tabs)

Consequently, when staff navigated to `/admin` or customers to `/account`, the management or account panels were visually sandwiched inside the public e-commerce store layout. Furthermore, the storefront `<Header />` contained conditional checks for `ADMIN` / `STAFF` roles, conflating management destinations with the customer experience.

### The Objective
Restructure the application into three completely decoupled surfaces sharing one canonical host:
1. **Public Marketing & Shopping Storefront:** Root URL paths (`/`, `/c/[...slug]`, `/p/[slug]`, `/cart`, `/checkout`, `/search`, etc.) wrapped by a dedicated `(store)/layout.tsx`.
2. **Signed-in Customer Dashboard:** Isolated namespace at `/dashboard/*` wrapped by a dedicated `(customer)/dashboard/layout.tsx` with customer-only navigation, profile actions, and strict data ownership scoping. Compatibility alias redirects `/account/*` to `/dashboard/*`.
3. **Staff/Admin/Super-Admin Console:** Isolated namespace at `/admin/*` (canonical home `/admin/dashboard`) wrapped by a dedicated `admin/layout.tsx` with role-aware operational navigation. Redirect `/admin` to `/admin/dashboard`.
4. **Focused Authentication Experience:** Centered `(auth)/layout.tsx` without distraction or leaking privileged/customer chrome.

---

## 2. Baseline Route Inventory

| Current Path | Surface | Target Canonical Route | Planned Layout | Notes |
|---|---|---|---|---|
| `/` | Public | `/` | `(store)/layout.tsx` | Homepage |
| `/c/[...slug]` | Public | `/c/[...slug]` | `(store)/layout.tsx` | Category listing |
| `/p/[slug]` | Public | `/p/[slug]` | `(store)/layout.tsx` | Product detail view |
| `/search` | Public | `/search` | `(store)/layout.tsx` | Catalog search |
| `/deals` | Public | `/deals` | `(store)/layout.tsx` | Promotional deals |
| `/new-arrivals` | Public | `/new-arrivals` | `(store)/layout.tsx` | New arrivals |
| `/gift-finder` | Public | `/gift-finder` | `(store)/layout.tsx` | Gift recommendation |
| `/cart` | Public | `/cart` | `(store)/layout.tsx` | Basket |
| `/checkout` | Public | `/checkout` | `(store)/layout.tsx` | Order checkout (COD/MFS) |
| `/compare` | Public | `/compare` | `(store)/layout.tsx` | Product comparison |
| `/wishlist` | Public | `/wishlist` | `(store)/layout.tsx` | Saved products |
| `/pages/[slug]` | Public | `/pages/[slug]` | `(store)/layout.tsx` | CMS policy pages |
| `/track-order` | Public | `/track-order` | `(store)/layout.tsx` | Public order lookup (phone + order#) |
| `/order/[id]` | Public/Secure | `/order/[id]` | `(store)/layout.tsx` | Order confirmation / guest token gate |
| `/(auth)/login` | Auth | `/login` | `(auth)/layout.tsx` | Role-aware post-login redirect |
| `/(auth)/register` | Auth | `/register` | `(auth)/layout.tsx` | Customer registration |
| `/(auth)/forgot-password` | Auth | `/forgot-password` | `(auth)/layout.tsx` | Hotline recovery |
| `/account` | Customer | `/dashboard` | `(customer)/dashboard/layout.tsx` | Customer overview (Redirect `/account` -> `/dashboard`) |
| `/account/orders` | Customer | `/dashboard/orders` | `(customer)/dashboard/layout.tsx` | Customer order history |
| `/account/addresses` | Customer | `/dashboard/addresses` | `(customer)/dashboard/layout.tsx` | Customer address book |
| `/account/profile` | Customer | `/dashboard/profile` | `(customer)/dashboard/layout.tsx` | Customer profile & password |
| `/account/rewards` | Customer | `/dashboard/rewards` | `(customer)/dashboard/layout.tsx` | Rewards program status |
| `/account/orders/[id]` | Customer | `/dashboard/orders/[orderId]` | `(customer)/dashboard/layout.tsx` | Customer order detail with ownership check |
| `/admin` | Admin | `/admin/dashboard` | `admin/layout.tsx` | Canonical admin home (Redirect `/admin` -> `/admin/dashboard`) |
| `/admin/products` | Admin | `/admin/products` | `admin/layout.tsx` | Product catalog operations |
| `/admin/orders` | Admin | `/admin/orders` | `admin/layout.tsx` | Order queue & MFS verification |
| `/admin/inventory` | Admin | `/admin/inventory` | `admin/layout.tsx` | Stock ledger adjustments |
| `/admin/coupons` | Admin | `/admin/coupons` | `admin/layout.tsx` | Coupon & discount rules |
| `/admin/settings` | Admin | `/admin/settings` | `admin/layout.tsx` | Delivery rates & store settings |
| `/admin/staff` | Super Admin | `/admin/staff` | `admin/layout.tsx` | Staff accounts & roles |
| `/admin/audit-logs` | Super Admin | `/admin/audit-logs` | `admin/layout.tsx` | Security & operational audit logs |

---

## 3. Role & Permission Baseline

### Existing Roles:
- `CUSTOMER`: Shopper who can place orders, view own profile, addresses, and order history.
- `STAFF`: Warehouse & customer care operator who can view orders, update order status, verify MFS payments.
- `ADMIN`: Business manager who manages products, stock, coupons, and delivery settings.

### Super Admin Enhancement:
- Add `SUPER_ADMIN` to `enum Role` in `prisma/schema.prisma` and NextAuth typings.
- `SUPER_ADMIN` is the exclusive authority for:
  1. Managing staff accounts and role promotions (`/admin/staff`).
  2. Viewing full audit logs (`/admin/audit-logs`).
  3. Modifying core platform security settings.

---

## 4. Layout Architecture Plan

### Root Layout (`src/app/layout.tsx`):
- Stripped of all storefront UI components.
- Retains only `<html>`, `<head>`, `<body>`, Google font variables (`Plus Jakarta Sans`, `Inter`, `Hind Siliguri`), `<Providers>`, and global `<Toaster />`.

### Storefront Route Group (`src/app/(store)/layout.tsx`):
- Wraps all public shopping routes.
- Includes `<AnnouncementBar />`, `<Header />`, `<main>{children}</main>`, `<Footer />`, `<MiniCartDrawer />`, and `<MobileBottomNav />`.
- Header updated: Public header no longer displays admin management sidebars or controls. For logged-in customers, links point to `/dashboard` and `/dashboard/orders`. For staff/admin, a dedicated "Management Console" link navigates directly to `/admin/dashboard`.

### Customer Dashboard Route Group (`src/app/(customer)/dashboard/layout.tsx`):
- Dedicated customer workspace shell with:
  - Top header displaying customer avatar, name, and "Back to Store" link (`/`).
  - Responsive sidebar/drawer with:
    - Overview (`/dashboard`)
    - My Orders (`/dashboard/orders`)
    - Address Book (`/dashboard/addresses`)
    - Profile & Security (`/dashboard/profile`)
    - Rewards (`/dashboard/rewards`)
    - Sign Out button (Auth.js session termination)
  - Zero storefront chrome (no storefront announcement bar, no mega-menu, no mini-cart drawer).
  - Zero admin chrome (no KPI charts, no stock adjustment tools).

### Admin Management Console (`src/app/admin/layout.tsx`):
- Dedicated operations console shell with:
  - Top header displaying active operator identity, role badge (`SUPER_ADMIN`, `ADMIN`, `STAFF`), and "View Storefront" link (`/`).
  - Persistent desktop sidebar & responsive mobile drawer with grouped navigation:
    - **Overview:** Dashboard (`/admin/dashboard`)
    - **Catalog & Inventory:** Products (`/admin/products`), Inventory (`/admin/inventory`)
    - **Fulfillment & Sales:** Orders (`/admin/orders`), Coupons (`/admin/coupons`)
    - **Store Configuration:** Settings (`/admin/settings` - Admin+)
    - **System & Security:** Staff Management (`/admin/staff` - Super Admin only), Audit Logs (`/admin/audit-logs` - Super Admin only)
    - Sign Out button
  - Zero storefront or customer dashboard chrome.

---

## 5. Security & Data Scoping Audit

1. **Customer Ownership:** All queries in `/dashboard/*` must query with `where: { userId: session.user.id }`. Under no circumstances may a customer view or mutate another customer's orders or addresses by manipulating URL parameters.
2. **Server Action Enforcement:** Every server action in `src/server/actions/*` must call server-side authorization guards before performing any read or mutation.
3. **Compatibility Redirects:**
   - `/account` -> `/dashboard` (307 redirect)
   - `/account/orders` -> `/dashboard/orders`
   - `/account/addresses` -> `/dashboard/addresses`
   - `/account/profile` -> `/dashboard/profile`
   - `/account/rewards` -> `/dashboard/rewards`
   - `/admin` -> `/admin/dashboard`
4. **Post-Login Routing:**
   - Role-aware redirect logic: If customer signs in without a specified callback, redirect to `/dashboard`. If staff or admin signs in, redirect to `/admin/dashboard`.

---
**Audit Complete.** Proceeding to Phase 2 (Route Map & Role Permission Matrix).
