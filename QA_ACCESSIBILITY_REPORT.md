# Khelna Bazar — Accessibility (a11y) Audit Report

**Standard:** WCAG 2.1 Level AA Compliance  
**Audit Date:** November 18, 2026  
**Audited Surfaces:** Public Storefront, Checkout, Customer Dashboard, Admin Console  

---

## 1. Compliance Checklist & Audit Findings

| Category | Requirement | Findings & Implementation | Status |
|:---|:---|:---|:---:|
| **Semantic Structure** | Proper heading hierarchy (`h1`, `h2`, `h3`) | Single `h1` per page (e.g. Store title, Category title, Product name, Dashboard heading). No heading level skipping. | **PASS** |
| **Landmark Regions** | Semantic landmark tags | Verified presence of `<header>`, `<nav>`, `<main>`, `<footer>`, `<aside>` on all layouts. | **PASS** |
| **Form Labels & Inputs** | Explicit `<label for="...">` or wrapping | Verified on `/login`, `/register`, `/checkout`, and `/track-order`. Fixed missing `id` on checkout `fullName`, `phone`, and `inspectionConsent`. | **PASS** |
| **Image Alt Text** | Descriptive `alt` on all images | All Next.js `<Image>` tags contain descriptive text; decorative icons carry `aria-hidden="true"`. | **PASS** |
| **Color Contrast** | Minimum 4.5:1 for normal text, 3:1 for large | Crimson `#DC012B` on white background delivers 5.2:1 contrast ratio. Dark slate text on surface delivers 12.8:1. | **PASS** |
| **Touch Target Size** | Minimum 44x44 CSS pixels | Interactive buttons, checkboxes, and navigation items meet or exceed 44px on mobile viewports. | **PASS** |
| **Keyboard Navigation** | Visible `:focus-visible` outlines | High-contrast focus rings (`focus:ring-2 focus:ring-[var(--primary)]`) active on all keyboard tab stops. | **PASS** |
| **Screen Reader ARIA** | Accessible labels for icon-only buttons | Icon buttons (`Search`, `Cart`, `Wishlist`, `Menu`, `Close`) carry explicit `aria-label`. | **PASS** |

---

## 2. Accessibility Improvements Applied During QA

1. **Checkout Form Semantics:** Added explicit `id` and `name` attributes matching `<label>` elements for `fullName`, `phone`, and `inspectionConsent`.
2. **Next.js Image Sizing Props:** Added explicit `sizes` property to fill-based logo images to optimize responsive srcset rendering and prevent layout shifts.
3. **Screen Reader Notification for Dynamic Cart Changes:** The cart drawer announces quantity and subtotal updates via live DOM region.
