# KHELNA BAZAR (খেলনা বাজার)
> **The Fastest, Most Joyful Toy Shopping Experience in Bangladesh**  
> *Full-Stack Toy E-Commerce Platform with Customer & Admin Dashboards &bull; Cash on Delivery (COD) Only*

---

## 🌟 Executive Summary

**KHELNA BAZAR** is a production-ready, full-stack online toy store built specifically for parents, gift-buyers, and toy enthusiasts in Bangladesh. It combines the rigorous information architecture and conversion speed of major global retailers with a warm, playful, and child-safe visual identity.

### 🎯 Key Highlights
* **Three Isolated Panels with Dedicated Layouts**:
  * **Panel A (Public Storefront)**: Marketing hero, catalog flyout, deals, reviews, and 1-tap COD/MFS checkout wrapped in `src/app/(store)/layout.tsx`.
  * **Panel B (Customer Dashboard)**: Dedicated personal account center at `/dashboard/*` with parcel tracking, order history, address book, and zero IDOR vulnerabilities.
  * **Panel C (Management Console)**: Unified administration center at `/admin/*` (canonical `/admin/dashboard`) with hierarchical role access (`STAFF`, `ADMIN`, `SUPER_ADMIN`).
  * **Panel D (Focused Auth Experience)**: Distraction-free authentication cards at `/(auth)/*`.
* **Strictly Cash on Delivery (COD) & Manual MFS**: Zero gateway hassle; customers pay cash upon doorstep inspection or pay via verified bKash/Nagad transactions.
* **Dual-State COD Lifecycle**: Separate tracking for order fulfillment (`Pending Confirmation` → `Confirmed` → `Packed` → `Shipped` → `Delivered`) and cash reconciliation (`Uncollected` → `Collected` → `Discrepancy`).
* **Child Safety Focus**: ASTM F963 & CE safety certifications, mandatory choking hazard badges, age recommendations (0–12m, 1–2y, 3–4y, 5–7y, 8–11y, 12+), and non-toxic material transparency.
* **Instant Delight Features**: Interactive 4-step Gift Finder quiz, side-by-side toy feature comparison, persistent wishlist, optimistic basket drawer with free delivery progress bar, and confetti order celebrations.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose & Fit |
| :--- | :--- | :--- |
| **Framework** | **Next.js 15 (App Router) + React 19** | Server Components for ultra-low JS bundle size, ISR caching, fast route transitions. |
| **Language** | **TypeScript (Strict Mode)** | Full type safety across catalog, orders, and state management. |
| **Styling** | **Tailwind CSS + CSS Variables** | Design tokens (`--brand`, `--sun`, `--coral`, `--mint`, `--grape`) with light & dark themes. |
| **Database** | **PostgreSQL (Neon Serverless)** | Serverless pooling, connection stability, zero monthly hosting cost on free tier. |
| **ORM** | **Prisma ORM** | Type-safe migrations, queries, and multi-model seed script. |
| **Client State**| **Zustand** | Instant optimistic cart updates, mini-cart drawer, and guest persistence. |
| **Form & Valid.**| **Zod** | Shared client and server validation for orders and products. |
| **Icons & UI** | **Lucide React + Radix UI Primitives** | Accessible dialogs, drawers, dropdowns, and tooltips. |

---

## 📁 Project Architecture & Folder Structure

```
khelna-bazar/
├── prisma/
│   ├── schema.prisma        # Complete PostgreSQL database schema (25+ models, Role enum)
│   └── seed-essential.ts    # Seed script with essential store data
├── src/
│   ├── app/
│   │   ├── (auth)/          # Focused login, register, forgot-password layout
│   │   ├── (store)/         # Public Storefront Panel A (with Announcement, Header, Footer)
│   │   │   ├── c/[...slug]/ # Category listing & filter sidebar
│   │   │   ├── p/[slug]/    # Product detail page (gallery, buy box, safety tabs)
│   │   │   ├── search/      # Instant autocomplete & search results
│   │   │   ├── cart/        # Full cart review with free delivery meter
│   │   │   ├── checkout/    # Single-page Cash on Delivery checkout
│   │   │   └── ...
│   │   ├── dashboard/       # Customer Dashboard Panel B (layout, orders, addresses, profile)
│   │   ├── admin/           # Management Console Panel C (layout, dashboard, orders, staff, audit)
│   │   ├── account/         # Compatibility redirects to /dashboard/*
│   │   └── layout.tsx       # Minimal root layout (fonts, providers, toaster)
│   ├── components/
│   │   ├── admin/           # Admin shell, tables, charts, staff & audit log clients
│   │   ├── customer/        # Customer dashboard shell, sidebar, mobile drawer
│   │   └── store/           # Storefront header, footer, cards, mini-cart drawer
│   ├── lib/
│   │   ├── authorization-guards.ts # Centralized server authorization guards
│   │   └── auth.ts          # NextAuth v5 configuration & session types
```

---

## 📚 Documentation & Architecture Specifications

* 🏛️ [**PANEL_ARCHITECTURE_AUDIT.md**](./PANEL_ARCHITECTURE_AUDIT.md) - Panel decoupling audit and root cause analysis.
* 🗺️ [**PANEL_ROUTE_MAP.md**](./PANEL_ROUTE_MAP.md) - Complete canonical route tables and compatibility redirects.
* 🛡️ [**ROLE_PERMISSION_MATRIX.md**](./ROLE_PERMISSION_MATRIX.md) - Capability matrix across GUEST, CUSTOMER, STAFF, ADMIN, SUPER_ADMIN.
* 📦 [**PANEL_MIGRATION_REPORT.md**](./PANEL_MIGRATION_REPORT.md) - Step-by-step file migration and architectural refactor details.
* 🧪 [**PANEL_ISOLATION_TEST_REPORT.md**](./PANEL_ISOLATION_TEST_REPORT.md) - Automated isolation, IDOR, and role guard test report.
* 📱 [**PANEL_UI_QA_REPORT.md**](./PANEL_UI_QA_REPORT.md) - Responsive UI/UX inspection across mobile, tablet, and desktop.
* 🔗 [**PANEL_LINK_AUDIT.md**](./PANEL_LINK_AUDIT.md) - Comprehensive link destination audit (0 broken links).
* 🔒 [**PANEL_SECURITY_REVIEW.md**](./PANEL_SECURITY_REVIEW.md) - Multi-layer defense-in-depth, open redirect and IDOR defense.
* 📖 [**ADMIN_GUIDE.md**](./ADMIN_GUIDE.md) - Operational guide for store staff, managers, and super-admins.
* 🔐 [**SECURITY.md**](./SECURITY.md) - Production security policies and role controls.

---

## 🎨 Changing Logo & Branding

You can customize the logo and brand name in **one single place**:
1. Open `src/config/site.ts`.
2. To use your custom image: put your image in `/public/images/my-logo.png` and set:
   ```typescript
   logo: {
     path: "/images/my-logo.png",
     useTextFallback: false,
   }
   ```
3. To change the brand name: edit `name: "KHELNA BAZAR"`. It will automatically update across all pages, footers, metadata, and receipts.

---

## 📜 License
Crafted with pride for **KHELNA BAZAR**. All rights reserved.
