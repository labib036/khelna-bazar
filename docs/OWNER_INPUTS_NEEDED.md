# Owner Inputs Needed

The following items are missing real-world values. As required by the launch guidelines, all related UI elements remain hidden until the owner provides these details in the store settings or via environment variables.

---

## 1. Contact & Business Identity
1. **Support Email**: An official email address (e.g., `support@khelnabazar.com.bd`). *(Currently hidden on all pages)*
2. **Business Address**: Registered physical office or dispatch hub in Bangladesh. *(Currently hidden on all pages)*
3. **Trade License / TIN / BIN**: Government registration numbers for Bangladesh e-commerce compliance. *(Currently hidden)*
4. **Operating / Support Hours**: Official hotline operating hours (e.g., `9:00 AM - 10:00 PM`). *(Currently omitted)*
5. **Original High-Resolution Logo**: Vector file (`.svg`) or high-resolution transparent `.png` of the circular logo with the spinning top (*latim*). *(Currently using an optimized, cleaned cutout of the provided JPEG)*
6. **Social Media Links**: Official Facebook page, Instagram profile, and YouTube channel URLs. *(Currently hidden in footer)*

---

## 2. Payments & Financial Details
1. **Wallet Account Type**: Confirm whether `01712039707` is a Personal, Merchant, or Agent account for bKash and Nagad, and whether customers should execute "Send Money" or "Payment". *(Currently defaulted to "Send Money")*
2. **Prepaid Refund Window**: Specific timeframe for refunding prepaid bKash/Nagad orders refused at delivery (e.g., 3–5 working days).
3. **Automated Payment Gateway**: If automated checkout is desired in the future, provide API credentials for SSLCommerz, Shurjopay, or bKash Tokenized Checkout.

---

## 3. Shipping & Logistics
1. **Delivery Coverage & Rates**:
   - Inside Dhaka delivery fee (currently default ৳60).
   - Outside Dhaka delivery fee (currently default ৳120).
   - Free shipping qualification threshold (currently default ৳1,500).
2. **Courier Partner Integration**: Choice of third-party courier API (e.g., Steadfast, Pathao, RedX) for automated consignment booking.

---

## 4. Policy Text Approval
1. Final review and formal approval of the **Returns and Refund Policy** in English and Bengali.
2. Review and completion of the draft **Terms & Conditions** and **Privacy Policy** in `/admin/settings/pages`.
