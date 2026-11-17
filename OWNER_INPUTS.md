# KHELNA BAZAR: OWNER INPUTS ADDENDUM (real business details)

> **How to use:** save this file in the repo root as `OWNER_INPUTS.md` and add one line to the Antigravity task: *"Also read `OWNER_INPUTS.md`. These are the owner's confirmed real details. Use them exactly. They override any placeholder, Stitch demo content, or earlier assumption in the other prompt files."*

This file replaces the open items in `docs/OWNER_INPUTS_NEEDED.md` (Part 12 of the master prompt) that are answered below. Anything not answered here stays hidden until the owner provides it.

---

## 1. CONFIRMED CONTACT DETAILS

| Item | Value | How to use it |
| --- | --- | --- |
| Hotline (call) | `01712039707` | Settings key `contact.hotline`. Display as `01712-039707` (or `+880 1712-039707` in Bangla/English footer). Link with `tel:+8801712039707`. |
| WhatsApp | `01712039707` (same number) | Settings key `contact.whatsapp`. Link with `https://wa.me/8801712039707`. Show a WhatsApp help button only because this is set. |
| Support email | **not provided** | Hide every email line and `mailto:` until provided. |
| Business address | **not provided** | Hide address blocks until provided. |
| Business registration / TIN / BIN | **not provided** | Hide until provided. Never invent. |
| Opening/support hours | **not provided** | Do not show hours or "24/7". Say nothing about availability. |

**Replace every placeholder in the code:** `+880 1700-000000`, `01700000…`, `wa.me/8801700000000`, `+880 1711-000001`, and any other fake number, with the Settings values above. The seed script must set these only in `seed-essential.ts`, as editable Settings defaults, not hardcoded in components. Components read from Settings and hide empty fields.

---

## 2. CONFIRMED PAYMENT DETAILS

The owner's wallet number for **both bKash and Nagad** is **`01712039707`**.

- Settings keys: `payments.bkash.number = "01712039707"`, `payments.nagad.number = "01712039707"`, `payments.bkash.enabled = true`, `payments.nagad.enabled = true`, `payments.cod.enabled = true`.
- The **wallet type** (personal, agent or merchant) and which transaction type customers should use ("Send Money" or "Payment") was **not specified**. Make this an admin-editable Settings field (`payments.bkash.instructionType`, `payments.nagad.instructionType`). **Default the customer instruction to "Send Money"** and add `docs/OWNER_INPUTS_NEEDED.md` item: "Confirm whether the wallet is Personal or Merchant and whether customers should use Send Money or Payment."
- **Checkout instruction text for bKash/Nagad** (editable in Settings, shown only when that method is enabled and the number is set):
  - English: *"Send ৳{amount} to {method} number {number}. Then enter the sender number and the Transaction ID (TrxID) below. We will verify your payment and confirm your order."*
  - Bangla: *"{method} নম্বর {number}-এ ৳{amount} পাঠান। তারপর নিচে প্রেরকের নম্বর ও ট্রানজ্যাকশন আইডি (TrxID) দিন। আমরা পেমেন্ট যাচাই করে আপনার অর্ডার নিশ্চিত করব।"*
- **Flow (keep honest):** order is created as *Awaiting payment verification*; the admin sees sender number + TrxID and clicks **Verify** or **Reject**; the customer sees a clear pending/verified/rejected state; the order is not shipped until verified. Validate the sender number with `^01[3-9]\d{8}$` and TrxID as alphanumeric 8 to 12 characters (admin-adjustable). Add a copy-number button and show the number in a large readable format.
- **Fraud protection:** rate-limit submissions, reject duplicate TrxIDs across orders, flag mismatched amounts, and record who verified the payment in the audit log.
- Cash on Delivery remains the default option.

---

## 3. CONFIRMED RETURN / REFUND POLICY (the only trust claims allowed)

The owner's rule, in plain terms:
1. **Defective products can be refunded and returned.**
2. **The customer must inspect the product during delivery** (in front of the delivery person) **before accepting it.**
3. **After the customer has inspected and accepted/received the product, it is not refundable.**

**Do NOT claim** anything beyond this. Specifically **remove** these Stitch/demo claims everywhere: "30-day hassle-free returns", "Zero tears refund policy", "Easy returns", "Free returns", "ASTM & CE Certified", "100% Non-Toxic", "Safety Certified", "Choking Hazard Audited", "Lab tested", "Certified" and any similar certification or guarantee wording. Show a product's age range and choking-hazard warning only from real product data entered in admin.

