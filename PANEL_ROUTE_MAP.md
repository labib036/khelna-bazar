# Khelna Bazar — Panel Route Map & Canonical URL Contract

**Date:** November 17, 2026  
**Host Architecture:** Single Canonical Origin (`siteConfig.url`), Three Isolated Namespaces

---

## 1. Complete Canonical Route Table

### Panel A: Public Storefront & Marketing (`/`)
*Layout: `src/app/(store)/layout.tsx` (Announcement Bar, Storefront Header, Footer, Mini-Cart, Mobile Bottom Nav)*

| Route | Dynamic Params | Access Level | Description |
|---|---|---|---|
| `/` | None | Public | Storefront homepage, Stitch hero, category pills, trust pillars |
| `/c/[...slug]` | `slug` (string[]) | Public | Category, sub-category, and filtered toy listing |
| `/p/[slug]` | `slug` (string) | Public | Toy detail view, age suitability, safety specs, buy box |
| `/search` | Query: `q`, `cat`, `sort` | Public | Instant search results with keyword matching |
| `/deals` | Query: `sort` | Public | Discounted toys and active promotions |
| `/new-arrivals` | Query: `sort` | Public | Latest toy arrivals |
| `/gift-finder` | Query: `age`, `budget` | Public | Guided gift recommendation wizard |
| `/cart` | None | Public | Shopping basket review, item steppers, gift wrap |
| `/checkout` | None | Public / Guest / Customer | COD & MFS checkout with mandatory inspection consent |
| `/compare` | None | Public | Side-by-side toy feature comparison |
| `/wishlist` | None | Public (LocalStorage/User) | Saved favorite toys |
| `/pages/[slug]` | `slug` (string) | Public | Bilingual static policy pages (`returns-policy`, `terms`, etc.) |
| `/track-order` | Query: `orderNumber`, `phone` | Public | Order lookup requiring matching order number & phone |
| `/order/[id]` | `id` (string) | Public with Gate | Confirmation & tracking (HMAC token or phone challenge) |

---

### Panel B: Signed-In Customer Dashboard (`/dashboard/*`)
*Layout: `src/app/(customer)/dashboard/layout.tsx` (Customer Topbar, Customer Sidebar Drawer, "Back to Store" Link)*

| Canonical Route | Compatibility Alias | Access Level | Description |
|---|---|---|---|
| `/dashboard` | `/account` | Authenticated CUSTOMER | Account overview, quick stats, latest order summary |
| `/dashboard/orders` | `/account/orders` | Authenticated CUSTOMER | Complete paginated personal order history |
| `/dashboard/orders/[orderId]` | `/account/orders/[id]` | Authenticated CUSTOMER | Single order detail (DB-scoped by `userId === session.user.id`) |
| `/dashboard/addresses` | `/account/addresses` | Authenticated CUSTOMER | Shipping address book management |
| `/dashboard/profile` | `/account/profile` | Authenticated CUSTOMER | Profile details and password change |
| `/dashboard/rewards` | `/account/rewards` | Authenticated CUSTOMER | Rewards & loyalty status notice |

---

### Panel C: Staff/Admin/Super-Admin Console (`/admin/*`)
*Layout: `src/app/admin/layout.tsx` (Admin Topbar, Role-aware Management Sidebar, "View Storefront" Link)*

| Canonical Route | Compatibility Alias | Access Level | Description |
|---|---|---|---|
| `/admin/dashboard` | `/admin` | STAFF, ADMIN, SUPER_ADMIN | Operational KPIs, pending queues, daily order activity |
| `/admin/products` | None | ADMIN, SUPER_ADMIN | Product catalog listing, creation, and updates |
| `/admin/orders` | None | STAFF, ADMIN, SUPER_ADMIN | Order fulfillment, MFS verification, defect refusal, refunds |
| `/admin/inventory` | None | ADMIN, SUPER_ADMIN | Warehouse stock adjustments and SKU ledger |
| `/admin/coupons` | None | ADMIN, SUPER_ADMIN | Promo coupons, discount percentages, and validity dates |
| `/admin/settings` | None | ADMIN, SUPER_ADMIN | Store delivery rates, hotline, and announcement banner |
| `/admin/staff` | None | SUPER_ADMIN only | Staff directory, account provisioning, and role assignment |
| `/admin/audit-logs` | None | SUPER_ADMIN only | Security-sensitive action history and operational audit trail |

---

### Panel D: Authentication Flow (`/(auth)/*`)
*Layout: `src/app/(auth)/layout.tsx` (Clean, Focused Auth Container with Brand Identity)*

| Route | Access Level | Post-Login Target | Description |
|---|---|---|---|
| `/login` | Public (Guest) | CUSTOMER -> `/dashboard`<br>STAFF/ADMIN -> `/admin/dashboard` | Credentials login via BD phone or email |
| `/register` | Public (Guest) | `/dashboard` | New customer registration |
| `/forgot-password` | Public (Guest) | N/A | Phone & WhatsApp recovery hotline assistance |

---

## 2. Compatibility Redirect Rules

All legacy routes are preserved with transparent server-side redirects to guarantee zero broken links or external bookmark failures:

```ts
// src/middleware.ts & route handlers
/account              -> /dashboard
/account/orders       -> /dashboard/orders
/account/addresses    -> /dashboard/addresses
/account/profile      -> /dashboard/profile
/account/rewards      -> /dashboard/rewards
/account/orders/:id   -> /dashboard/orders/:id
/admin                -> /admin/dashboard
/dashboard/user       -> /dashboard
```

---

## 3. Data Ownership & URL Isolation Guarantee

1. `/dashboard/orders/[orderId]`:
   - Query: `db.order.findFirst({ where: { id: orderId, userId: session.user.id } })`
   - If no match found: Returns HTTP 404 or safe redirect without revealing whether the order exists.
2. `/admin/orders/[orderId]`:
   - Query: Protected by `requireStaff()` or `requireAdmin()` on the server.
   - Internal staff notes and courier remittance reconciliation metadata are only returned to privileged roles.
3. No cross-surface UI leakage:
   - Zero storefront announcement banners or cart drawers on `/dashboard/*` or `/admin/*`.
   - Zero admin navigation or management sidebars on `/` or `/dashboard/*`.
