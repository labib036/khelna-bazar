# Khelna Bazar — Role Permission Matrix & Authorization Policy

**Date:** November 17, 2026  
**Security Model:** Defense-in-Depth (Middleware + Server Actions + Database Query Scoping)

---

## 1. Role Definitions

| Role | Target Persona | Scope of Authority |
|---|---|---|
| **GUEST** | Unauthenticated visitor | Browse public catalog, search, add to cart, guest checkout (COD/MFS), track order with HMAC token or matching phone number. |
| **CUSTOMER** | Authenticated shopper | Full public storefront access plus personal Customer Dashboard (`/dashboard/*`). Read/mutate only own profile, addresses, and orders. |
| **STAFF** | Warehouse & support staff | View operational orders (`/admin/orders`), update fulfillment states, verify or reject manual MFS payments, record delivery refusals. |
| **ADMIN** | Store operations manager | All STAFF capabilities plus catalog management (`/admin/products`), stock adjustments (`/admin/inventory`), coupons (`/admin/coupons`), and store settings (`/admin/settings`). |
| **SUPER_ADMIN** | Store owner / root admin | All ADMIN capabilities plus staff account provisioning, role promotions/demotions (`/admin/staff`), and audit log inspection (`/admin/audit-logs`). |

---

## 2. Capability Matrix Across Routes & Surfaces

| Feature / Surface | GUEST | CUSTOMER | STAFF | ADMIN | SUPER_ADMIN |
|---|:---:|:---:|:---:|:---:|:---:|
| **Public Storefront** (`/`, `/c/*`, `/p/*`) | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Cart & Checkout** (`/cart`, `/checkout`) | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Guest Order Lookup** (`/track-order`) | ✅ (Phone+No) | ✅ | ✅ | ✅ | ✅ |
| **Customer Dashboard** (`/dashboard`) | ❌ (Redirect) | ✅ | ❌ | ❌ | ❌ |
| **Customer Order History** (`/dashboard/orders`) | ❌ | ✅ (Own only) | ❌ | ❌ | ❌ |
| **Customer Addresses** (`/dashboard/addresses`) | ❌ | ✅ (Own only) | ❌ | ❌ | ❌ |
| **Admin Overview** (`/admin/dashboard`) | ❌ (Redirect) | ❌ (Forbidden) | ✅ | ✅ | ✅ |
| **Order Fulfillment** (`/admin/orders`) | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Verify / Reject MFS Payment** | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Record Defective Refusal & Restock** | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Record Financial Refund** | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Reconcile COD Cash** | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Manage Catalog** (`/admin/products`) | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Warehouse Inventory** (`/admin/inventory`) | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Coupons & Discounts** (`/admin/coupons`) | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Store & Delivery Settings** (`/admin/settings`) | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Staff & Role Management** (`/admin/staff`) | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Security Audit Logs** (`/admin/audit-logs`) | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 3. Server Authorization Guard Specifications

All server-side operations are enforced via centralized helpers in `src/lib/authorization-guards.ts`:

```ts
/**
 * Ensures user is authenticated; returns validated session user.
 */
export async function requireAuthenticatedUser();

/**
 * Ensures user is a CUSTOMER; throws/redirects if unauthenticated or staff/admin.
 */
export async function requireCustomer();

/**
 * Ensures user is STAFF, ADMIN, or SUPER_ADMIN.
 */
export async function requireStaff();

/**
 * Ensures user is ADMIN or SUPER_ADMIN.
 */
export async function requireAdmin();

/**
 * Ensures user is SUPER_ADMIN strictly.
 */
export async function requireSuperAdmin();
```

---

## 4. Defense-in-Depth Implementation Layers

1. **Layer 1: Edge / Middleware Routing (`src/middleware.ts`):**
   - Unauthenticated access to `/dashboard/*` redirects to `/login?next=...`.
   - Unauthenticated access to `/admin/*` redirects to `/login?next=...`.
   - Authenticated non-staff access to `/admin/*` is rejected and redirected to `/dashboard`.
   - Settings page restricted to `ADMIN` and `SUPER_ADMIN`.
   - Staff/audit-log pages restricted strictly to `SUPER_ADMIN`.
2. **Layer 2: Server Component Guard:**
   - Server pages invoke the appropriate guard before executing database queries.
3. **Layer 3: Server Action & API Mutation Guard:**
   - Every server action independently invokes the guard; requests missing valid sessions fail with `{ success: false, error: "Unauthorized" }`.
4. **Layer 4: Database Query Scoping:**
   - All customer data reads and mutations include `where: { userId: session.user.id }`.
   - IDOR attempts return 404 or authorization errors without leaking record existence.
