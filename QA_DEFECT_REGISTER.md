# Khelna Bazar — Defect Register & Resolution Log

**Audit Period:** November 18, 2026  
**Defects Logged:** 5  
**Defects Resolved:** 5 (100% Resolved)  
**Open Defects:** 0  

---

## 1. Defect Summary Table

| Defect ID | Severity | Surface / Component | Summary | Status |
|:---|:---:|:---|:---|:---:|
| **DEF-001** | **CRITICAL** | `src/server/actions/order-actions.ts` | Next.js Server Action runtime crash (500) due to non-function exports | **RESOLVED** |
| **DEF-002** | **HIGH** | `src/app/(auth)/login/page.tsx` | Staff and Admin routed to Customer Dashboard instead of Admin Console | **RESOLVED** |
| **DEF-003** | **MEDIUM** | `src/app/(store)/checkout/page.tsx` | Missing input identifiers and test IDs on checkout form fields | **RESOLVED** |
| **DEF-004** | **MEDIUM** | `src/app/admin/dashboard/page.tsx` | Catalog & Inventory action buttons visible to Staff persona | **RESOLVED** |
| **DEF-005** | **MEDIUM** | `Database Connection Pool` | PostgreSQL prepared statement collision under concurrent connection load | **RESOLVED** |

---

## 2. Comprehensive Defect Analysis & Fix Details

### DEF-001: Next.js Server Action Invalid Export Crash (500)
- **Severity:** CRITICAL (Runtime Crash / Blocker)
- **Impact:** Any attempt to invoke server actions or evaluate pages importing `order-actions.ts` resulted in a Next.js compilation exception: *"Error: A 'use server' file can only export async functions, found object."*
- **Root Cause:** Line 73 of `src/server/actions/order-actions.ts` exported `const PlaceOrderSchema = z.object(...)` and line 560 exported `const placeCodOrder = placeOrder`. Next.js App Router enforces that `"use server"` files may only export async functions.
- **Resolution:**
  1. Extracted `PlaceOrderSchema` and `type PlaceOrderInput` into a standalone schema file: `src/lib/order-schema.ts`.
  2. In `src/server/actions/order-actions.ts`, imported the schema and exported only type metadata (`export type { PlaceOrderInput }`).
  3. Replaced `const placeCodOrder = placeOrder` with an async function export:
     ```ts
     export async function placeCodOrder(input: PlaceOrderInput) {
       return placeOrder(input);
     }
     ```
- **Verification:** Verified via TypeScript build (`tsc --noEmit`), Vitest suite (`order-logic.test.ts`), and production Next.js build (`next build`). Status: **PASS**.

---

### DEF-002: Role-Based Landing Redirection Failure
- **Severity:** HIGH (Routing & Layout Leakage Risk)
- **Impact:** When a Staff or Admin user authenticated via `/login`, the client component unconditionally redirected them to `/dashboard` (the Customer Portal). Although middleware redirected them back to `/admin/dashboard`, it created an unnecessary double-hop and potential flash of unstyled customer content.
- **Root Cause:** `src/app/(auth)/login/page.tsx` had hardcoded `router.push("/dashboard")` regardless of the user's role.
- **Resolution:** Updated `handleLogin` to inspect `session.user.role`:
  ```ts
  const session = await getSession();
  const isPrivileged = session?.user?.role && session.user.role !== "CUSTOMER";

  if (safeRedirect) {
    router.push(safeRedirect);
  } else if (isPrivileged) {
    router.push("/admin/dashboard");
  } else {
    router.push("/dashboard");
  }
  ```
- **Verification:** Tested across Staff, Admin, and Super Admin personas in `tests/e2e/autonomous-qa.ts`. All landed directly on `/admin/dashboard`. Status: **PASS**.

---

### DEF-003: Checkout Form Attribute Accessibility & Test Binding
- **Severity:** MEDIUM (Form Semantics & Accessibility)
- **Impact:** Automation tools, screen readers, and autofill managers were unable to bind cleanly to the customer name, phone, and inspection consent inputs due to missing `name` and `id` attributes.
- **Root Cause:** Input elements relied solely on React state handlers (`onChange`) without semantic HTML form attributes.
- **Resolution:** Added explicit `id`, `name`, and `data-testid` attributes to:
  - `fullName` (`id="fullName" name="fullName" data-testid="checkout-fullname"`)
  - `phone` (`id="phone" name="phone" data-testid="checkout-phone"`)
  - `inspectionConsent` (`id="inspectionConsent" name="inspectionConsent" data-testid="checkout-inspection-consent"`)
- **Verification:** Verified in Playwright E2E and interactive component audit. Status: **PASS**.

---

### DEF-004: Dashboard Action Link Privilege Leakage
- **Severity:** MEDIUM (UI Least Privilege Violation)
- **Impact:** Staff members viewing the Management Console overview (`/admin/dashboard`) saw the "Add New Toy" button (linking to `/admin/products`) and "Restock" button (linking to `/admin/inventory`), despite lacking permissions to manage catalog or warehouse stock.
- **Root Cause:** Buttons in `src/app/admin/dashboard/page.tsx` rendered unconditionally.
- **Resolution:** Gated buttons behind role check:
  ```tsx
  const { data: session } = useSession();
  const userRole = session?.user?.role;
  const isAdminOrSuper = userRole === "ADMIN" || userRole === "SUPER_ADMIN";

  {isAdminOrSuper && (
    <Link href="/admin/products">
      <Button ...>Add New Toy</Button>
    </Link>
  )}
  ```
- **Verification:** Verified in Staff Least Privilege test (`STAFF-001`). Staff sidebar and dashboard omit unauthorized action links. Status: **PASS**.

---

### DEF-005: PostgreSQL Statement Caching Pool Collision
- **Severity:** MEDIUM (Database Driver Concurrency)
- **Impact:** When multiple concurrent Prisma requests hit the connection pool, PostgreSQL threw `prepared statement "s0" already exists` (code 42P05) or `prepared statement does not exist` (code 26000).
- **Root Cause:** Default Prisma query engine prepared statements in connection pool proxies without PgBouncer statement cache bypass.
- **Resolution:** Appended `?pgbouncer=true&statement_cache_size=0&connection_limit=1` to database connection strings in `.env` and `.env.local`.
- **Verification:** 100% of Prisma queries in E2E runs and build generation executed without driver exceptions. Status: **PASS**.
