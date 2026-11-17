# Khelna Bazar Design System (খেলনা বাজার)
**Version**: 2.0.0  
**Stack**: Next.js 16 (App Router), React 19, Tailwind CSS v4, TypeScript (Strict)  
**Target**: Bangladesh Premier Toy E-Commerce Marketplace  
**Compliance**: WCAG 2.1 AA Compliant ($\ge 4.5:1$ Contrast across Light & Dark Themes)

---

## 1. Design Principles

1. **Joyful & Playful without being Childish**:  
   We design for parents, gift-givers, and educators as much as children. Soft warm pastels, rounded corners, springy micro-interactions, and celebratory moments (like free-shipping confetti) create a delightful shopping experience while preserving high-converting marketplace ergonomics.

2. **Uncompromising Trust & Authenticity**:  
   Child safety is non-negotiable. Certified laboratory standards (ASTM F963, CE, BPA-Free) are highlighted prominently. Prices are transparent in Bangladeshi Taka (`৳` / BDT). **Zero fake content policy**: authentic review counters only when genuine customer reviews exist, clear empty states otherwise.

3. **Lightning Fast & Layout-Shift Free (Zero CLS)**:  
   Every image slot has strict aspect ratios (`aspect-square` 1:1 on product tiles). Skeletons mirror exact component geometries. Micro-interactions utilize optimistic UI state (instant add-to-bag morphing into quantity stepper).

4. **Accessible by Default (WCAG 2.1 AA)**:  
   All text combinations, badges, and button variants are mathematically verified to exceed $4.5:1$ contrast against their respective backgrounds in both light and dark themes. Interactive elements feature a minimum $44 \times 44\,\text{px}$ touch target on mobile and high-contrast focus rings (`focus-visible:ring-2 focus-visible:ring-primary/40`).

5. **Bilingual Typographic Harmony (English + Bengali)**:  
   Bengali script contains ascenders and descenders (matra, dirgho-i kar, ro-fola) that clip under standard English line heights. Bengali text runs with explicit line height (`leading-[1.65]` or higher) and vertical alignment to ensure clean legibility.

---

## 2. Brand Tokens & CSS Variables

Tokens are declared in `src/styles/globals.css` and connected to Tailwind CSS v4 via `@theme inline`.

### 2.1 Color Ramp

#### Primary (Warm Joyful Orange)
| Token | Light Theme Value | Dark Theme Value | Contrast vs Surface | Usage |
| :--- | :--- | :--- | :--- | :--- |
| `--primary` | `#C2410C` (Orange 700) | `#FF6A22` (Vibrant Amber) | $\ge 5.2:1$ | Primary CTA buttons, brand badges, active tab indicators |
| `--primary-hover` | `#9A3412` (Orange 800) | `#FF8544` | $\ge 5.0:1$ | Button hover and active states |
| `--primary-subtle` | `#FFF7ED` (Orange 50) | `rgba(255, 106, 34, 0.12)` | N/A | Pill backgrounds, active navigation highlight |

#### Semantic Surfaces (Pastel Tints)
Used for playful category cards, benefit strips, and callouts without visual fatigue:
- `--surface-peach`: `oklch(0.97 0.025 45)` (Light) / `oklch(0.22 0.025 45)` (Dark)
- `--surface-sun`: `oklch(0.98 0.035 85)` (Light) / `oklch(0.22 0.035 85)` (Dark)
- `--surface-mint`: `oklch(0.97 0.03 160)` (Light) / `oklch(0.22 0.03 160)` (Dark)
- `--surface-sky`: `oklch(0.97 0.025 230)` (Light) / `oklch(0.22 0.025 230)` (Dark)
- `--surface-lilac`: `oklch(0.97 0.025 300)` (Light) / `oklch(0.22 0.025 300)` (Dark)

#### Neutral & Ink Ramp
- Light Theme:
  - Background: `#FFFFFF`
  - Elevated Card: `#FFFFFF` with `--shadow-xs` / `--shadow-sm`
  - Text Primary: `#0F172A` (Slate 900, $15.8:1$ contrast)
  - Text Muted: `#475569` (Slate 600, $5.6:1$ contrast)
  - Borders: `#E2E8F0` (Slate 200)
- Dark Theme:
  - Background: `#0B0F17` (Deep Midnight Blue)
  - Elevated Card: `#131A26`
  - Elevated Surface 2: `#1C2536`
  - Text Primary: `#F8FAFC` (Slate 50)
  - Text Muted: `#94A3B8` (Slate 400, $5.2:1$ contrast)
  - Borders: `#1E293B` (Slate 800)

### 2.2 Typography

Configured via `next/font/google` in `src/app/layout.tsx`:

```css
--font-sans: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
--font-heading: 'Fredoka', cursive, system-ui, sans-serif;
--font-bangla: 'Hind Siliguri', 'Plus Jakarta Sans', sans-serif;
```

- **Headings (`font-heading`)**: `Fredoka` font gives rounded, approachable personality to section titles, badge numerals, and promotional banners.
- **Body & UI (`font-sans`)**: `Plus Jakarta Sans` delivers crisp micro-typography, high legibility for product specs, prices, and administrative tables.
- **Bengali (`font-bangla`)**: `Hind Siliguri` optimized with `.bn-text { font-family: var(--font-bangla); line-height: 1.65; }` preventing matra clipping across mobile screens.

### 2.3 Radii & Elevation

```css
--radius-sm: 0.375rem;   /* 6px  - small badges, tooltips */
--radius-md: 0.625rem;   /* 10px - inputs, buttons */
--radius-lg: 0.875rem;   /* 14px - cards, dialogs, drawers */
--radius-xl: 1.25rem;    /* 20px - hero banners, category tiles */
--radius-full: 9999px;   /* Pills, status tags, avatars */
```

- **Shadows**:
  - `--shadow-xs`: `0 1px 2px rgba(15, 23, 42, 0.05)`
  - `--shadow-sm`: `0 2px 6px -1px rgba(15, 23, 42, 0.07)`
  - `--shadow-md`: `0 6px 16px -2px rgba(15, 23, 42, 0.08)`
  - `--shadow-lg`: `0 12px 28px -4px rgba(15, 23, 42, 0.10)`
  - `--shadow-glow`: `0 0 20px -2px rgba(194, 65, 12, 0.25)`

### 2.4 Motion & Transitions

- `--duration-fast`: `150ms` (hover, active button presses)
- `--duration-normal`: `250ms` (dialog transitions, drawer sliding)
- `--ease-spring`: `cubic-bezier(0.34, 1.56, 0.64, 1)` (haptic bouncy lift)
- `--ease-out`: `cubic-bezier(0.16, 1, 0.3, 1)` (smooth deceleration)
- Strict `@media (prefers-reduced-motion: reduce)` override disables all bounce and transforms for users requesting reduced motion.

---

## 3. Reusable Component Library (`src/components/ui/`)

| Component | Location | Key Props / Capabilities | Accessibility |
| :--- | :--- | :--- | :--- |
| `Button` | `src/components/ui/button.tsx` | `variant`: primary, secondary, outline, ghost, danger, accent, soft, sun, mint. `size`: sm, md, lg, icon, icon-sm. `isLoading`, `leftIcon`, `rightIcon`. | Focus visible ring, active haptic scale feedback, aria-busy |
| `IconButton` | `src/components/ui/button.tsx` | `aria-label` mandatory, circular or rounded square icon trigger | Min 44px tap area on mobile |
| `Badge` | `src/components/ui/badge.tsx` | `variant`: primary, secondary, outline, success, warning, danger, accent, sun, mint. `size`: sm, md. `dot`, `onRemove`. | Semantic color pairing, contrast $\ge 4.5:1$ |
| `Card` | `src/components/ui/card.tsx` | Modular `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`. `interactive` prop triggers `.card-hover-lift`. | Clean semantic HTML grouping |
| `Input` | `src/components/ui/input.tsx` | `label`, `error`, `helperText`, `leftIcon`, `rightIcon`, `onClear`. | Native label pairing, `aria-invalid`, `aria-describedby` |
| `PhoneInput` | `src/components/ui/phone-input.tsx` | BD Carrier format aware (`+880` prefix, Grameenphone, Banglalink, Robi, Airtel, Teletalk detection). | Visual check indicator, carrier prefix auto-formatting |
| `QuantityStepper`| `src/components/ui/quantity-stepper.tsx` | `value`, `min`, `max`, `step`, `onChange`, `size` ('sm' \| 'md'). | Accessible `+`/`-` buttons, keyboard arrow support |
| `Tabs` | `src/components/ui/tabs.tsx` | `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` with animated active pill indicator. | WAI-ARIA tab pattern, arrow key navigation |
| `Drawer` | `src/components/ui/drawer.tsx` | Side sheet on desktop, bottom sheet on mobile with drag handle. | Esc to close, scroll-lock, inert backdrop |
| `Dialog` | `src/components/ui/dialog.tsx` | Centered modal with smooth backdrop blur and spring scale entrance. | Focus trap, accessible close trigger, aria-modal |
| `Skeleton` | `src/components/ui/skeleton.tsx` | Zero-CLS skeletons: `ProductCardSkeleton`, `TableRowSkeleton`, `StatCardSkeleton`. | `aria-hidden="true"`, shimmer wave animation |
| `EmptyState` | `src/components/ui/empty-state.tsx` | Integrates custom SVG illustrations, title, description, and primary CTA. | Polite voiceover announcements |
| `StatCard` | `src/components/ui/stat-card.tsx` | KPI display with animated change pill, SVG sparkline trend, and count values. | Screen reader friendly value descriptions |
| `StatusPill` | `src/components/ui/status-pill.tsx` | Type-safe status mapper for Order status, Payment status, COD verification. | High contrast pill with colored status dot |
| `CommandPalette`| `src/components/ui/command-palette.tsx` | Global search (`⌘K` / `Ctrl+K`) for rapid navigation, product search, and actions. | Keyboard up/down/enter trap, instant jump |
| `Illustrations` | `src/components/ui/illustrations.tsx` | Custom SVG illustrations using `currentColor`: `EmptyCartIllustration`, `EmptyWishlistIllustration`, `NoResultsIllustration`, `NoOrdersIllustration`, `OrderSuccessIllustration`, `SafetyShieldIllustration`, `NotFoundIllustration`. | Scalable, dark-mode aware via CSS variables |