### Allowed trust strip / badges (replace the Stitch ones)
| Badge title | Subtitle |
| --- | --- |
| Inspect Before You Accept | Check your toy in front of the delivery person |
| Defective? We Refund | Refund for defective products reported at delivery |
| Cash on Delivery | Pay when you receive your order |
| Order Support | Call or WhatsApp 01712-039707 |

Bangla equivalents:
- ডেলিভারির সময় দেখে নিন: *ডেলিভারি ম্যানের সামনেই খেলনাটি পরীক্ষা করুন*
- ত্রুটিপূর্ণ হলে রিফান্ড: *ডেলিভারির সময় ত্রুটি ধরা পড়লে রিফান্ড*
- ক্যাশ অন ডেলিভারি: *পণ্য হাতে পেয়ে টাকা দিন*
- অর্ডার সহায়তা: *কল বা হোয়াটসঅ্যাপ করুন 01712-039707*

*(Only show "Cash on Delivery" if the COD setting is enabled. Do not claim delivery to "all 64 districts" or specific delivery times until the owner confirms coverage and zones in Settings.)*

### Where to show the policy (short version)
Show this one-line notice on the **product page** (near Add to Cart), in the **cart/mini-cart**, at **checkout above Place Order**, and on the **order success page and tracking page**:

- English: *"Please inspect your product in front of the delivery person before accepting. Defective items can be refunded or returned if reported at delivery. Items cannot be refunded after you accept them."*
- Bangla: *"ডেলিভারি ম্যানের সামনে পণ্যটি দেখে নিয়ে তারপর গ্রহণ করুন। ডেলিভারির সময় ত্রুটি ধরা পড়লে পণ্য ফেরত ও রিফান্ড করা যাবে। পণ্য গ্রহণ করার পর রিফান্ড করা হবে না।"*

Add a **required checkbox at checkout**: *"I understand I must inspect the product at delivery, and that refunds are not possible after I accept it."* (Bangla: *"আমি বুঝেছি যে ডেলিভারির সময় পণ্য দেখে নিতে হবে এবং গ্রহণ করার পর রিফান্ড করা হবে না।"*). Store the acceptance with the order.

### Full policy page (`/pages/returns-refund`, editable in admin, EN + BN)
Draft for the owner to review (the owner decides the final wording; this is not legal advice):

**Returns and Refund Policy**
1. **Inspect at delivery.** When your order arrives, please open and check the product in front of the delivery person before you accept it and before you pay (for Cash on Delivery).
2. **Defective or wrong products.** If the product is defective, damaged or not what you ordered, tell the delivery person and refuse the item at the door. Contact us on 01712-039707 (call or WhatsApp) the same day. We will refund you (or replace the item if you prefer, subject to stock).
3. **Cash on Delivery orders.** If you refuse a defective item at delivery, you do not pay for it.
4. **Prepaid orders (bKash/Nagad).** If a defective item is returned at delivery, we refund the amount to the number you paid from. Refund time: *{owner to set, e.g. a number of working days}*.
5. **After you accept the product.** Once you have inspected the product, accepted it and received it, it cannot be refunded.
6. **Change of mind.** Products cannot be returned or refunded because of a change of mind after acceptance.
7. **Contact.** Call or WhatsApp 01712-039707.

