# Khelna Bazar — Panel Isolation & Security Test Report

**Date:** November 18, 2026  
**Test Runner:** Vitest v3.2.7 & Next.js 16 Production Build Compiler  
**Test Suite Status:** 10 / 10 Test Files Passed · 90 / 90 Tests Passed (100% Pass Rate)

---

## 1. Test Suite Summary

```
 RUN  v3.2.7 C:/khelna-bazar-main

 ✓ tests/unit/coupon-discount.test.ts (4 tests) 5ms
 ✓ tests/unit/auth-utils.test.ts (6 tests) 8ms
 ✓ tests/unit/rate-limit.test.ts (3 tests) 6ms
 ✓ tests/unit/launch-guard.test.ts (5 tests) 11ms
 ✓ tests/unit/address-validation.test.ts (7 tests) 15ms
 ✓ tests/unit/panel-authorization.test.ts (15 tests) 23ms
 ✓ tests/unit/i18n.test.ts (5 tests) 37ms
 ✓ tests/unit/order-idor.test.ts (9 tests) 11ms
 ✓ tests/unit/order-logic.test.ts (17 tests) 58ms
 ✓ tests/unit/authorization-guards.test.ts (19 tests) 17ms

 Test Files  10 passed (10)
      Tests  90 passed (90)
   Duration  1.52s
```

---

## 2. Layout & Shell Isolation Assertions

### Panel A: Storefront (`src/app/(store)/layout.tsx`)
* **Shell Test ID:** `data-testid="storefront-shell"`
* **Components Mounted:**
  - `<AnnouncementBar />`
  - `<Header />` (Storefront logo, search bar, category pills, customer link, cart trigger)
  - `<MiniCartDrawer />`
  - `<CompareTray />`
  - `<Footer />` (Bangladeshi consumer trust pillars, hotline, return policy)
  - `<MobileBottomNav />` (Storefront tab bar)
* **Isolation Verification:**
  - Storefront chrome is absent from `/dashboard/*` and `/admin/*`.
  - Admin quick links were completely removed from the storefront header for normal shoppers; only staff/admin sessions see a distinct "Management Console" link.

### Panel B: Customer Dashboard (`src/app/dashboard/layout.tsx`)
* **Shell Test ID:** `data-testid="customer-dashboard-shell"`
* **Sidebar Test ID:** `data-testid="customer-sidebar"`
* **Components Mounted:**
  - `<CustomerDashboardShell />` with dedicated customer topbar and mobile drawer
  - Customer navigation items: Overview, My Orders, Addresses, Profile, Rewards
  - Hotline & WhatsApp Customer Care Assistance Card (`01712-039707`)
  - "Back to Store" Link returning to `/`
* **Isolation Verification:**
  - Admin controls (Products, Inventory, COD reconciliation, Staff management) are completely absent.
  - Public marketing banners and mega-menus are completely excluded.

### Panel C: Admin Console (`src/app/admin/layout.tsx`)
* **Shell Test ID:** `data-testid="admin-dashboard-shell"`
* **Sidebar Test ID:** `data-testid="admin-sidebar"`
* **Components Mounted:**
  - `<AdminLayout />` with operational topbar and role-filtered navigation
  - "View Storefront" external preview link
  - Role-gated operational sections (Orders, Catalog, Stock, Coupons, Settings, Staff, Audit Logs)
* **Isolation Verification:**
  - Shopping cart, customer rewards, address book, and storefront footers are completely excluded.
  - Single layout source of truth: nested admin pages do not duplicate the sidebar.

### Panel D: Authentication (`src/app/(auth)/layout.tsx`)
* **Components Mounted:**
  - Minimal centered container with Khelna Bazar logo, "Back to Store" link, and copyright.
* **Isolation Verification:**
  - Zero storefront or admin sidebars; optimal conversion and cognitive focus for authentication.

---

## 3. Server-Side Role Authorization Guard Tests (`panel-authorization.test.ts`)

