# Khelna Bazar Launch Assumptions & Decisions Log

This document records all engineering and design decisions taken autonomously to ensure safety, performance, and alignment with the owner's instructions and the Google Stitch design system.

---

## 1. Owner & Business Decisions
- **Contact Details**: Hotline and WhatsApp are set to `01712039707` (`01712-039707`), per `OWNER_INPUTS.md`. Link targets: `tel:+8801712039707` and `https://wa.me/8801712039707`.
- **Missing Contact Fields**: Business address, support email, trade license, and opening hours are not yet provided by the owner. These fields are completely hidden from UI components until provided via admin settings.
- **Payment Methods**:
  - Cash on Delivery (COD) enabled by default.
  - bKash and Nagad enabled with payment receiver number `01712039707`.
  - Default payment instruction set to "Send Money" (editable in Settings).
  - TrxID and sender phone number collection required during checkout; recorded as "Awaiting Verification" until admin approves or rejects.
- **Return & Refund Policy**:
  - Strictly limited to defective items inspected in front of the delivery person at delivery time.
  - Post-acceptance returns and refunds are not permitted.
  - Mandatory inspection acknowledgment checkbox enforced at checkout.
  - All mock certification badges ("ASTM F963", "CE Certified", "100% Non-Toxic", "Choking Hazard Audited") removed. Only real product attributes (age range, choking hazard warning if small parts) displayed when populated.

---

## 2. Design System & Stitch Parity
- **Color Palettes**:
  - Light theme: `joyful_toy_bazaar` tokens (`primary = #D71921`, `primary-container = #AE0012`, `secondary-container = #FDB813`, `tertiary = #1E5BFF`, `background = #FFF8F6`).
  - Dark theme: `nocturnal_toy_emporium` tokens (`surface = #0D1320`, `primary-container = #FF4D58`, `secondary = #FFD07C`, `mint = #10B981`, `text = #F8FAFC`).
  - Obsolete theme: `toy_wonderland_marketplace` (blue primary) discarded.
- **Typography**:
  - Headings & Labels: Plus Jakarta Sans via `next/font`.
  - Body Text: Inter via `next/font`.
  - Bengali Text: Hind Siliguri via `next/font`.
  - Numbers & Currency: Tabular numerals with `৳` symbol.
- **Admin Shell**:
  - Implemented with a dedicated layout (`h-dvh`, fixed sidebar, topbar with command palette `Cmd+K`).
  - Completely stripped of storefront header, announcement bar, footer, and newsletter.
- **Material Symbols**:
  - Self-hosted subset of icons; zero reliance on Google CDN or external font links.

---

## 3. Security & Architecture
- **Auth**: Server-side only via NextAuth.js (`next-auth` v5 beta) with credentials provider (bcrypt cost 12).
- **Session**: Client `auth-store.ts` completely eliminated.
- **Secrets**: `AUTH_SECRET` (>= 32 chars) and `ORDER_TOKEN_SECRET` strictly required in production without fallback.
- **Database Seed**: `prisma/seed.ts` removed. `prisma/seed-essential.ts` supplies initial system settings, return policy, and starter categories only. `prisma/seed-sample.ts` for development only.
- **Admin Creation**: Executed strictly via `npm run admin:create` CLI with one-time generated password.
