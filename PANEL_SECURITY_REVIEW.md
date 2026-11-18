# Khelna Bazar — Panel Security & Authorization Review

**Date:** November 18, 2026  
**Security Architecture:** Multi-Layer Defense-in-Depth (Edge Middleware + Server Guards + Database Scoping)  
**Status:** Audit Completed · Zero High / Critical Vulnerabilities

---

## 1. Threat Model & Security Boundaries

Khelna Bazar operates three distinct application surfaces on a single origin. The security boundary model enforces isolation across:
1. **Public Anonymous Surface:** Unauthenticated visitors browsing toys, placing guest COD/MFS orders, and tracking parcels.
2. **Authenticated Customer Surface (`/dashboard/*`):** Shoppers accessing their own order history, saved addresses, and profile details.
3. **Operational Administrative Surface (`/admin/*`):** Internal warehouse staff, store managers, and executive super-administrators.

---

## 2. Layer 1: Edge Middleware Protection (`src/middleware.ts`)

The edge middleware provides the first line of defense before request handling or page rendering begins:

```ts
// src/middleware.ts policy enforcement:
1. /dashboard/* -> Requires authenticated user. If unauthenticated, redirects to /login?next=...
2. /admin/*     -> Requires authenticated user with role in ['STAFF', 'ADMIN', 'SUPER_ADMIN'].
                   If non-staff (CUSTOMER), redirects to /dashboard.
3. /admin/settings -> Requires ADMIN or SUPER_ADMIN.
4. /admin/staff & /admin/audit-logs -> Requires SUPER_ADMIN.
```

### Open Redirect Defense:
All authentication redirect parameters (`?next=...`) are strictly sanitized to prevent open-redirect attacks:
- External protocols (`http://`, `https://`, `ftp://`) and scheme-relative URLs (`//evil.com`) are rejected.
- Only relative paths starting with a single forward slash (`/`) are accepted as valid post-login destinations.

---

## 3. Layer 2: Server-Side Authorization Guards (`src/lib/authorization-guards.ts`)

Edge middleware alone is insufficient for robust security because Server Actions and API endpoints can be invoked directly. Therefore, every server action and page component enforces server-side guard execution:

| Guard Function | Target Namespace / Action | Minimum Permitted Role | Failure Action |
|---|---|---|---|
| `requireCustomer()` | `/dashboard/*` | `CUSTOMER` | Redirects unauthenticated to `/login`, redirects staff to `/admin/dashboard` |
| `requireStaff()` | `/admin/orders`, `/admin/dashboard` | `STAFF`, `ADMIN`, `SUPER_ADMIN` | Redirects customers to `/dashboard` |
| `requireAdmin()` | `/admin/products`, `/admin/inventory`, `/admin/coupons`, `/admin/settings` | `ADMIN`, `SUPER_ADMIN` | Redirects staff to `/admin/dashboard` |
| `requireSuperAdmin()` | `/admin/staff`, `/admin/audit-logs`, Staff CRUD actions | `SUPER_ADMIN` | Redirects staff/admin to `/admin/dashboard` |

### Zero Client Trust:
Permissions and roles are NEVER read from client request payloads, cookies, or headers directly. They are resolved strictly through the cryptographically signed server session (`auth()`) backed by PostgreSQL user records.

---

## 4. Layer 3: Database Query Ownership Scoping (Zero IDOR)

Insecure Direct Object Reference (IDOR) vulnerabilities are eliminated at the database query level:

### Customer Dashboard Scoping:
- **Order Retrieval:**
  ```ts
  // Single order lookup enforces user ownership
  const order = await db.order.findFirst({
    where: {
      id: orderId,
      userId: session.user.id, // Mandatory ownership clause
    },
  });
  if (!order) return notFound();
  ```
- **Address Book Management:**
  ```ts
  // Customer address updates only target addresses owned by the caller
  await db.address.updateMany({
    where: {
      id: addressId,
      userId: session.user.id, // Prevents tampering with other customers' addresses
    },
    data: { ... },
  });
  ```
- **Order Cancellation:**
  ```ts
  // Only the customer who placed the order can cancel it while PENDING_CONFIRMATION
  await db.order.updateMany({
    where: {
      id: orderId,
      userId: session.user.id,
      status: "PENDING_CONFIRMATION",
    },
    data: { status: "CANCELLED" },
  });
  ```

### Public Guest Tracking Scoping:
- The `/track-order` endpoint prevents guessing sequential order numbers. It requires an exact match of **both** `orderNumber` AND the customer's `phone` number before disclosing fulfillment milestones.

---

## 5. Super Admin Protections & Audit Trail

1. **Self-Demotion Lockout:**
   The `updateStaffRoleAction` prevents a Super Admin from demoting their own account if they are the acting administrator, ensuring the system cannot accidentally enter a state with zero root administrators.

2. **Immutable Audit Logging:**
   Every administrative action (staff provisioning, role modification, product deletion, settings update) writes an immutable record to the `AuditLog` table containing:
   - `actorId` and `actorEmail`
   - `action` (e.g. `STAFF_PROVISIONED`, `STAFF_ROLE_CHANGE`, `PRODUCT_DELETED`)
   - `entityType` and `entityId`
   - `before` and `after` state snapshots in JSON format
   - Creation timestamp and IP address

---

## 6. Security Audit Findings & Vulnerability Matrix

| Vulnerability Class | Risk Level | Mitigation Status | Verification Evidence |
|---|:---:|:---:|---|
| **Storefront Layout Bleed** | High | Resolved | Isolated `(store)/layout.tsx` separated from `/dashboard` and `/admin` |
| **IDOR in Customer Orders** | Critical | Resolved | Database queries strictly scoped by `userId === session.user.id` |
| **Staff Privilege Escalation** | Critical | Resolved | Role hierarchy enforced in middleware and server actions (`requireSuperAdmin`) |
| **Open Redirect via ?next=** | Medium | Resolved | Whitelist validation for relative paths starting with `/` |
| **Brute-Force Staff Logins** | Medium | Mitigated | bcryptjs (12 rounds) + NextAuth token encryption |
| **Data Leak in Public Track** | Medium | Resolved | Dual-factor match (`orderNumber` + `phone`) required |

**Conclusion:** The three-panel architecture fulfills all production security criteria with zero open vulnerabilities.