| Test Case | Actor Role | Target URL / Guard | Expected Behavior | Result |
|---|---|---|---|:---:|
| **Anonymous Customer Guard** | None | `/dashboard` via `requireCustomer` | 307 Redirect to `/login?next=%2Fdashboard` | ✅ PASS |
| **Valid Customer Access** | `CUSTOMER` | `/dashboard` via `requireCustomer` | Returns user session object, renders page | ✅ PASS |
| **Staff into Customer Area** | `STAFF` | `/dashboard` via `requireCustomer` | 307 Redirect to `/admin/dashboard` | ✅ PASS |
| **Admin into Customer Area** | `ADMIN` | `/dashboard` via `requireCustomer` | 307 Redirect to `/admin/dashboard` | ✅ PASS |
| **Anonymous Staff Guard** | None | `/admin/orders` via `requireStaff` | 307 Redirect to `/login?next=%2Fadmin%2Forders` | ✅ PASS |
| **Customer Staff Guard** | `CUSTOMER` | `/admin/orders` via `requireStaff` | 307 Redirect to `/dashboard` (Forbidden) | ✅ PASS |
| **Staff into Orders** | `STAFF` | `/admin/orders` via `requireStaff` | Returns user session object, renders page | ✅ PASS |
| **Admin into Orders** | `ADMIN` | `/admin/orders` via `requireStaff` | Returns user session object, renders page | ✅ PASS |
| **Super Admin into Orders**| `SUPER_ADMIN` | `/admin/orders` via `requireStaff` | Returns user session object, renders page | ✅ PASS |
| **Staff into Admin Settings**| `STAFF` | `/admin/settings` via `requireAdmin`| 307 Redirect to `/admin/dashboard` | ✅ PASS |
| **Admin into Admin Settings**| `ADMIN` | `/admin/settings` via `requireAdmin`| Returns user session object, renders page | ✅ PASS |
| **Staff into Staffing** | `STAFF` | `/admin/staff` via `requireSuperAdmin`| 307 Redirect to `/admin/dashboard` | ✅ PASS |
| **Admin into Staffing** | `ADMIN` | `/admin/staff` via `requireSuperAdmin`| 307 Redirect to `/admin/dashboard` | ✅ PASS |
| **Super Admin into Staffing**| `SUPER_ADMIN` | `/admin/staff` via `requireSuperAdmin`| Returns user session object, renders page | ✅ PASS |
| **Role Hierarchy Helper** | Multiple | `isAuthorized` | Evaluates permission array accurately | ✅ PASS |

---

## 4. Super Admin Action Security Tests

| Test Case | Caller Role | Target Action | Expected Result | Result |
|---|---|---|---|:---:|
| **Get Staff as Admin** | `ADMIN` | `getStaffUsersAction` | `{ success: false, users: [] }` | ✅ PASS |
| **Get Audit Logs as Staff** | `STAFF` | `getAuditLogsAction` | `{ success: false, logs: [] }` | ✅ PASS |
| **Get Staff as Super Admin**| `SUPER_ADMIN` | `getStaffUsersAction` | `{ success: true, users: [...] }` | ✅ PASS |
| **Get Logs as Super Admin** | `SUPER_ADMIN` | `getAuditLogsAction` | `{ success: true, logs: [...] }` | ✅ PASS |
| **Self-Demotion Lockout** | `SUPER_ADMIN` | `updateStaffRoleAction` (Self) | Rejects demotion, preserves last Super Admin | ✅ PASS |

---

## 5. Insecure Direct Object Reference (IDOR) Scoping (`order-idor.test.ts`)

| Scenario | Tested Endpoint | Database Scope Enforced | Outcome |
|---|---|---|:---:|
| Customer A requests Customer B's order | `/dashboard/orders/[orderId]` | `where: { id: orderId, userId: session.user.id }` | Record not found (404) |
| Customer queries address list | `/dashboard/addresses` | `where: { userId: session.user.id }` | Returns only caller's addresses |
| Customer attempts to cancel other order | `cancelCustomerOrderAction` | `where: { id: orderId, userId: session.user.id }` | Mutation rejected |
| Guest accesses public tracking | `/track-order` | Matches both `orderNumber` AND `phone` | Data leak prevented |

---

## 6. Build Validation

* **Command:** `npm run build` (`prisma generate && next build`)
* **Output:** All 41 routes (dynamic SSR and static SSG) compiled without warnings or compilation failures.
* **Exit Code:** 0 (Clean).
