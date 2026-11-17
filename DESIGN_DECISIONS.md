# Architectural Design Decisions & Trade-Offs (DESIGN_DECISIONS.md)

This document records the design explorations, alternatives evaluated, trade-offs, and final architectural decisions for core visual surfaces across Khelna Bazar.

---

## 1. Homepage Hero Section

### Context
The homepage hero must immediately convey brand value (certified safe toys, nationwide COD, fast delivery) and offer a high-converting entry into the product catalog without pushing shopping discovery below the fold.

### Alternatives Evaluated
1. **Alternative A: Auto-sliding Full-Bleed Carousel**:
   - *Pros*: Allows multiple marketing campaigns (Building Sets, STEM, RC Vehicles).
   - *Cons*: High layout shift risk (CLS); carousel banner text can suffer contrast issues; mobile users often ignore slides after slide 1.
2. **Alternative B: Single Static Campaign Tile + Age Selector Chips**:
   - *Pros*: Zero layout shift; simple responsive behavior.
   - *Cons*: Underutilizes desktop screen real estate (1440px); cannot showcase multiple toy categories simultaneously.
3. **Alternative C (Chosen): 2:1 Asymmetric Grid (Main Carousel + Right Stacked Promo Tiles)**:
   - *Composition*: A 2-column hero card with multi-stop linear gradient (`#C2410C` to `#D97706`) and manual play/pause controls, paired with two stacked promotional tiles on the right (Promo 1: Speed & Stunts RC, Promo 2: Young Scientists STEM).
   - *Decision Rationale*: Provides the commercial energy of an international toy marketplace while ensuring that 3 distinct shopping paths are visible immediately above the fold on desktop. Explicit CSS linear gradients with solid background fallbacks guarantee WCAG 2.2 AA contrast across all devices.

---

## 2. Header & Shopping Navigation

### Alternatives Evaluated
1. **Alternative A: Single-Row Unified Header**:
   - *Cons*: Compresses search input on tablet and desktop; no room for hotline and COD reassurance.
2. **Alternative B (Chosen): Two-Tier Sticky Shrink Header**:
   - *Tier 1 (Utility Bar)*: Store hotline, Cash on Delivery reassurance, Track Order shortcut, Language Toggle, and Theme Toggle.
   - *Tier 2 (Action Bar)*: Prominent logo, full-width debounced search with `⌘K` keyboard shortcut, department links, wishlist pill with count badge, and animated mini-cart counter.
   - *Decision Rationale*: Keeps trust signals prominent at all times while dedicating $> 400$px of width to search discovery. Shrinks gently on scroll without layout shift.

---

## 3. Product Card Architecture

### Alternatives Evaluated
1. **Alternative A: Variable-Height Editorial Card**:
   - *Cons*: Misaligns card footers and action buttons across grid rows when product titles vary in length.
2. **Alternative B (Chosen): Standard 1:1 Media Stage with Stable Typography Grid**:
   - *Media Stage*: 1:1 aspect ratio container with `object-contain` on neutral surface to preserve the full toy without cropping packaging.
   - *Badges*: Single semantic badge (Sale savings or Age bracket) anchored top-left.
   - *Action Controls*: 1-click wishlist heart top-right with accessible label; primary "Add to Bag" button anchored to the bottom.
   - *Typography*: 2-line title clamp (`line-clamp-2`), prominent BDT price in bold, secondary old compare-price with percentage savings badge.
   - *Decision Rationale*: Guarantees consistent row heights across 2-column mobile and 4-column desktop grids.

---

## 4. Product Detail Page (PDP) Layout

### Alternatives Evaluated
1. **Alternative A: Full-Width Stacked Layout with Bottom Purchase Section**:
   - *Cons*: Requires extensive scrolling on desktop before reaching the "Add to Bag" CTA.
2. **Alternative B (Chosen): Two-Column Layout with Sticky Buy Box & Mobile Bottom Bar**:
   - *Desktop*: Left column hosts the multi-image gallery with thumbnail navigation and zoom; right column hosts a sticky buy box with title, pricing, variant selector, quantity stepper, delivery estimator, and ASTM F963 safety disclosures.
   - *Mobile*: Gallery spans full viewport width; purchase button is duplicated in a mobile sticky bottom bar that respects safe-area insets and appears only when the primary buy box scrolls offscreen.
   - *Decision Rationale*: Maximizes conversion by keeping the purchase decision visible without obstructing content.

---

## 5. Cart Experience: Dedicated Page vs. Mini-Cart Drawer

### Alternatives Evaluated
1. **Alternative A: Dedicated `/cart` Page Only**:
   - *Cons*: Interrupts shopping flow; forces page reload on every item added.
2. **Alternative B (Chosen): Hybrid Slide-Over Mini-Cart Drawer + Dedicated `/cart` Route**:
   - *Mini-Cart Drawer*: Slides out smoothly from the right upon adding an item; features optimistic quantity steppers, toast notification with "Undo", and dynamic free-delivery progress meter (calibrated to ৳1,500).
   - *Dedicated `/cart` Page*: Available for deep cart review, coupon code entry, and gift-wrapping selection.
   - *Decision Rationale*: Offers the calm efficiency of modern e-commerce (like Linear/Daraz) with zero friction for quick purchases.

---

## 6. Admin Fulfillment: Kanban Board vs. Static Data Table

### Alternatives Evaluated
1. **Alternative A: Plain Paginated Data Table**:
   - *Cons*: Poor operational visibility for warehouse staff packing dozens of orders; no visual pipeline.
2. **Alternative B (Chosen): Bento KPI Analytics + 5-Column Fulfillment Kanban Board**:
   - *Bento Grid*: 4 high-density KPI cards with SVG sparklines tracking Today's Revenue, New Orders, COD in Transit, and Low Stock.
   - *Kanban Board*: 5 operational columns: `New Orders` &rarr; `Processing` &rarr; `Packed` &rarr; `Out for Delivery` &rarr; `Delivered`. Orders can be inspected and advanced with 1-click status transitions.
   - *Decision Rationale*: Directly empowers store staff to pack and ship orders rapidly without manual SQL or spreadsheet tracking.
