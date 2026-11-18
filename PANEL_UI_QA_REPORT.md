# Khelna Bazar — Panel UI & UX QA Audit Report

**Date:** November 18, 2026  
**Devices Evaluated:** Desktop (1440px), Tablet (768px / 1024px), Mobile Viewports (375px / 412px)  
**Status:** 100% Passed · Production Quality Verified

---

## 1. Visual & Layout Separation Matrix

| Evaluation Aspect | Storefront Panel A | Customer Dashboard Panel B | Admin Console Panel C | Auth Layout Panel D |
|---|---|---|---|---|
| **Layout Shell Component** | `src/app/(store)/layout.tsx` | `CustomerDashboardShell` | `AdminLayout` | `src/app/(auth)/layout.tsx` |
| **Test ID Hook** | `data-testid="storefront-shell"` | `data-testid="customer-dashboard-shell"` | `data-testid="admin-dashboard-shell"` | Card wrapper |
| **Sidebar Navigation** | Mega-menu / category flyout | Dedicated Customer Sidebar | Role-gated Admin Sidebar | None |
| **Topbar Chrome** | Search, cart pill, categories | Customer Profile, Back to Store | Admin role badge, Live Store link | Logo, Back to Store |
| **Footer Chrome** | Full Trust Footer & Policies | Helpline card in sidebar | Minimal console status bar | Minimal copyright notice |
| **Mobile Navigation** | Bottom 5-tab bar | Hamburger slide-out sheet | Hamburger slide-out sheet | None |
| **Robots Directives** | `index, follow` | `noindex, nofollow` | `noindex, nofollow` | `noindex, nofollow` |

---

## 2. Storefront Panel A — Detailed UI QA

1. **Header & Mega Menu:**
   - Visual identity prominently features playful Khelna Bazar branding and Bengali subtitle (`খেলনা বাজার`).
   - Search input features autocomplete dropdown with debounce, category quick filters, and clear button.
   - Normal customer view displays clean "My Account" or "Sign In" link pointing to `/dashboard` or `/login`. Staff/Admin accounts see a subtle, distinct "Management Console" link pointing to `/admin/dashboard`.
   - Admin navigation buttons are never visible to regular shoppers.

2. **Mini-Cart Drawer:**
   - Slides smoothly from the right with backdrop overlay.
   - Displays real-time free delivery progress meter with remaining threshold calculation (e.g. "Add ৳350 more for FREE delivery inside Dhaka").
   - 1-click checkout CTA with optimistic quantity increment and decrement.

3. **Mobile Bottom Navigation:**
   - Sticky bottom bar on mobile (`z-40`, height 64px) with 5 tabs: Home, Categories, Wishlist, Cart (with badge), and Dashboard.
   - Padded with `pb-safe` to prevent collision with iOS home indicator or Android gesture bar.
   - Minimum tap target size of 48×48px.

---

## 3. Customer Dashboard Panel B — Detailed UI QA

1. **Customer Shell & Navigation:**
   - Clean, professional SaaS/e-commerce dashboard appearance with gentle playful accents.
   - **Desktop Layout:** Fixed left sidebar (260px) with active route indicator, customer avatar, role badge (`Verified Customer`), and navigation links:
     - 📊 Account Overview (`/dashboard`)
     - 📦 My Orders (`/dashboard/orders`)
     - 📍 Saved Addresses (`/dashboard/addresses`)
     - 👤 Profile & Security (`/dashboard/profile`)
     - 🎁 Rewards & Perks (`/dashboard/rewards`)
   - **Mobile Layout:** Collapsible sidebar converted to a slide-out drawer triggered by a header hamburger button. Auto-closes upon navigating to any section.

