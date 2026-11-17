# QA & Engineering Changelog (CHANGELOG_QA.md)

All notable changes, bug fixes, security hardening, and documentation deliverables applied to Khelna Bazar during the autonomous overnight engineering session.

---

## [Unreleased] - Branch: `overnight-qa-hardening`

### Security & IDOR Hardening (P0 / P1)
- **`src/lib/order-token.ts`** (Added): Implemented cryptographic HMAC-SHA256 order access token generator and constant-time validator (`generateOrderAccessToken`, `verifyOrderAccessToken`).
- **`src/server/actions/order-actions.ts`**:
  - Gated `fetchOrderDetails` against IDOR vulnerabilities: validates Admin/Staff role, customer ownership, cryptographic HMAC order token, or verified matching phone number.
  - Added role guards (`ADMIN` or `STAFF`) to `updateOrderStatus`.
  - Added role guards (`ADMIN` only) to `updateCodStatus` for financial reconciliation integrity.
  - Added `token` to `placeOrder` return payload for secure guest checkout redirects.
- **`src/server/actions/product-actions.ts`**: Added `ADMIN` and `STAFF` session validation to `saveProduct` and `deleteProduct` (Admin only).
- **`src/server/actions/inventory-actions.ts`**: Added `ADMIN` and `STAFF` session checks to `restockSku`.
- **`src/server/actions/coupon-actions.ts`**: Added `ADMIN` session checks to `createCoupon`, `toggleCouponActive`, and `deleteCoupon`.
- **`src/server/actions/settings-actions.ts`**: Added `ADMIN` session checks to `saveSettings`.

### Data Persistence (P2)
- **`src/server/actions/address-actions.ts`** (Added): Implemented relational database-backed address management (`getUserAddresses`, `saveAddress`, `deleteAddress`, `setDefaultAddress`) enforcing ownership checks and a 10-address safety cap.
- **`src/app/account/addresses/page.tsx`**: Migrated address management from browser-only `localStorage` to database server actions with optimistic UI and fallback.

### Visual Contrast & Design System Polish (P2 / P3)
- **`src/components/store/home-hero-slider.tsx`**:
  - Replaced dynamic Tailwind class string interpolation with explicit inline CSS linear gradients and solid background fallbacks (`#C2410C`, `#0284C7`, `#D97706`).
  - Restyled primary CTA button with high-contrast amber-400 and black text (`bg-amber-400 text-stone-950 font-black`).
  - Restyled secondary CTA button with solid white, deep black text, and 2px border (`bg-white text-stone-950 font-black border-2 border-white`).
  - Added text drop-shadows and high-contrast badge styling.
- **`src/app/(auth)/login/page.tsx`** & **`src/app/(auth)/register/page.tsx`**: Added solid background fallbacks (`#C2410C`) and inline gradients to left brand panels.
- **`src/lib/i18n.tsx`**: Updated LanguageToggle active state to explicit `text-white font-bold`.
- **`src/styles/globals.css`**: Added backward-compatibility token aliases (`--foreground`, `--muted-foreground`, `--primary-foreground`, `--secondary-foreground`, `--accent-foreground`).

### Automated Test Suite Expansion
- **`tests/unit/authorization-guards.test.ts`** (Added - 19 tests): Validated all server action mutations reject unauthenticated callers and enforce role boundaries.
- **`tests/unit/order-idor.test.ts`** (Added - 9 tests): Validated IDOR protection, preventing Customer B from viewing Customer A's orders.
- **`tests/unit/address-validation.test.ts`** (Added - 7 tests): Validated address persistence, BD phone formatting, and ownership rules.
- Overall unit test suite expanded from **26 to 61 passing tests** (100% pass rate).

### Deliverables & Documentation Authored
- `OVERNIGHT_QA_REPORT.md`: Comprehensive executive report and verification evidence.
- `BUGS_AND_FIXES.md`: Full defect register covering 11 logged and verified defects.
- `FEATURE_COVERAGE_MATRIX.md`: End-to-end matrix of all 25 routes and capabilities.
- `UX_IMPROVEMENT_LOG.md`: Before-and-after log of interface and accessibility enhancements.
- `DECISIONS.md`: Conflict register between original work order and Bangladesh implementation.
- `TESTING.md`: Reproducible testing commands and test account setup.
- `PAGE_BRIEFS.md`: Route-by-route product briefs and acceptance criteria.
- `DESIGN_DECISIONS.md`: Architectural design decisions and trade-offs.
- `DESIGN_SYSTEM_AUDIT.md`: Token inventory, component APIs, and contrast ratios.
- `ASSET_AUDIT.md`: Media asset inventory and image guidelines.
- `SECURITY_AUDIT.md`: Threat model and penetration testing results.
- `PERFORMANCE_AUDIT.md`: Build metrics and Core Web Vitals targets.
- `ACCESSIBILITY_AUDIT.md`: WCAG 2.2 AA practical evaluation.
- `RESPONSIVE_AUDIT.md`: Multi-viewport testing across 360px to 1440px.
- `ERROR_RECOVERY_AUDIT.md`: Failure workflows and resilience testing.
- `DATA_CONSISTENCY_AUDIT.md`: Canonical order lifecycle trace across 11 touchpoints.
- `ADMIN_TASK_EFFICIENCY.md`: Operational time-to-task measurements.
- `CONTENT_TRUST_REVIEW.md`: Factual claims and Zero Fake Content audit.
- `FEATURE_GAP_REGISTER.md`: Prioritized roadmap matrix.
- `RELEASE_READINESS.md`: Formal release gates evaluation (Verdict: GO).
