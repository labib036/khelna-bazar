# Troubleshooting Guide: Common Beginner Questions & Fixes

Encountering a warning or question? Here are the exact explanations and fixes.

---

## 1. "Port 3000 is already in use"
* **Why it happens**: Another terminal window or program is already running on port 3000.
* **Fix**:
  1. Close any extra terminal windows or run `npx kill-port 3000`.
  2. Or Next.js will automatically say: `Port 3000 is in use, trying 3001 instead`. In that case, simply open `http://localhost:3001` in your browser.

---

## 2. "Cannot connect to database / Neon"
* **Why it happens**: Your `.env` file has not been filled with your real Neon database credentials, or your internet connection was temporarily interrupted.
* **Fix**:
  * **Built-in Safety**: KHELNA BAZAR is designed with a resilient fallback system. If the database is unreachable, the site automatically serves the realistic mock catalog so your storefront never crashes!
  * To connect your live Neon database, follow [DATABASE_GUIDE.md](./DATABASE_GUIDE.md) to paste your real `DATABASE_URL` into `.env` and run `npm run db:push && npm run db:seed`.

---

## 3. "My image is not showing or shows broken"
* **Why it happens**: Next.js requires external image host domains to be listed in `next.config.ts`.
* **Fix**:
  * If you host toy photos on Cloudinary, Imgur, or your own CDN, open `next.config.ts` and add your image hostname under `remotePatterns`.
  * If using local images, place them inside `/public/images/` and reference them with leading forward slash: `/images/my-toy.jpg`.

---

## 4. "How do I change the store logo?"
* **Fix**:
  1. Put your logo image (e.g. `logo.png` or `logo.svg`) into the `/public/images/` folder.
  2. Open `src/config/site.ts`.
  3. Change `path: "/images/logo-placeholder.svg"` to `path: "/images/logo.png"`.
  4. Set `useTextFallback: false`.

---

## 5. "Where do I find placed Cash on Delivery orders?"
* **Fix**:
  1. Go to `http://localhost:3000/admin/orders`.
  2. Every placed order appears with the customer's phone number, delivery address, items, and total amount to collect.

---

## 6. "How do I reset or re-seed the demo database?"
* **Fix**:
  Run this command in your VS Code terminal:
  ```bash
  npm run db:seed
  ```
  This will refresh all categories, brands, 60+ realistic toy products, reviews, and demo users.
