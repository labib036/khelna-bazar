# Testing & Quality Assurance Guide (TESTING.md)

This document provides reproducible commands, test account personas, and execution instructions for validating **Khelna Bazar**.

---

## 1. Quick Verification Commands

Run the complete automated quality suite in order:

```bash
# 1. Validate Prisma database schema
$env:DATABASE_URL="postgresql://postgres:postgres@localhost:5432/khelna_bazar"; $env:DIRECT_URL="postgresql://postgres:postgres@localhost:5432/khelna_bazar"; npx prisma validate

# 2. Strict TypeScript typechecking (Assert 0 errors)
npx tsc --noEmit

# 3. Code quality and ESLint audit (Assert 0 warnings, 0 errors)
npm run lint

# 4. Automated Unit & Integration test suite (Vitest - 61/61 tests passing)
npm test

# 5. Production Next.js Turbopack build (25/25 routes prerendered)
$env:DATABASE_URL="postgresql://postgres:postgres@localhost:5432/khelna_bazar"; $env:DIRECT_URL="postgresql://postgres:postgres@localhost:5432/khelna_bazar"; $env:AUTH_SECRET="build-secret-1234567890123456789012"; $env:NEXT_PUBLIC_SITE_URL="https://khelnabazar.com.bd"; npx next build
```

---

## 2. Test Personas & Synthetic Accounts

To test role boundaries, IDOR, and permission gates without risking production data, use these synthetic test personas:

| Persona | Role | Synthetic Identifier | Purpose / Scope |
| :--- | :--- | :--- | :--- |
| **Guest Shopper** | Unauthenticated | Anonymous session | Browse catalog, add to cart, guest COD checkout with token-gated order tracking. |
| **Customer A** | `CUSTOMER` | `01711111111` / `customer_a@example.com` | Regular buyer. Owns orders, saved delivery addresses, and PlayPoints loyalty points. |
| **Customer B** | `CUSTOMER` | `01822222222` / `customer_b@example.com` | Malicious / adversarial buyer persona used for IDOR verification against Customer A's data. |
| **Staff Member** | `STAFF` | `staff_ops@khelnabazar.com.bd` | Warehouse & dispatch manager. Permitted to advance order status, view orders, and restock inventory; forbidden from COD cash reconciliation, coupon creation, or deleting products. |
| **Store Administrator**| `ADMIN` | `admin@khelnabazar.com.bd` | Complete operational control. Permitted to reconcile COD finances, manage coupons, edit global shipping settings, and delete products. |

> [!IMPORTANT]
> Never hardcode or commit actual customer phone numbers or real administrative passwords to version control.

---

## 3. Automated Test Suite Architecture (`tests/unit/`)

The test suite runs under Vitest and consists of 8 comprehensive test files:

1. **`authorization-guards.test.ts` (19 tests)**:
   - Validates that unauthenticated requests to `updateOrderStatus`, `updateCodStatus`, `saveProduct`, `deleteProduct`, `restockSku`, `createCoupon`, `toggleCouponActive`, `deleteCoupon`, and `saveSettings` are rejected.
   - Validates that Customer role cannot escalate privileges.
   - Validates that Staff role cannot alter COD cash status, delete products, create coupons, or modify settings.

2. **`order-idor.test.ts` (9 tests)**:
   - Validates that anonymous callers cannot view customer orders by guessing order IDs.
   - Validates that Customer B is blocked from viewing Customer A's orders.
   - Validates that Customer A can view Customer A's own orders.
   - Validates that Guests can only view orders using a cryptographically signed HMAC `orderAccessToken` or verified matching phone number.
   - Validates Admin and Staff oversight access.

3. **`address-validation.test.ts` (7 tests)**:
   - Validates customer authentication on address persistence.
   - Validates Bangladeshi phone number format requirements.
   - Validates minimum street address lengths.
   - Validates that Customer B cannot update, delete, or modify Customer A's saved addresses.
   - Validates that customers can only view their own address book.

4. **`order-logic.test.ts` (8 tests)**:
   - Validates BDT currency formatting (`formatPrice`).
   - Validates discount percentage rounding.
   - Validates Dhaka vs. Outside Dhaka shipping rates.
   - Validates Free Shipping unlock at ৳1,500 threshold.
   - Validates human-readable order number generation (`KB-YYMM-XXXXXX`).
   - Validates COD fulfillment states and cash collection separation.

5. **`auth-utils.test.ts` (6 tests)**:
   - Validates Bangladeshi mobile phone normalization (`+8801...`, `8801...`, spaces).
   - Validates carrier detection (Grameenphone, Banglalink, Robi, Airtel, Teletalk).

6. **`coupon-discount.test.ts` (4 tests)**:
   - Validates percentage discount calculation.
   - Validates fixed discount calculation.
   - Validates free shipping coupons.
   - Validates minimum spend threshold rejection.

7. **`launch-guard.test.ts` (5 tests)**:
   - Validates production configuration safety gates.
   - Rejects placeholder `AUTH_SECRET`, localhost URLs, or missing database strings.

8. **`i18n.test.ts` (3 tests)**:
   - Validates key parity between English and Bengali dictionaries.
   - Validates numeric glyph conversions to Bengali numerals (০-৯).

---

## 4. Manual Verification Workflows

### Workflow A: Guest Cash on Delivery (COD) Journey
1. Navigate to `http://localhost:3000/`.
2. Inspect hero banner: verify dark orange multi-stop gradient background and crisp amber / white CTA buttons.
3. Click "Shop Building Sets" &rarr; navigate to `/c/building-blocks`.
4. Click a product &rarr; select variant &rarr; click "Add to Bag".
5. Mini-cart drawer slides out. Inspect Free Shipping Meter (tracks towards ৳1,500).
6. Click "Proceed to Checkout" &rarr; navigate to `/checkout`.
7. Enter synthetic details:
   - Full Name: `Rakib Hassan`
   - Mobile: `01712345678`
   - District: `Dhaka`
   - Area: `Mirpur-10`
   - Full Address: `House 5, Road 2, Block C`
8. Select "Cash on Delivery (COD)".
9. Click "Place Order (Cash on Delivery)".
10. Verify redirect to `/order/KB-XXXX-XXXXXX?success=1&token=...`.
11. Verify confetti burst (unless user system has `prefers-reduced-motion` enabled).
12. Inspect invoice summary, tracking step pipeline, and confirmation details.

### Workflow B: Address Book Multi-Device Persistence
1. Navigate to `/login`.
2. Sign in as Customer A (`customer_a@example.com`).
3. Navigate to `/account/addresses`.
4. Click "Add New Address". Enter label "Home", name, valid BD phone, division, and full street address.
5. Click "Save Address".
6. Verify optimistic card insertion and database persistence.
7. Open address book in an incognito window or alternate browser &rarr; verify the saved address is present.
