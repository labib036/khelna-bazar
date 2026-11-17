# Visual Asset & Imagery Audit (ASSET_AUDIT.md)

This document inventories all visual brand assets, logos, product photography sources, vector illustrations, and fallback handling across **Khelna Bazar**.

---

## 1. Brand Asset Inventory (`/public/`)

| Asset Path | Format | Size | Resolution | Purpose & Location | Alt Text / Accessibility | Quality Assessment |
| :--- | :--- | :---: | :---: | :--- | :--- | :--- |
| `/images/khelna-bazar-logo.png` | PNG | 493 KB | 1024 × 1024 | Primary brand mark in header & footer | `alt="Khelna Bazar Logo"` | **High Quality (Crisp vector render)** |
| `/images/khelna-bazar-logo.webp`| WebP | 492 KB | 1024 × 1024 | Modern format equivalent for modern browsers | `alt="Khelna Bazar Logo"` | **Optimized delivery** |
| `/images/khelna-bazar-logo.gif` | GIF | 328 KB | 600 × 600 | Animated spinning toy logo | Decorative / Splash | Use with `prefers-reduced-motion` |
| `/images/khelna-bazar-logo.mp4` | MP4 | 50 KB | 600 × 600 | Video variant of animated brand identity | Video player fallback | Extremely compact (50 KB) |
| `/images/logo-placeholder.svg` | SVG | 1.6 KB | Scalable | Safe vector fallback when image is loading | Semantic SVG | Zero layout shift |
| `/favicon.ico` & `/favicon.png`| ICO/PNG| 3 KB | 32 × 32 | Browser tab identity | N/A | Crisp favicon |
| `/icon-192.png` & `icon-512.png`| PNG | 60KB/360KB| 192px/512px | PWA manifest icons & mobile home screen icon| PWA manifest | Standard PWA compliant |

---

## 2. Custom SVG Vector Illustration Library (`src/components/ui/vector-illustrations.tsx`)

To avoid generic stock photography and broken external hotlinks, custom SVG vector illustrations were authored directly as React components:

1. **`EmptyCartIllustration`**:
   - *Visual*: Whimsical toy wagon filled with stars, teddy bear ears, and colorful building blocks.
   - *Dimensions*: Scalable vector (viewBox `0 0 320 240`).
   - *Color Palettes*: Uses semantic CSS variables (`--primary`, `--warning`, `--accent`).
   - *Location*: Rendered in Mini-Cart Drawer and `/cart` when empty.
2. **`NotFoundIllustration`**:
   - *Visual*: Lost child toy astronaut floating amongst star-shaped toys and satellite blocks.
   - *Dimensions*: Scalable vector (viewBox `0 0 400 300`).
   - *Location*: Rendered on the 404 page (`/non-existent-page`).
3. **`SafetyShieldIllustration`**:
   - *Visual*: Golden shield with CE checkmark surrounded by child toy emblems.
   - *Location*: Trust guarantee strip on homepage and checkout.
4. **`DeliveryTruckIllustration`**:
   - *Visual*: Express courier van with Bangladeshi flag green and red accents.
   - *Location*: Shipping policy and order confirmation screen.

---

## 3. Product Photography & Image Stage Guidelines

### 3.1 Media Containers & Cropping Rules
- **Aspect Ratio**: Locked to **1:1 square ratio** across all product cards, category grids, and cart item thumbnails.
- **Object Fitting**: Configured with `object-contain` on neutral tinted surfaces (`--surface-elevated`) so toy boxes, board game cartons, and plush toys remain 100% visible without cropped edges.
- **Image Priority**: Only the primary LCP image on the active slide of the homepage hero is loaded with `priority={true}`. All other product listing and recommendation images use lazy loading (`loading="lazy"`).
- **Broken Image Fallback**: In `src/components/product/product-card.tsx`, images include an `onError` handler that automatically swaps a broken URL with `/images/logo-placeholder.svg`, preventing broken image icons.

---

## 4. Asset Hygiene & Security Compliance
- Zero hotlinked images from unverified third-party ad networks or tracking servers.
- All remote image domains configured strictly in `next.config.ts` under `images.remotePatterns`.
- File sizes optimized: SVG vector art is used for all UI icons and illustrations, keeping first-load JS payload minimal.