2. **Overview Page (`/dashboard`):**
   - 4 responsive KPI cards: Total Orders, In-Transit Packages, Total Spent (BDT ৳), and Saved Addresses.
   - Active Order Tracker card: Displays parcel progress bar with 5 checkpoints (`Order Placed`, `Confirmed`, `Packed`, `Shipped`, `Delivered`) and courier tracking reference.
   - Quick Action buttons: "Browse Toys", "Track Specific Order", "Edit Address Book".

3. **Order History (`/dashboard/orders`):**
   - Search input and status tabs (`All`, `Active`, `Delivered`, `Cancelled`).
   - Order items displayed with thumbnail preview, title, quantity, and unit price.
   - Real-time status badges with localized color coding:
     - `PENDING_CONFIRMATION`: Amber badge
     - `CONFIRMED`: Blue badge
     - `SHIPPED`: Purple badge with tracking number link
     - `DELIVERED`: Emerald badge with mandatory inspection confirmation
     - `CANCELLED`: Rose badge with reason
   - "Cancel Order" action enabled only while order status is `PENDING_CONFIRMATION`.

4. **Address Book (`/dashboard/addresses`):**
   - Card grid of saved addresses displaying tags (`Home`, `Office`, `Other`) and Default badge.
   - Bangladeshi 8-division selector (`Dhaka`, `Chittagong`, `Sylhet`, `Rajshahi`, `Khulna`, `Barisal`, `Rangpur`, `Mymensingh`).
   - Phone number input validated for Bangladeshi mobile format (`01[3-9]XXXXXXXX`).

5. **Assistance & Escape Hatch:**
   - Dedicated support box in customer sidebar with direct phone call link to `01712-039707` and WhatsApp click-to-chat.
   - "Back to Toy Store" top bar link returning to `/` with zero session disruption.

---

## 4. Admin Management Console Panel C — Detailed UI QA

1. **Role-Aware Sidebar:**
   - `STAFF`: Displays Overview and Orders & Payments tabs. Catalog, Coupons, Settings, Staff, and Audit Logs are hidden.
   - `ADMIN`: Displays Overview, Orders, Product Catalog, Inventory, Coupons, and Store Settings. Staff and Audit Logs are hidden.
   - `SUPER_ADMIN`: Displays full suite including Staff Directory (`/admin/staff`) and Platform Audit Logs (`/admin/audit-logs`).

2. **Dashboard Overview (`/admin/dashboard`):**
   - Live revenue KPI cards (Total Sales ৳, Active Orders, Uncollected COD Cash, Low Stock SKU alerts).
   - Real-time orders table with status update dropdowns and quick MFS/COD status toggles.
   - Low stock inventory alert table highlighting products below reorder thresholds.

3. **Staff Directory (`/admin/staff`):**
   - Super Admin exclusive access.
   - Form to provision new personnel with full name, email, phone, and initial role (`STAFF`, `ADMIN`, `SUPER_ADMIN`).
   - Staff table with status pills, creation timestamp, and instant role modification dropdown.
   - Toast notification and self-demotion prevention safeguards.

4. **Audit Logs View (`/admin/audit-logs`):**
   - Filterable table of operational events (actor, action, entity type, timestamp).
   - Expandable diff drawer showing `before` and `after` state modifications in syntax-highlighted JSON.

5. **Responsive Tables & Modals:**
   - All admin data tables wrapped in horizontal scroll containers (`overflow-x-auto`) to guarantee zero horizontal distortion on smaller screens.
   - Modals (order inspection, staff creation, product editor) centered with backdrop blur and responsive max-width.

---

## 5. Accessibility & Design System Compliance

* **Color Contrast:** All body text meets WCAG 2.1 AA standards (minimum 4.5:1 ratio against background).
* **Typography:** Clean font pairings with Plus Jakarta Sans for UI elements and Baloo 2 for Bengali script readability.
* **Touch Targets:** All interactive buttons, chips, and menu links exceed the minimum 44×44px recommendation.
* **Form Inputs:** Proper HTML5 input types (`type="tel"`, `type="email"`, `type="password"`) with `aria-label` attributes and validation states.
