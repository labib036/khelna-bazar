# Khelna Bazar — Production Launch Checklist

Use this pre-flight checklist prior to launching Khelna Bazar publicly on production (e.g. Vercel, Railway, VPS) with PostgreSQL (Neon Serverless).

---

## 1. Environment & Infrastructure Setup

- [ ] **Provision Managed PostgreSQL Database**:
  - Sign up for [Neon](https://neon.tech) (or preferred PostgreSQL provider).
  - Create a new project in the Singapore (`ap-southeast-1`) or nearest Asian region.
  - Copy both **Pooled Connection String** (`DATABASE_URL`) and **Direct Non-Pooled Connection String** (`DIRECT_URL`).
- [ ] **Generate Production Auth Secret**:
  - Run `openssl rand -base64 32` in terminal.
  - Set `AUTH_SECRET` and `NEXTAUTH_SECRET` in production environment settings.
- [ ] **Configure Canonical URLs**:
  - Set `NEXTAUTH_URL="https://yourdomain.com.bd"`
  - Set `AUTH_URL="https://yourdomain.com.bd"`
  - Set `NEXT_PUBLIC_SITE_URL="https://yourdomain.com.bd"`
- [ ] **Configure Business Identity & Compliance**:
  - `STORE_HOTLINE`: Valid 11-digit customer hotline (e.g. `017XXXXXXXX`).
  - `STORE_EMAIL`: Official support email (e.g. `support@yourdomain.com.bd`).
  - `STORE_ADDRESS`: Physical office/warehouse address in Bangladesh.
  - `STORE_TRADE_LICENSE`: Dhaka City Corporation Trade License Number.
  - `STORE_BIN`: 9-digit Business Identification Number (VAT registration).
  - `STORE_TIN`: Tax Identification Number.
- [ ] **Configure Payment Gateways / MFS Accounts**:
  - `BKASH_MERCHANT_NUMBER`: bKash Merchant / Personal receiving number.
  - `NAGAD_MERCHANT_NUMBER`: Nagad Merchant / Personal receiving number.

---

## 2. Database Migration & Initialization

- [ ] **Run Database Migrations**:
  ```bash
  npx prisma migrate deploy
  ```
- [ ] **Seed Essential Store Data**:
  ```bash
  npm run db:seed:essential
  ```
  *(Installs default categories, shipping rates, and legal CMS policies. Zero fake products, fake orders, or demo credentials.)*
- [ ] **Create Primary Store Owner Account**:
  ```bash
  npm run admin:create
  ```
  - Enter owner's name, email, phone number, and a strong password (minimum 8 characters).

---

## 3. Catalog & Inventory Setup

- [ ] Log in at `https://yourdomain.com.bd/admin`.
- [ ] Go to **Product Catalog** (`/admin/products`):
  - Add your initial toy products with genuine titles, descriptions, and high-resolution images.
  - Set accurate stock counts, safety badges, and age categories.
- [ ] Go to **Inventory Stock** (`/admin/inventory`):
  - Review warehouse stock counts and initial inventory levels.
- [ ] Go to **Coupons & Deals** (`/admin/coupons`):
  - Create any launch discount codes (e.g., `WELCOME10` or `LAUNCHFREE`).

---

## 4. Security & Compliance Verification

- [ ] **Launch Guard**:
  - Ensure `SKIP_LAUNCH_GUARD` is `false` (or unset). `launch-guard.ts` automatically asserts database connectivity and minimum 32-byte `AUTH_SECRET` during server startup.
- [ ] **Edge Middleware Route Protection**:
  - Verify that navigating to `/admin` without an active session redirects to `/login`.
  - Verify that non-admin accounts receive `403 Access Denied` on `/admin/*`.
- [ ] **Password Security**:
  - Verify no plaintext passwords exist in database or code (all passwords hashed via `bcryptjs` cost 12).
- [ ] **Security Headers**:
  - Verify HTTPS HSTS, `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, and `Referrer-Policy: strict-origin-when-cross-origin` are active in production HTTP responses.

---

## 5. End-to-End Operational Smoke Test

- [ ] **Storefront Browsing**:
  - Browse home page, category pages (`/c/all`), and product detail pages (`/p/[slug]`).
  - Test live autocomplete search bar with toy keywords.
  - Test English / বাংলা language toggle in the header.
- [ ] **Cash on Delivery (COD) Order Flow**:
  - Add a toy to cart.
  - Proceed to checkout (`/checkout`).
  - Fill in recipient name, 11-digit mobile number (`01[3-9]XXXXXXXX`), and delivery address.
  - Place order using Cash on Delivery.
  - Verify order confirmation screen appears with sequential order number (e.g. `KB-2611-000001`).
- [ ] **Order Tracking Flow**:
  - Visit `/track-order`.
  - Search order using Order Number and phone number.
  - Verify real-time status stepper and timeline load correctly.
- [ ] **Admin Operations & Reconciliation Flow**:
  - Visit `/admin/orders`.
  - Verify new order appears under **Needs Attention** alert.
  - Advance status: `CONFIRMED` &rarr; `PACKED` &rarr; `SHIPPED` (with courier tracking number) &rarr; `DELIVERED`.
  - Test **Print Invoice** (A4) and **Thermal Packing Slip** (100mm).
  - Click **Record Full Cash Collected** to reconcile COD payment as `COLLECTED`.
- [ ] **Manual bKash/Nagad Test**:
  - Place a test order selecting bKash/Nagad with sender number and sample TrxID.
  - Verify order starts in `AWAITING_VERIFICATION`.
  - In Admin Orders, verify the alert and test **Approve MFS** action.

---

## 6. Post-Launch Operations

- [ ] Set up courier API integration or daily dispatch routine with Steadfast / Pathao courier.
- [ ] Submit sitemap URL (`https://yourdomain.com.bd/sitemap.xml`) to Google Search Console.
- [ ] Monitor error logs in your hosting dashboard (Vercel / Railway).
- [ ] Ensure customer care hotline is actively staffed during operating hours (9 AM – 10 PM BST).
