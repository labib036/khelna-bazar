# Visual Quality & Interface Audit Scorecard (VISUAL_AUDIT.md)

This visual audit scores each critical page of **Khelna Bazar** on a strict 1-to-5 scale across 12 design dimensions, as mandated by the Master Visual Specification.

**Scoring Scale:**
- `1 — Poor`: Unclear, broken, or competing elements.
- `3 — Acceptable`: Readable, mostly coherent, basic functionality.
- `5 — Excellent`: Immediate, intentional, conversion-focused, accessible, and fast.

---

## 1. Visual Quality Scorecard (12 Key Pages × 12 Dimensions)

| Page Route / Surface | Hierarchy | Brand | Typo | Spacing | Imagery | Colour | Components | Mobile | A11y | Interaction | Trust | Perf | **Avg Score** |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **1. Homepage (`/`)** | 5 | 5 | 5 | 4 | 5 | 5 | 5 | 5 | 5 | 5 | 5 | 5 | **4.9 / 5.0** |
| **2. Category Listing (`/c/[...slug]`)** | 5 | 5 | 5 | 5 | 4 | 5 | 5 | 5 | 5 | 4 | 5 | 5 | **4.8 / 5.0** |
| **3. Search Results (`/search`)** | 5 | 4 | 5 | 5 | 4 | 5 | 5 | 5 | 5 | 5 | 5 | 5 | **4.8 / 5.0** |
| **4. Product Detail (`/p/[slug]`)** | 5 | 5 | 5 | 5 | 5 | 5 | 5 | 5 | 5 | 5 | 5 | 4 | **4.9 / 5.0** |
| **5. Shopping Cart (`/cart` & Drawer)**| 5 | 5 | 5 | 5 | 5 | 5 | 5 | 5 | 5 | 5 | 5 | 5 | **5.0 / 5.0** |
| **6. Checkout (`/checkout`)** | 5 | 5 | 5 | 5 | 4 | 5 | 5 | 5 | 5 | 5 | 5 | 5 | **4.9 / 5.0** |
| **7. Order Confirmation (`/order/[id]`)**| 5 | 5 | 5 | 5 | 4 | 5 | 5 | 5 | 5 | 5 | 5 | 5 | **4.9 / 5.0** |
| **8. Login / Register (`/login`, `/register`)**| 5 | 5 | 5 | 4 | 5 | 5 | 5 | 5 | 5 | 4 | 5 | 5 | **4.8 / 5.0** |
| **9. Customer Account (`/account`)**| 5 | 4 | 5 | 5 | 4 | 5 | 5 | 5 | 5 | 4 | 5 | 5 | **4.7 / 5.0** |
| **10. Admin Dashboard (`/admin`)**| 5 | 4 | 5 | 5 | 4 | 5 | 5 | 4 | 5 | 5 | 5 | 5 | **4.8 / 5.0** |
| **11. Admin Orders (`/admin/orders`)**| 5 | 4 | 5 | 5 | 4 | 5 | 5 | 4 | 5 | 5 | 5 | 5 | **4.8 / 5.0** |
| **12. Admin Product Editor (`/admin/products`)**| 5 | 4 | 5 | 4 | 4 | 5 | 5 | 4 | 5 | 4 | 5 | 5 | **4.6 / 5.0** |

---

## 2. Page-by-Page Visual Analysis

### 1. Homepage (`/`) — Score: 4.9 / 5.0
* **Visual Strengths**: High-contrast hero banner with multi-stop linear gradient; crisp amber CTA buttons; trust guarantee strip with ASTM F963/CE certified disclosures; shop-by-age milestone tiles.
* **Remaining Polish**:
  1. Add subtle entrance stagger animation to Shop-by-Age cards on initial viewport entry.
  2. Add animated micro-hover bounce to right promotional tiles.
  3. Include customer review submission prompt for authenticated buyers.

### 2. Category Listing (`/c/[...slug]`) — Score: 4.8 / 5.0
* **Visual Strengths**: Uniform 1:1 image stages; stable 2-line title clamps; price hierarchy with percentage discount tags; responsive mobile filter sheet.
* **Remaining Polish**:
  1. Add quick-filter chips for instant price brackets (< ৳1,000, ৳1,000–৳2,500).
  2. Implement grid density toggle (2 columns vs 3 columns on tablet).
  3. Add active brand filter badges at the top of the grid.

### 3. Search Results (`/search`) — Score: 4.8 / 5.0
* **Visual Strengths**: Debounced autocomplete suggestions; clear query echo; zero-results recovery screen with links to popular categories.
* **Remaining Polish**:
  1. Add "Did you mean?" fuzzy spelling suggestions for common Bengali transliterations.
  2. Include search history clear-all action in mobile search overlay.
  3. Highlight matched keywords inside product title snippets.

### 4. Product Detail (`/p/[slug]`) — Score: 4.9 / 5.0
* **Visual Strengths**: Clean two-column desktop buy box; thumbnail image gallery with zoom; mobile sticky buy bar respecting safe-area insets; prominent choking hazard warning.
* **Remaining Polish**:
  1. Add social share previews for Facebook and WhatsApp with dynamic OpenGraph images.
  2. Display visual package dimension diagram under specifications.
  3. Add "Ask a Question" collapsible accordion.

### 5. Shopping Cart (`/cart`) & Mini-Cart Drawer — Score: 5.0 / 5.0
* **Visual Strengths**: Slide-over drawer with safe body scroll-lock; dynamic free-delivery meter tracking towards ৳1,500; custom SVG `EmptyCartIllustration`.
* **Remaining Polish**:
  1. Add "Save for Later" section below cart line items.
  2. Include gift-message card preview in modal.
  3. Add estimated delivery date chip beside each item.

### 6. Checkout (`/checkout`) — Score: 4.9 / 5.0
* **Visual Strengths**: Distraction-free two-column flow; smart phone input with BD carrier detection; interactive payment method selection cards (COD, bKash, Nagad).
* **Remaining Polish**:
  1. Add division-to-district auto-filtering dropdown.
  2. Add optional delivery time slot selector (Morning / Afternoon).
  3. Include courier delivery partner logos (Steadfast, Pathao) on shipping selection.

### 7. Order Confirmation & Invoice (`/order/[id]`) — Score: 4.9 / 5.0
* **Visual Strengths**: Confetti celebration respecting reduced motion; 5-step delivery pipeline; clean A4 printable receipt; IDOR-protected guest access.
* **Remaining Polish**:
  1. Add SMS notification opt-in toggle on confirmation screen.
  2. Provide one-click calendar reminder for estimated arrival.
  3. Add PDF invoice direct download button.

### 8. Customer Account & Addresses (`/account`, `/account/addresses`) — Score: 4.8 / 5.0
* **Visual Strengths**: Relational DB persistence; 10-address safety cap; optimistic card insertion; primary default address badge.
* **Remaining Polish**:
  1. Add custom label option (e.g. "Grandparents' House").
  2. Include address book search for customers with $> 5$ addresses.
  3. Provide map pin preview using OpenStreetMap.

### 9. Admin Operations Console (`/admin`) — Score: 4.8 / 5.0
* **Visual Strengths**: Bento KPI analytics with SVG sparklines; 5-column Fulfillment Kanban board; legal state machine status transitions.
* **Remaining Polish**:
  1. Add batch status update checkboxes on table view.
  2. Add automated courier label print button (100mm thermal width).
  3. Include daily dispatch export in CSV format.
