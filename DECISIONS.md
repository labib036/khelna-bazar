# Architectural & Design Decisions (DECISIONS.md)

This document records the architectural decisions, trade-offs, and design choices made for **KHELNA BAZAR**, conforming to both the *Ecommerce Work Order* and the explicit *Master Prompt* guidelines.

---

## 1. Brand Identity & Store Name
* **Decision**: The store is branded exclusively as **KHELNA BAZAR**. All references to the work order's placeholder "PlayNest" have been eliminated.
* **Central Logo Configuration**: Located in `src/config/site.ts`. The user can simply place their custom image in `/public/images/` and update `siteConfig.logo.path` without modifying any layout or header code. If no image is provided, a playful, accessible vector/text wordmark is rendered.

---

## 2. Payment Method: Cash on Delivery (COD) Only
* **Strict Rule**: In accordance with the project instructions, **Cash on Delivery (COD)** is the sole payment method.
* **No Third-Party Online Payment Gateways**: Stripe, PayPal, bKash, Nagad, Rocket, card payment gateways, and webhooks have been excluded.
* **COD State Separation**:
  - `fulfillmentStatus`: Tracks order lifecycle (`PENDING_CONFIRMATION`, `CONFIRMED`, `PROCESSING`, `PACKED`, `SHIPPED`, `OUT_FOR_DELIVERY`, `DELIVERED`, `CANCELLED`, `RETURNED`).
  - `codStatus`: Tracks cash collection independently (`UNCOLLECTED`, `COLLECTED`, `DISCREPANCY`, `REFUNDED`).
  - The admin interface provides distinct controls to confirm COD orders, mark when courier collected money, record amount collected, and flag discrepancies.

---

## 3. Localization & Regional Defaults
* **Currency**: Bangladesh Taka (`BDT`, symbol `৳`).
* **Delivery Zones**:
  - **Inside Dhaka**: ৳60 (Standard: 24–48 hours)
  - **Outside Dhaka (Nationwide)**: ৳120 (Standard: 2–4 business days)
  - **Express Dhaka**: ৳150 (Same day / next day)
  - **Free Shipping Threshold**: Orders over ৳2,000 receive free shipping.
  - All shipping rates and thresholds are managed centrally in `src/config/site.ts` and adjustable in Admin Settings.

---

## 4. Technology Stack & Compatibility
* **Framework**: Next.js 15 (App Router) + React 19 + TypeScript (Strict mode).
* **Database & ORM**: PostgreSQL via Neon Serverless, managed with Prisma ORM. Uses both pooled (`DATABASE_URL`) and direct (`DIRECT_URL`) connection strings.
* **Styling**: Tailwind CSS with CSS variable design tokens for theme consistency (Light and Dark mode support).
* **Component Primitives**: Accessible UI patterns inspired by shadcn/ui and Radix UI with Lucide icons.
* **Authentication**: Credentials authentication using `bcryptjs` for secure password hashing, role-based authorization (`CUSTOMER`, `STAFF`, `ADMIN`), and secure HTTP-only cookies.
* **Cart & State**: Client-side Zustand store for immediate optimistic interactions (add to cart, mini-cart drawer), synced to server-side database records.

---

## 5. Catalog & Realistic Seed Data
* 60+ realistic toy products across 13 major categories (Action Figures, Dolls, Building Blocks, Puzzles, Board Games, Outdoor, STEM & Science, Plush, RC & Vehicles, Arts & Crafts, Baby & Toddler, Pretend Play, Musical Toys).
* Authentic toy safety fields: Recommended age range (in months and years), choking hazard warning badges, materials, battery specifications, and safety certifications (ASTM F963, CE, EN71).
* Realistic Bangladesh-oriented pricing in BDT (`৳`).