Bangla version (same structure; have the owner proofread):
**ফেরত ও রিফান্ড নীতি**
1. **ডেলিভারির সময় পরীক্ষা করুন।** অর্ডার হাতে পেলে ডেলিভারি ম্যানের সামনে পণ্যটি খুলে দেখে নিন, তারপর গ্রহণ করুন এবং (ক্যাশ অন ডেলিভারির ক্ষেত্রে) টাকা দিন।
2. **ত্রুটিপূর্ণ বা ভুল পণ্য।** পণ্য ত্রুটিপূর্ণ, ক্ষতিগ্রস্ত বা অর্ডারের সাথে না মিললে ডেলিভারি ম্যানকে জানিয়ে পণ্যটি গ্রহণ করবেন না এবং সেদিনই 01712-039707 নম্বরে কল বা হোয়াটসঅ্যাপ করুন। আমরা রিফান্ড দেব (অথবা আপনি চাইলে স্টক সাপেক্ষে পণ্য বদলে দেব)।
3. **ক্যাশ অন ডেলিভারি অর্ডার।** ত্রুটিপূর্ণ পণ্য দরজায় ফেরত দিলে আপনাকে তার জন্য টাকা দিতে হবে না।
4. **প্রিপেইড অর্ডার (বিকাশ/নগদ)।** ডেলিভারির সময় ত্রুটিপূর্ণ পণ্য ফেরত দিলে আপনি যে নম্বর থেকে টাকা পাঠিয়েছেন সেখানে রিফান্ড করা হবে। সময়: *{মালিক নির্ধারণ করবেন}*।
5. **পণ্য গ্রহণ করার পর।** পণ্য দেখে নিয়ে গ্রহণ করার পর তা আর রিফান্ড করা হবে না।
6. **মত পরিবর্তন।** পণ্য গ্রহণ করার পর মত পরিবর্তনের কারণে ফেরত বা রিফান্ড করা যাবে না।
7. **যোগাযোগ।** কল বা হোয়াটসঅ্যাপ: 01712-039707।

---

## 4. WHAT THIS CHANGES IN THE PRODUCT

- **Order statuses/events:** add a delivery-time outcome so the admin can record it: `REFUSED_AT_DELIVERY_DEFECTIVE` (COD, no payment taken, stock handling chosen by admin: restock or mark as defective stock), `RETURNED_DEFECTIVE_REFUND_PENDING` and `REFUNDED` (prepaid). Log every transition in the order timeline and audit log. Keep the existing legal-transition rules.
- **Admin order page:** show the customer's policy acceptance, payment verification controls (bKash/Nagad), and a "Refund" action that records the refund method, amount, date and the staff member.
- **Tracking/success pages:** show the short inspection notice from section 3.
- **Account/Returns:** do not build a self-service "return within N days" form. Instead show the policy and a "Report a defective item" button that opens WhatsApp/call to 01712-039707 and logs a `RETURN_REPORTED` note on the order for the admin.
- **Product pages:** remove all certification and "lab tested" panels from the Stitch design. Keep the **age range**, **materials**, **what's in the box** and **choking-hazard warning** panel, but fill each field only from real admin-entered data; hide any empty field.
- **Footer and help page (`/help`):** contact options are **Call** and **WhatsApp** on 01712-039707 only. Do not show live chat, agent names, email, hours or address until provided.
- **Header announcement bar:** if the owner has not set a promo, show nothing (or the inspection notice). Never show "Free delivery over $45" or "Use code WONDER10". The free-delivery threshold and any coupon appear only when set in Settings/Coupons.

---

## 5. SEED VALUES FOR `seed-essential.ts` (safe for production)

```
contact.hotline            = "01712039707"
contact.whatsapp           = "01712039707"
contact.email              = ""        (hidden until set)
contact.address            = ""        (hidden until set)
payments.cod.enabled       = true
payments.bkash.enabled     = true
payments.bkash.number      = "01712039707"
payments.bkash.instructionType = "send_money"   (owner to confirm)
payments.nagad.enabled     = true
payments.nagad.number      = "01712039707"
payments.nagad.instructionType = "send_money"   (owner to confirm)
policy.inspectAtDelivery   = true
policy.refundDefectiveAtDelivery = true
policy.refundAfterAcceptance     = false
```
Also create the Returns/Refund policy page (EN + BN) from section 3, and shell pages for Terms, Privacy and Shipping (owner to complete). All values remain editable in `/admin/settings`.

---

## 6. STILL NEEDED FROM THE OWNER (keep hidden until provided)

1. Whether `01712039707` is a **personal or merchant** bKash/Nagad account, and whether customers should use **Send Money** or **Payment**.
2. Whether defects found **after** the delivery person leaves (for example a toy that does not work when opened later) get any grace period. The current rule says no refund after acceptance. If the owner wants a short window (for example 24 hours with an unboxing video), add it as a Settings option, **default off**.
3. Refund timing for prepaid orders (number of working days).
4. Delivery coverage and fees (inside Dhaka, outside Dhaka, free-delivery threshold). Do not claim "all 64 districts" until confirmed.
5. Support email, business address, trade licence/TIN/BIN (optional but recommended), social media links, and the original logo file (vector or high-resolution transparent PNG).
6. Final approval of the Bangla and English policy text above.