---

## 4. Storefront Patterns

### 4.1 Global Navigation & Header
- **Announcement Bar**: Rotating carousel featuring Free Delivery threshold, nationwide Cash on Delivery, and Toy Safety Guarantee. Slim, dismissible with persistence in `localStorage`.
- **Two-Tier Header**: Sticky shrink-on-scroll effect with backdrop blur (`backdrop-blur-md`). Houses language toggle, theme toggle, search bar with `⌘K` trigger, wishlist badge, and mini-cart trigger.
- **Mobile Bottom Nav**: Fixed bottom bar (`h-16`) on mobile viewports. Strictly hidden on desktop (`hidden max-md:block`) and suppressed on checkout, auth, and admin routes. Features 5 primary touch actions (Home, Categories, Search, Cart, Account).

### 4.2 Product Presentation
- **Aspect Ratio 1:1**: Product images render inside `aspect-square` containers with `object-contain` or `object-cover` to prevent Cumulative Layout Shift (CLS).
- **Add-to-Bag Morphing**: Clicking "Add to Bag" on a product card immediately morphs the button into an in-place `QuantityStepper`, reducing cart abandonment and friction.
- **Authentic Reviews Policy**: Rating stars and review counts are rendered **only** when `product.ratingCount > 0`. If unreviewed, a clean, honest "Be the first to review" or certification badge is shown instead of fabricated ratings.

### 4.3 Cart & Checkout
- **Free Shipping Progress Meter**: Dynamic calculation toward the `1,500৳` free shipping threshold. Features celebratory confetti (reduced-motion safe) upon unlocking.
- **Bangladeshi Checkout Ergonomics**:
  - Validated `PhoneInput` with BD carrier prefix.
  - Payment method cards with clear instructions for Cash on Delivery, bKash, and Nagad.
  - Collapsible order summary on mobile viewports.
  - Double-submit prevention on order submission.

---

## 5. Admin Operations Console

- **Locked-Viewport Ergonomics**: Collapsible icon rail (`w-20` collapsed, `w-64` expanded) with tooltips, fixed sticky topbar, and independently scrolling content area.
- **Bento KPI Analytics**: Top-level cards with SVG sparklines, week-over-week trends, and operational "Needs Attention" alert badges.
- **Dual-Mode Order Management**:
  - **Table View**: Compact, sortable data table with sticky headers, customer phone quick-call, and status pills.
  - **Kanban Board View**: 5-column fulfillment pipeline (`Phone Verification`, `Confirmed`, `Packed`, `Shipped`, `Delivered`) for visual warehouse dispatch.
- **Printable Invoices**: Native `@media print` styling for A4 customer invoices and 100mm thermal packing slips.

---

## 6. Bilingual Guidelines (English & Bengali)

1. **Font Pairing**:
   - English: `Plus Jakarta Sans` or `Fredoka`.
   - Bengali: `Hind Siliguri`.
2. **Line Heights**:
   - Always use `.bn-text` or `leading-relaxed` (`leading-[1.65]`) on Bengali phrases to ensure matras do not touch or clip the line above.
3. **Number Formatting**:
   - Currency symbol `৳` precedes or follows numeric values consistently (`৳১,৫০০` or `1,500 ৳`).

---

## 7. Component Showcase

An internal interactive component library showcase is hosted at `/dev/ui`. It serves as a living styleguide and visual regression testbed for all tokens, variants, inputs, dialogs, drawers, and illustrations.
