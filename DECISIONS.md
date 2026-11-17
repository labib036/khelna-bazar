# Architectural, Engineering & Policy Decisions (DECISIONS.md)

This document records the definitive architectural decisions, conflict resolutions, and engineering policies for **KHELNA BAZAR (খেলনা বাজার)**, addressing conflicts between the original placeholder work order and the production-grade Bangladesh e-commerce platform.

---

## 1. Conflict Register: Original Work Order vs. Bangladesh Reality

| Dimension | Original Work Order Spec | Khelna Bazar Implementation | Rationale & Architectural Choice |
| :--- | :--- | :--- | :--- |
| **Brand Identity** | "PlayNest" (generic US placeholder) | **Khelna Bazar (খেলনা বাজার)** | Authentic domestic Bangladesh toy marketplace branding with bilingual English/Bengali typography. |
| **Currency** | USD ($) with cents | **BDT (৳)** Bangladeshi Taka | Native domestic currency. Integer minor units stored safely to prevent floating-point inaccuracies. |
| **Payment Model** | Stripe + credit card webhooks + COD | **Strict Cash on Delivery (COD)** nationwide + optional manual MFS (bKash/Nagad verification) | 90%+ of Bangladesh e-commerce operates on cash at doorstep. No online card gateway is enabled without explicit merchant credentials. |
| **Free Delivery Threshold** | $35 / ৳2,000 in early notes | **৳1,500 nationwide** | Harmonized across `siteConfig.ts`, database `StoreSettings`, free delivery progress bars, and test suite. |
| **Shipping Fees** | US domestic rates | **Inside Dhaka: ৳60**<br>**Outside Dhaka: ৳120**<br>**Express Dhaka: ৳150** | Standard courier pricing (Steadfast, Pathao, RedX) reflected in server-side calculation. |
| **Framework Version** | Next.js 15 | **Next.js 16.4.6 (Turbopack)** | Native Turbopack builds, React 19 compatibility, improved memory footprint and build speeds. |
| **Customer Addresses** | Unspecified / localStorage | **Relational PostgreSQL `Address` model** with server action mutations | Guarantees multi-device sync, maximum 10 addresses per user, and strict customer ownership guards. |
| **Order Details Access** | Direct lookup by ID | **Cryptographic `orderAccessToken` + Phone Verification** | Eliminates IDOR vulnerabilities. Guests and customers cannot guess or enumerate order numbers. |
| **Returns & Warranties** | 30-Day US policy | **7-Day Easy Replacement / Returns** | Realistic policy for missing components or manufacturing defects in child toys. |
| **Social Proof Policy** | Hardcoded demo testimonials | **Strict Zero Fake Content Policy** | Prohibits fabricated reviews, fake buyer counts, or artificial stock scarcity. Real reviews only. |

---

## 2. Security & Authorization Architecture

### 2.1 Server Action Guards (OWASP Top 10 Compliance)
Every Next.js server mutation executes a 4-step security pipeline:
1. **Authentication**: Resolves server-side session via `auth()`.
2. **Authorization**: Validates role (`ADMIN`, `STAFF`, `CUSTOMER`) or customer ownership (`userId === session.user.id`).
3. **Input Validation**: Parses arguments strictly through Zod schemas.
4. **Transactional Mutation**: Executes updates inside Prisma `$transaction` blocks to ensure atomicity.

### 2.2 IDOR Elimination (`fetchOrderDetails`)
- **Admin / Staff**: Can inspect any order for operational fulfillment and customer support.
- **Logged-in Customer**: Can only inspect orders where `order.userId === session.user.id`.
- **Guest Shopper**: Allowed access only with a cryptographically signed HMAC-SHA256 token (`generateOrderAccessToken(order.id, order.orderNumber)`) generated at checkout, or by providing the matching phone number used during checkout.
- **Unverified Access**: Returns `null` without leaking customer personal data.

---

## 3. Financial Integrity & State Separation

### 3.1 Order Lifecycle vs. Cash Collection
- **Fulfillment Status**: `PENDING_CONFIRMATION` &rarr; `CONFIRMED` &rarr; `PROCESSING` &rarr; `PACKED` &rarr; `SHIPPED` &rarr; `OUT_FOR_DELIVERY` &rarr; `DELIVERED` (or `CANCELLED`).
- **COD Collection Status**: `UNCOLLECTED` &rarr; `COLLECTED` (or `DISCREPANCY`, `REFUNDED`).
- Marking an order delivered does not automatically mark cash collected; courier settlement requires an explicit administrative reconciliation action.

### 3.2 Inventory Concurrency & Rollbacks
- Decrements are executed in an atomic transaction at checkout.
- Order cancellation automatically restocks inventory and creates an immutable audit trail (`StockMovement` and `OrderEvent`).

---

## 4. Design System & Accessibility (WCAG 2.2 AA)
- Primary palette mathematically tested for $\ge 4.5:1$ contrast against light (`#C2410C`) and dark (`#FF6A22`) backgrounds.
- Explicit inline gradient styles with solid background fallbacks to eliminate any browser or CSS engine gradient rendering defects.
- Full keyboard operability and accessible names across all buttons and icon controls.
