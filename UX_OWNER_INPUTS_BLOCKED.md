# Khelna Bazar — Owner Inputs Blocked Register

**Date:** November 18, 2026  
**Document Status:** Authoritative Tracking of Unconfirmed Business Facts  
**Policy:** Per Section 0 & Section 8 of the Master UX Specification, Antigravity **NEVER** invents real-world business facts, pricing, courier rates, delivery coverage, or legal terms. Until the business owner officially provides and approves these items, they remain strictly unconfigured, hidden, or blocked in production code.

---

## 1. Blocked Business Inputs Register

| ID | Domain | Unconfirmed Feature / Claim | Reason for Block | Implementation Behavior Until Approved |
|---|---|---|---|---|
| **OIR-01** | **Shipping Rates** | Standard delivery fees (Inside Dhaka, Outside Dhaka) | The owner has not officially signed a courier contract establishing final flat rates. Defaulting to ৳60 / ৳120 was rejected in the audit. | Delivery rates are marked `null`/unconfigured in settings. Checkout checks quote validity; if unconfigured, customer is prompted to confirm delivery fee via WhatsApp/Call at `01712-039707`. |
| **OIR-02** | **Free Shipping** | Free shipping threshold (e.g. ৳1,500 / ৳2,000) | No merchant-approved free delivery campaign exists. | Free shipping threshold is `null` (disabled). No free shipping meter or marketing badges are shown. |
| **OIR-03** | **Express Delivery** | Same-day or Express delivery service & fee | Express courier logistics and surcharge (e.g. ৳150) are not contracted. | Express delivery option is disabled and hidden from cart and checkout. |
| **OIR-04** | **Delivery Coverage & ETA** | "Nationwide 64 Districts", "Same-Day Dispatch", "24-48 Hours Delivery" | Pathao / Steadfast SLA and serviceable pin codes are not formally verified. | Marketing claims of "64 districts" or specific delivery hours (24-48h) are removed from all headers, badges, and footers. |
| **OIR-05** | **MFS Instruction Type** | bKash / Nagad wallet instruction type (`Send Money` vs `Merchant Payment`) | Only receiver phone `01712039707` is verified. The merchant account type (Personal vs Merchant) is unconfirmed. | Payment screens display the phone number clearly without forcing or claiming "Send Money" or "Merchant Make Payment". |
| **OIR-06** | **Tax Inclusivity** | "All taxes included", VAT registration | National Board of Revenue (NBR) BIN/VAT registration and tax status have not been verified by Finance. | "Inclusive of all taxes" copy is removed from checkout and product pages. |
| **OIR-07** | **PlayPoints & Loyalty** | Earning rate (1 pt per ৳10), referral bonus (৳100), tiers (Bronze, Silver, Gold), birthday gifts | Complete financial model, liability ledger, and terms of service are unapproved. | Loyalty points UI, tiers, referral bonuses, and welcome bonus claims are disabled and hidden from account and auth screens. |
| **OIR-08** | **Promotional Coupons** | `KHELNA10` or automatic 10% discount | No active coupon campaign is approved by the owner. | Seed scripts do not activate `KHELNA10`. Coupon input remains functional for real future coupons created in Admin. |
| **OIR-09** | **Gift Wrapping** | Gift wrapping service fee (e.g. ৳50) and operational packaging capability | Staff packaging capacity and material costs are not established. | Gift wrapping toggle is disabled or marked unavailable. |
| **OIR-10** | **Safety Certifications** | "100% Recyclable", "Food-grade ABS", "ASTM/CE Certified", "Drop-tested 1.8m" | Lab certifications require individual SKU test certificates from importers. | Generic safety/lab testing badges are removed from PDP and hero. Genuine manufacturer age notices are displayed when provided. |
| **OIR-11** | **Customer Self-Cancellation** | Cancellation window (e.g. within 30 minutes, 1 hour, or prior to confirmation) | Operational policy for customer self-service cancellation window is not specified. | Orders awaiting verification or pending confirmation can be cancelled by calling/messaging customer support at `01712-039707`. |
| **OIR-12** | **SMS / OTP Provider** | SMS Gateway API credentials (e.g. Greenweb, BulkSMSBD) | SMS gateway credentials are not yet provisioned in `.env`. | Forgot-password displays verified manual hotline instructions (`01712-039707`) instead of simulating fake OTP codes. |

---

## 2. Unblocking Procedure

When the business owner provides verified data for any item above:
1. Update `.env` or store configuration in the Admin Console (`/admin/settings`).
2. Update the status in this register from `BLOCKED` to `APPROVED`.
3. Enable the corresponding feature toggle in `src/config/site.ts` or database settings.
