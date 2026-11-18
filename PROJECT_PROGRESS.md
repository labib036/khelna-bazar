# Khelna Bazar (খেলনা বাজার) — Project Progress Tracker

**Repository:** `khelna-bazar-main`  
**Active Branch:** `stitch-ui-launch`  
**Latest Milestone:** Three Separate Panels & Route Isolation Refactor Completed  
**Last Updated:** November 18, 2026

---

## 🎯 Project Overview & Status Summary

| Pillar | Specification | Status | Evidence / Verification |
|---|---|:---:|---|
| **E-Commerce Platform** | Next.js 16 (Turbopack), React 19, TypeScript | ✅ Complete | Clean `npm run build` (41 routes) |
| **Database & ORM** | PostgreSQL (Neon serverless) + Prisma ORM | ✅ Complete | Prisma v6.19.3 schema with 25+ models & Enums |
| **Payment Model** | Strictly COD + Manual MFS (bKash/Nagad) | ✅ Complete | Dual-state COD & payment reconciliation engine |
| **Sensory Brand UI** | Google Stitch Design Tokens, Baloo 2 + Plus Jakarta | ✅ Complete | Complete component suite with trust badges |
| **Panel Isolation** | Decoupled Storefront, Customer Dashboard, Admin Console | ✅ Complete | Dedicated layouts, separate shells, zero chrome bleed |
| **Security & Auth** | NextAuth v5 + Multi-layer role guards + Zero IDOR | ✅ Complete | 90 / 90 automated tests passing |

---

## 📅 Chronological Milestones

### Milestone 1: Foundation & E-Commerce Infrastructure
- [x] Initialized Next.js App Router project with TypeScript strict mode.
- [x] Configured PostgreSQL database schema with Prisma (Products, Variants, Categories, Brands, Orders, OrderEvents, Coupons, Addresses, Users, AuditLogs).
- [x] Implemented Zustand client state for cart, wishlist, and toy comparison with local storage persistence.
- [x] Built responsive shopping cart drawer with live free delivery meter (৳1,500 threshold).
- [x] Created single-page Cash on Delivery checkout with mandatory doorstep inspection consent.

### Milestone 2: COD & MFS Operational Engine
- [x] Developed dual-lifecycle order engine separating fulfillment status (`PENDING_CONFIRMATION` → `CONFIRMED` → `PACKED` → `SHIPPED` → `DELIVERED`) from cash reconciliation (`UNCOLLECTED` → `COLLECTED` → `DISCREPANCY`).
- [x] Built manual MFS payment verification workflow (bKash/Nagad transaction ID & sender phone audit).
- [x] Created doorstep parcel refusal handler with automated defective inventory tagging.
- [x] Built customer order tracking lookup (`/track-order`) with dual-factor protection (`orderNumber` + `phone`).

### Milestone 3: Google Stitch Sensory UI & Child Safety
- [x] Integrated Bangladeshi cultural nuances and typography (Baloo 2 Bengali script).
- [x] Added child safety certification badges (ASTM F963, CE, non-toxic BPA-free marks).
- [x] Implemented 6 standard age brackets (0–12m, 1–2y, 3–4y, 5–7y, 8–11y, 12+).
- [x] Built interactive 4-step Gift Finder quiz with budget & age filtering.
- [x] Created side-by-side toy comparison tray and matrix.

### Milestone 4: Three Separate Panels & Route Isolation Refactor
- [x] **Root Layout Decontamination**: Stripped storefront chrome (`AnnouncementBar`, `Header`, `Footer`, `MiniCartDrawer`, `MobileBottomNav`) out of `src/app/layout.tsx`.
- [x] **Storefront Route Group `(store)`**: Relocated all public catalog and marketing routes inside `src/app/(store)/` wrapped by `(store)/layout.tsx` (`data-testid="storefront-shell"`).
- [x] **Customer Dashboard Panel B (`/dashboard/*`)**:
  - Built dedicated customer shell (`data-testid="customer-dashboard-shell"`, `data-testid="customer-sidebar"`).
  - Implemented `/dashboard` overview, `/dashboard/orders`, `/dashboard/orders/[orderId]`, `/dashboard/addresses`, `/dashboard/profile`, and `/dashboard/rewards`.
  - Added compatibility 307 redirects for all legacy `/account/*` URLs.
  - Enforced strict database-level scoping (`where: { userId: session.user.id }`) eliminating all IDOR risks.
- [x] **Admin Management Console Panel C (`/admin/*`)**:
  - Unified admin shell (`src/app/admin/layout.tsx`) with role-aware sidebar.
  - Relocated canonical admin home to `/admin/dashboard` (with `/admin` redirect).
  - Added `SUPER_ADMIN` role to Prisma schema and regenerated Prisma client.
  - Built Super Admin Staff Management (`/admin/staff`) with user provisioning and role assignment.
  - Built Super Admin Security Audit Logs (`/admin/audit-logs`) with state diff viewers.
  - Centralized server authorization guards (`requireCustomer`, `requireStaff`, `requireAdmin`, `requireSuperAdmin`).
- [x] **Focused Authentication Panel D (`(auth)`)**:
  - Implemented distraction-free centered card layout for `/login`, `/register`, and `/forgot-password`.
- [x] **Automated Testing & Build Validation**:
  - 10 unit test files, 90 tests passing (100% pass rate).
  - Next.js production build (`npm run build`) compiles cleanly across all 41 routes.
- [x] **Comprehensive Documentation**:
  - Published 8 audit and test reports (`PANEL_ARCHITECTURE_AUDIT.md`, `PANEL_ROUTE_MAP.md`, `ROLE_PERMISSION_MATRIX.md`, `PANEL_MIGRATION_REPORT.md`, `PANEL_ISOLATION_TEST_REPORT.md`, `PANEL_UI_QA_REPORT.md`, `PANEL_LINK_AUDIT.md`, `PANEL_SECURITY_REVIEW.md`).
  - Updated `README.md`, `ADMIN_GUIDE.md`, and `SECURITY.md`.

---

## 📊 Verification Test Results

```
Test Files: 10 passed (10)
Tests:      90 passed (90)
TypeScript: 0 errors (npx tsc --noEmit)
Next Build: Exit Code 0 (Production Build Successful)
```
