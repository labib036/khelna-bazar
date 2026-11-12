# KHELNA BAZAR (খেলনা বাজার)
> **The Fastest, Most Joyful Toy Shopping Experience in Bangladesh**  
> *Full-Stack Toy E-Commerce Platform with Customer & Admin Dashboards &bull; Cash on Delivery (COD) Only*

---

## 🌟 Executive Summary

**KHELNA BAZAR** is a production-ready, full-stack online toy store built specifically for parents, gift-buyers, and toy enthusiasts in Bangladesh. It combines the rigorous information architecture and conversion speed of major global retailers with a warm, playful, and child-safe visual identity.

### 🎯 Key Highlights
* **Strictly Cash on Delivery (COD)**: Zero hassle with payment gateway keys or card security risks. Customers place orders with 1 tap and pay cash upon doorstep parcel inspection.
* **Dual-State COD Lifecycle**: Separate tracking for order fulfillment (`Pending Confirmation` → `Confirmed` → `Packed` → `Shipped` → `Delivered`) and cash reconciliation (`Uncollected` → `Collected` → `Discrepancy`).
* **Complete Admin Panel**: The store owner can manage catalog products, live stock, prices, customer orders, courier dispatch, coupons, and delivery charges without ever writing code.
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
│   ├── schema.prisma        # Complete PostgreSQL database schema (25+ models)
│   └── seed.ts              # Seeder with 60+ realistic toys, brands, coupons & demo users
├── public/
│   └── images/
│       └── logo-placeholder.svg  # Central vector logo asset
├── src/
│   ├── app/
│   │   ├── (auth)/          # Login & registration routes
│   │   ├── (store)/         # Storefront routes
│   │   │   ├── c/[...slug]/ # Category listing & smart filter sidebar
│   │   │   ├── p/[slug]/    # Product detail page (gallery, buy box, safety tabs)
│   │   │   ├── search/      # Instant autocomplete & search results
│   │   │   ├── cart/        # Full cart review with free delivery meter
│   │   │   ├── checkout/    # Single-page Cash on Delivery checkout
│   │   │   ├── order/[id]/  # Order confirmation & live courier timeline
│   │   │   ├── gift-finder/ # Interactive 4-step toy quiz
│   │   │   ├── compare/     # Side-by-side toy specs comparison
│   │   │   └── wishlist/    # Saved favorites with 1-click cart transfer
│   │   ├── account/         # Customer Dashboard (orders, addresses, rewards)
│   │   ├── admin/           # Owner Admin Console (KPIs, catalog, orders, COD cash)
│   │   ├── layout.tsx       # Root layout with header, footer, cart drawer
│   │   └── page.tsx         # Home page with hero, deals, age tiles, best sellers
│   ├── components/
│   │   ├── admin/           # Admin layout & management tools
│   │   ├── store/           # Header, footer, product cards, mini-cart drawer
│   │   └── ui/              # Reusable buttons, badges, inputs
│   ├── config/
│   │   └── site.ts          # Central configuration for Logo, Site Name, Delivery Zones & BDT
│   ├── lib/
│   │   ├── db.ts            # Prisma client singleton
│   │   ├── cart-store.ts    # Zustand cart state with localStorage persistence
│   │   ├── wishlist-store.ts# Zustand wishlist state
│   │   ├── compare-store.ts # Zustand toy comparison state
│   │   └── utils.ts         # Bangladeshi Taka (৳) formatting, delivery calculators
│   └── server/
│       ├── actions/         # Server Actions (placeCodOrder, etc.)
│       ├── services/        # Product & category query services
│       └── mock-data.ts     # Rich offline mock catalog
```

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
* **Node.js** v20+ or v22+ installed on your computer.
* **Git** installed.

### 2. Installation
Open your terminal (Command Prompt, PowerShell, or macOS Terminal) and run:
```bash
# 1. Clone or open the project folder
cd "c:\Techspire Labs\Khelna Bazar By Labib"

# 2. Install dependencies
npm install

# 3. Copy environment configuration
cp .env.example .env

# 4. Generate Prisma Client
npx prisma generate

# 5. Start the development server
npm run dev
```

Open your browser and navigate to: **`http://localhost:3000`**  
The website will start immediately with the complete interactive storefront!

---

## 🔑 Demo Login Accounts

For local testing and demonstration, use these pre-configured credentials:

| Role | Email Address | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **👑 Admin (Owner)** | `admin@khelnabazar.com` | `Admin@Khelna123` | Full control: products, orders, COD cash, settings |
| **👔 Staff** | `staff@khelnabazar.com` | `Staff@Khelna123` | Orders, packing, inventory management |
| **🛍️ Customer** | `customer@khelnabazar.com` | `Customer@Khelna123` | Order tracking, wishlist, saved addresses, PlayPoints |

*(On the login screen, you can also click the quick **1-Click Demo Buttons** to log in instantly without typing).*

---

## 📚 Complete Beginner Guides

We have prepared comprehensive, jargon-free step-by-step guides for beginners:
* 📖 [**BEGINNER_GUIDE.md**](./BEGINNER_GUIDE.md) - A slow, friendly walkthrough from zero knowledge.
* ⚙️ [**SETUP_GUIDE.md**](./SETUP_GUIDE.md) - Exact local setup instructions.
* 🐙 [**GITHUB_GUIDE.md**](./GITHUB_GUIDE.md) - How to push your project to GitHub safely.
* ☁️ [**VERCEL_DEPLOYMENT_GUIDE.md**](./VERCEL_DEPLOYMENT_GUIDE.md) - How to deploy on Vercel for free.
* 🗄️ [**DATABASE_GUIDE.md**](./DATABASE_GUIDE.md) - Creating a free Neon Serverless PostgreSQL database.
* 🛡️ [**ADMIN_GUIDE.md**](./ADMIN_GUIDE.md) - How the store owner uses every admin screen.
* 🔧 [**TROUBLESHOOTING.md**](./TROUBLESHOOTING.md) - Common errors and their exact solutions.
* ⚖️ [**DECISIONS.md**](./DECISIONS.md) - Architectural decisions and deviations from the work order.

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
