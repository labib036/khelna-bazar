# Khelna Bazar — Test Data & Fixture Cleanup Report

**Audit Date:** November 18, 2026  
**Auditor:** Autonomous QA Pipeline  

---

## 1. Synthetic QA Fixtures Inventory

The following synthetic records were seeded exclusively for automated testing and IDOR validation in the isolated local environment:

| Category | Record Identifier | Entity Key / Value | Purpose | Retained / Cleanup Strategy |
|:---|:---|:---|:---|:---|
| **User (Customer A)** | `cmwl8d0n50000olqgqcwdl4gk` | `qa.customer.a@example.test` | Customer Portal & Order History Scoping | Isolated to QA environment; wiped on production DB seed |
| **Order A** | `cmwl8hldg000aolb0xy88zf1x` | `KB-QA-A1001` (৳1,999) | Victim Order for IDOR Cross-Account Attack | Isolated to QA environment |
| **User (Customer B)** | `cmwl8d0nd0003olqgb9y4ukvw` | `qa.customer.b@example.test` | Attacker Account for Adversarial IDOR Testing | Isolated to QA environment |
| **Order B** | `cmwl8hldl000dolb0l3grcl8q` | `KB-QA-B2001` (৳2,450) | Attacker Order Baseline | Isolated to QA environment |
| **User (Staff)** | `cmwl8d0nj0006olqg7qlzu27i` | `qa.staff@example.test` | Least Privilege Verification (Orders only) | Isolated to QA environment |
| **User (Admin)** | `cmwl8d0nl0007olqgpxbyfula` | `qa.admin@example.test` | Operations Console Boundary Testing | Isolated to QA environment |
| **User (Super Admin)** | `cmwl8d0nq0008olqghobiut2t` | `qa.superadmin@example.test` | Staff Provisioning & Audit Log Inspection | Isolated to QA environment |
| **User (Auto Staff)**| `cmwl93gi70000olgkhy8fkaeu` | `qa.automated.staff@khelnabazar.com.bd` | Super Admin UI Account Creation Verification | Isolated to QA environment |

---

## 2. Production Essential Data Integrity (Preserved)

The production essential seed (`prisma/seed-essential.ts`) remains clean, unpolluted, and ready for production deployment:
1. **Core Store Configuration:**
   - Hotline: `01712-039707`
   - WhatsApp: `01712-039707`
   - Announcement: *"ডেলিভারি ম্যানের সামনে পণ্যটি দেখে নিয়ে তারপর গ্রহণ করুন | Hotline & WhatsApp: 01712-039707"*
   - Delivery Rates: Inside Dhaka `৳60`, Outside Dhaka `৳120`, Express `৳150`
   - Free Delivery Threshold: `৳1,500`
   - Doorstep Inspection Guarantee: `true` (Mandatory inspect-before-accept policy)
2. **Category Taxonomy:**
   - STEM & Robotics (`stem-robotics`)
   - Building Blocks & Lego (`building-blocks`)
   - Action Figures & Dolls (`action-figures-dolls`)
   - Board Games & Puzzles (`board-games-puzzles`)
   - RC & Diecast Vehicles (`rc-vehicles`)
   - Baby & Toddler Montessori (`baby-toddler`)
   - Arts, Crafts & DIY (`arts-crafts`)
3. **Official Launch Coupon:** `KHELNA10` (10% discount, min spend ৳1,000, cap ৳500).

---

## 3. Temporary Files & Local Server Teardown Verification

- Temporary diagnostic scripts (`scripts/check-users.ts`, `scripts/diagnose-login.ts`, `scripts/test-pglite-gateway.ts`) have been completely deleted from disk.
- All background daemon processes (PGlite port 5432, Next.js port 3000) have been terminated.
- `.env` and `.env.local` files remain safely excluded by `.gitignore`.
