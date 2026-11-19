# Khelna Bazar QA Assumptions & Decisions Log

This document records all engineering decisions and operational assumptions for the **panels-fixes** remediation.

---

## 1. Verified Owner Facts (Non-Negotiable)
- **Hotline & WhatsApp:** `01712039707` (`01712-039707`). Targets: `tel:+8801712039707` and `https://wa.me/8801712039707`.
- **Payment Receiving Accounts:** bKash and Nagad numbers are `01712039707`. Transaction type is configured in Store Settings.
- **Cash on Delivery (COD):** Primary payment method.
- **Return & Refund Policy:** Strictly inspection at delivery in front of the courier. Defective items reported at delivery time are refundable. No change-of-mind refunds post-acceptance.
- **Currency:** BDT only (৳).
- **Missing Information:** Company address, support email, trade license, TIN/BIN are hidden when empty, never populated with mock data.

---

## 2. Technical & Architecture Decisions
- **Throwaway Database:** PostgreSQL running on local port `5432` via `pglite` test gateway. No production databases are touched.
- **Image Storage:** Vercel Blob client-upload via signed tokens with client-side fallback/mocking for offline test environments.
- **Role Hierarchy:**
  - `CUSTOMER`: Shopper accounts. Access strictly restricted to Storefront and `/dashboard/*`.
  - `STAFF`: Operational role. Access strictly to `/admin/dashboard` and `/admin/orders`.
  - `ADMIN`: Business manager. Access to `/admin/*` except `/admin/staff` and `/admin/audit-logs`.
  - `SUPER_ADMIN`: Root administrator. Exclusive access to staff management and audit logs.
- **Admin Storefront Preview:** Admins can preview public storefront routes with a slim "Admin Preview" bar that includes a direct link back to `/admin/dashboard`. Admin accounts cannot submit retail checkout orders.
