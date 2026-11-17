# Error Resilience & Failure Recovery Audit (ERROR_RECOVERY_AUDIT.md)

This document records the resilience testing and failure recovery workflows evaluated across **Khelna Bazar**.

---

## 1. Failure Scenarios & Recovery Workflows

### Scenario 1: Network Timeout or Double Submit During Checkout
* **Risk**: Network latency causes the customer to tap "Place Order" repeatedly, risking duplicate orders and double inventory decrements.
* **Mechanism**:
  - `src/app/checkout/page.tsx` generates an `idempotencyKey` stored in a `useRef`.
  - The submit button enters a disabled loading state (`isSubmitting=true`).
  - `src/server/actions/order-actions.ts` checks `db.order.findUnique({ where: { idempotencyKey } })` before initiating the order transaction.
* **Outcome**:
  - The server returns the existing order record with `isDuplicate: true` and the valid `orderAccessToken`.
  - Exactly **one order** is created; warehouse inventory is decremented exactly **once**.

---

### Scenario 2: Stock Depletion During Checkout (Two Users Buying Last Unit)
* **Risk**: Two customers add the last available unit of a toy to their carts simultaneously.
* **Mechanism**:
  - `placeOrder` re-fetches current variant stock inside an atomic Prisma `$transaction`.
  - If `dbVar.stock < item.quantity`, the transaction immediately throws:
    `"Insufficient stock for [Product Name]. Available: [Stock], requested: [Quantity]."`
* **Outcome**:
  - The first transaction commits and decrements stock to 0.
  - The second transaction rolls back completely with zero orphaned records.
  - The second customer receives a clear inline notification and can return to the cart.

---

### Scenario 3: Coupon Code Expiry or Threshold Invalidation
* **Risk**: A customer adds items, applies a coupon, then reduces quantity below the minimum spend threshold (e.g. ৳500), or the coupon expires before submission.
* **Mechanism**:
  - `placeOrder` independently invokes `validateCoupon` server-side against current subtotal and expiry date.
* **Outcome**:
  - Client-supplied discounts are never trusted. If invalid, the order is rejected with:
    `"Invalid coupon: Minimum spend of ৳500 required."`
  - The user can adjust quantity or remove the coupon to proceed.

---

### Scenario 4: Invalid Mobile Phone Number Entry
* **Risk**: Customer enters an invalid telephone format or foreign number.
* **Mechanism**:
  - Validated by Zod regex `/^(\+?88)?01[3-9]\d{8}$/` in both client form and server action.
* **Outcome**:
  - Displays actionable inline helper text:
    `"Please enter a valid Bangladeshi mobile number (01[3-9]XXXXXXXX)."`
  - Entered form data is preserved in state so the user only has to correct the phone number.

---

### Scenario 5: Database Temporary Disconnect During Static Build
* **Risk**: Neon database serverless connection latency during static sitemap or page generation.
* **Mechanism**:
  - Global try/catch fallbacks implemented in `sitemap.ts` and `getProducts`.
* **Outcome**:
  - Static build does not crash; routes fallback gracefully to static catalog entries.

---

## 2. Error Message Quality Standard

* **Plain Language**: Technical database error codes (`P2002`, `PrismaClientKnownRequestError`) are intercepted and translated into human-friendly explanations.
* **Actionable Next Steps**: Errors state what went wrong and how the user can resolve it (e.g., *"This coupon has expired. Please remove it to complete checkout."*).
* **Zero Stack Trace Leaks**: Production error handlers return generic sanitized messages, preventing exposure of internal database tables or server environment details.
