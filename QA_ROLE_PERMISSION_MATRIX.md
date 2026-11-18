# Khelna Bazar — Role & Permission Enforcement Matrix

**Audit Date:** November 18, 2026  
**Roles Tested:** Guest, Customer, Staff, Admin, Super Admin  
**Security Baseline:** Principle of Least Privilege + Strict Role-Based Access Control (RBAC) + Zero IDOR  

---

## 1. Permission Matrix by Role

| Operational Capability | Guest | Customer | Staff | Admin | Super Admin | Enforcement Level |
|:---|:---:|:---:|:---:|:---:|:---:|:---|
| **Browse Catalog & Products** | ✅ ALLOW | ✅ ALLOW | ✅ ALLOW | ✅ ALLOW | ✅ ALLOW | Public Storefront Route |
| **Add to Cart & Checkout (COD / MFS)** | ✅ ALLOW | ✅ ALLOW | 🚫 N/A | 🚫 N/A | 🚫 N/A | Checkout Server Action |
| **Public Order Tracking (Dual Factor)** | ✅ ALLOW | ✅ ALLOW | ✅ ALLOW | ✅ ALLOW | ✅ ALLOW | Phone + Order # Verification |
| **Customer Dashboard (`/dashboard`)** | 🚫 DENY (401) | ✅ ALLOW | 🔄 REDIRECT | 🔄 REDIRECT | 🔄 REDIRECT | Next.js Middleware (`src/middleware.ts`) |
| **View Own Orders (`/dashboard/orders/[id]`)** | 🚫 DENY | ✅ ALLOW | 🚫 N/A | 🚫 N/A | 🚫 N/A | Database Query Scoping (`order.userId`) |
| **View Other Customer's Order (IDOR Attack)**| 🚫 DENY | 🚫 DENY (404) | 🚫 N/A | 🚫 N/A | 🚫 N/A | Server Component 404 Guard (`SEC-001`) |
| **Admin Console Access (`/admin/dashboard`)**| 🚫 DENY (401) | 🚫 DENY (307) | ✅ ALLOW | ✅ ALLOW | ✅ ALLOW | Middleware Role Check |
| **Fulfill Orders & COD Cash (`/admin/orders`)** | 🚫 DENY | 🚫 DENY | ✅ ALLOW | ✅ ALLOW | ✅ ALLOW | Staff Operational Scope |
| **Manage Product Catalog (`/admin/products`)** | 🚫 DENY | 🚫 DENY | 🚫 DENY (307) | ✅ ALLOW | ✅ ALLOW | Middleware + UI Layout Gating |
| **Adjust Inventory Stock (`/admin/inventory`)**| 🚫 DENY | 🚫 DENY | 🚫 DENY (307) | ✅ ALLOW | ✅ ALLOW | Middleware + UI Layout Gating |
| **Create Coupons (`/admin/coupons`)** | 🚫 DENY | 🚫 DENY | 🚫 DENY (307) | ✅ ALLOW | ✅ ALLOW | Middleware + UI Layout Gating |
| **Configure Delivery Rates (`/admin/settings`)**| 🚫 DENY | 🚫 DENY | 🚫 DENY (307) | ✅ ALLOW | ✅ ALLOW | Middleware Role Policy (`ADMIN+`) |
| **Provision Staff Accounts (`/admin/staff`)** | 🚫 DENY | 🚫 DENY | 🚫 DENY (307) | 🚫 DENY (307) | ✅ ALLOW | Middleware Policy (`SUPER_ADMIN` only) |
| **Inspect Security Audit Logs (`/admin/audit-logs`)**| 🚫 DENY | 🚫 DENY | 🚫 DENY (307) | 🚫 DENY (307) | ✅ ALLOW | Middleware Policy (`SUPER_ADMIN` only) |

---

## 2. Persona Test Scenarios & Observed Defenses

### 2.1 Customer Isolation & Zero IDOR
- **Target Attack:** Customer B (`qa.customer.b@example.test`) directly requests Customer A's private order (`/dashboard/orders/cmwl8hldg000aolb0xy88zf1x`).
- **Observed Defense:** Server component executes strict owner comparison:
  ```ts
  if (!order || order.userId !== session.user.id) {
    notFound();
  }
  ```
- **Outcome:** HTTP 404 Not Found returned. Zero data leaked across customer boundaries.

### 2.2 Staff Privilege Isolation
- **Target Attack:** Staff member (`qa.staff@example.test`) attempts to navigate to `/admin/settings` or `/admin/staff`.
- **Observed Defense:** Middleware intercepts request before rendering:
  ```ts
  if (pathname.startsWith("/admin/settings") && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
    return NextResponse.redirect(new URL("/admin/dashboard", req.url));
  }
  ```
- **Outcome:** Redirected back to `/admin/dashboard`. Navigation tabs for Catalog, Inventory, Coupons, Settings, Staff, and Audit Logs are omitted from the Staff sidebar.

### 2.3 Super Admin Boundary Protection
- **Target Attack:** Regular Admin (`qa.admin@example.test`) attempts to provision accounts at `/admin/staff` or view tamper-evident records at `/admin/audit-logs`.
- **Observed Defense:** Middleware checks `user.role === "SUPER_ADMIN"`.
- **Outcome:** Regular Admin is redirected to `/admin/dashboard`. Only Super Admin has write permissions to staff credentials.
