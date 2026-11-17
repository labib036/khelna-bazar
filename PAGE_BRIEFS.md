# Page Briefs Specification (PAGE_BRIEFS.md)

This document formalizes the product requirements, cognitive load profile, trust requirements, and observable acceptance criteria for all 25 routes across Khelna Bazar.

---

## 1. Storefront Discovery Routes

### 1.1 Homepage (`/`)
* **Primary Audience**: First-time Bangladeshi parents, gift shoppers, returning family customers.
* **Primary Task**: Understand the brand, discover age-appropriate toys, and enter a high-intent category or search route.
* **Secondary Tasks**: Browse flash deals, explore Shop by Age brackets, verify Cash on Delivery and safety guarantees.
* **Key Information**: Nationwide COD promise, ASTM F963/CE certified non-toxic safety disclosures, ৳1,500 free shipping threshold, 24–48h Dhaka delivery.
* **Primary Action**: "Shop Building Sets" or primary category card click.
* **Secondary Action**: "Gift Finder Quiz" (`/gift-finder`) or header search (`⌘K`).
* **Trust Requirements**: Real safety disclosures; zero fabricated customer review counts; clear COD and replacement policies.
* **Failure Modes**: Missing image assets; banner gradient rendering failure; low contrast text.
* **Mobile Constraints**: Viewport height optimization on 360–390px screens; sticky bottom navigation dock must not obscure content.
* **Acceptance Criteria**: LCP loads $\le 2.0$s; hero buttons achieve $\ge 5.2:1$ contrast; slider pause controls accessible via keyboard.

---

### 1.2 Category Listing (`/c/[...slug]`)
* **Primary Audience**: Parents shopping for a specific toy type (e.g., STEM, RC Vehicles, Dolls).
* **Primary Task**: Filter and scan toys by age, price, brand, and stock status.
* **Secondary Tasks**: Switch sorting (Price Low-High, Newest, Top Rated); quick-add to bag; toggle wishlist.
* **Key Information**: Breadcrumbs, product count, price in BDT (৳), savings percentage, stock badge.
* **Primary Action**: Click product card to open Product Detail Page.
* **Secondary Action**: Click "Add to Bag" or open Mobile Filter Drawer.
* **Trust Requirements**: Price in BDT matches product page; real stock counts; no hidden archived products.
* **Failure Modes**: Empty result set after filtering; broken pagination or load-more loops.
* **Mobile Constraints**: Filter drawer must slide out cleanly, retain selected filter state, and lock body scroll.
* **Acceptance Criteria**: Filter URL query parameters remain canonical and bookmarkable; clear-all resets filters cleanly.

---

### 1.3 Product Detail Page (`/p/[slug]`)
* **Primary Audience**: Decided shoppers evaluating a toy for a child.
* **Primary Task**: Review age suitability, choke hazard warnings, specifications, and add the correct variant to cart.
* **Secondary Tasks**: Inspect gallery images with zoom, read verified reviews, share product via WhatsApp.
* **Key Information**: Recommended age (months/years), choke hazard warning, material & battery specs, Dhaka delivery estimate.
* **Primary Action**: "Add to Bag" (or "Buy Now").
* **Secondary Action**: Select variant, toggle wishlist, or copy canonical share link.
* **Trust Requirements**: Honest ASTM F963 / CE compliance; truthful stock levels; transparent delivery fee estimates.
* **Failure Modes**: Selecting variant leaves stale SKU or price in state; buy button hidden behind sticky elements.
* **Mobile Constraints**: Sticky bottom buy bar appears past primary CTA and respects safe-area insets.
* **Acceptance Criteria**: Variant changes update price, SKU, image, and stock synchronously.

---

### 1.4 Search Autocomplete & Results (`/search`, `/api/search`)
* **Primary Audience**: Shoppers with specific toy intent (e.g., "Solar Rover", "Lego", "RC Car").
* **Primary Task**: Locate exact product or relevant category matches in English or Bengali.
* **Secondary Tasks**: Filter search results by price and age.
* **Key Information**: Matching query echo, total matching items, product thumbnail, price.
* **Primary Action**: Select autocomplete suggestion or submit search.
* **Secondary Action**: Clear query or browse recommended categories on zero results.
* **Trust Requirements**: Results must not include draft or archived items; no SQL injection vulnerabilities.
* **Failure Modes**: Stale fetch race conditions; debouncing latency $> 300$ms.
* **Mobile Constraints**: Fullscreen mobile search overlay with autofocus and one-tap clear button.
* **Acceptance Criteria**: Zero results state provides helpful query corrections and popular category links.

---

### 1.5 Interactive Gift Finder Quiz (`/gift-finder`)
* **Primary Audience**: Relatives and friends shopping for birthdays or festivals who do not know what toy to buy.
* **Primary Task**: Answer 3 step-by-step questions (Age bracket, Interest/Theme, Budget in BDT) to receive curated recommendations.
* **Secondary Tasks**: Restart quiz, adjust budget filter, add recommended toy directly to cart.
* **Key Information**: Step progression, age development milestones, exact price.
* **Primary Action**: Select answer pill and advance to next step.
* **Secondary Action**: "View Recommended Toys" upon quiz completion.
* **Trust Requirements**: Recommendations strictly match selected budget and developmental age.
* **Failure Modes**: Blank recommendation list if no exact match exists (graceful broad match required).
* **Mobile Constraints**: Large touch targets for answer cards ($\ge 48$px height).
* **Acceptance Criteria**: Quiz state persists across steps without page reload; results link directly to active PDPs.

---

### 1.6 Shopping Cart (`/cart`) & Mini-Cart Drawer
* **Primary Audience**: Shoppers reviewing items before committing to order.
* **Primary Task**: Verify quantities, check subtotal, and verify progress toward ৳1,500 free shipping.
* **Secondary Tasks**: Apply discount coupon code, select gift-wrapping, remove unwanted line items.
* **Key Information**: Line item unit prices, quantities, free shipping progress meter, coupon discount, delivery estimate.
* **Primary Action**: "Proceed to Checkout".
* **Secondary Action**: Update quantities via stepper or click "Continue Shopping".
* **Trust Requirements**: Exact integer BDT math; subtotal equals sum of line totals; coupon discount verified server-side.
* **Failure Modes**: Quantity decrement at 1 fails to prompt removal; coupon code error message obscures controls.
* **Mobile Constraints**: Mini-cart drawer handles safe viewport scrolling; checkout button pinned to bottom of drawer.
* **Acceptance Criteria**: Cart drawer and dedicated `/cart` page calculate identical totals to the Taka.

---

### 1.7 One-Page Checkout (`/checkout`)
* **Primary Audience**: Shoppers placing a Cash on Delivery or manual MFS order.
* **Primary Task**: Provide recipient full name, Bangladeshi phone number, district, area, and delivery address.
* **Secondary Tasks**: Select delivery speed (Standard vs Express Dhaka); choose Cash on Delivery or bKash/Nagad.
* **Key Information**: Order summary breakdown, shipping fee by zone, total due on doorstep delivery.
* **Primary Action**: "Place Order (Cash on Delivery)".
* **Secondary Action**: Return to cart to modify items.
* **Trust Requirements**: Server re-validates stock and pricing; client-side price tampering blocked; idempotency key prevents duplicate orders.
* **Failure Modes**: Double click creates multiple orders; invalid phone rejected with clear BD format guidance.
* **Mobile Constraints**: Single column distraction-free flow with collapsible order summary.
* **Acceptance Criteria**: Submit button enters loading state; successful submission redirects to `/order/[orderNumber]?success=1&token=...`.

---

### 1.8 Order Confirmation & Invoice (`/order/[id]`)
* **Primary Audience**: Customer who just placed an order.
* **Primary Task**: Confirm order number (`KB-YYMM-XXXXXX`), review order total, and understand doorstep delivery next steps.
* **Secondary Tasks**: Copy order number, view 5-step delivery pipeline, print PDF/A4 receipt.
* **Key Information**: Assigned courier, estimated arrival window, COD amount due, payment instructions.
* **Primary Action**: "Track Order" or "Continue Shopping".
* **Secondary Action**: "Print Invoice".
* **Trust Requirements**: IDOR protected: guest access requires signed `orderAccessToken` or verified phone number; Customer B cannot view Customer A's receipt.
* **Failure Modes**: Refresh duplicates order; confetti blocks text on mobile.
* **Mobile Constraints**: A4 printable stylesheet formats cleanly without clipped margins.
* **Acceptance Criteria**: Direct unauthenticated URL access without token returns safe 404/Null state.

---

### 1.9 Order Tracking (`/track-order`)
* **Primary Audience**: Customers checking fulfillment progress of an existing order.
* **Primary Task**: Enter Order Number and Phone Number to inspect current courier status.
* **Secondary Tasks**: Contact support if delivery is delayed.
* **Key Information**: 5-step milestone pipeline: Order Placed &rarr; Confirmed &rarr; Packing &rarr; Handed to Courier &rarr; Delivered.
* **Primary Action**: "Track Status".
* **Secondary Action**: Click hotline telephone link for dispatch support.
* **Trust Requirements**: Phone number must match order record to prevent unauthorized tracking.
* **Failure Modes**: Generic error when order not found; leaking customer address to unauthorized callers.
* **Mobile Constraints**: Vertical milestone timeline with clear icon indicators and readable timestamps.
* **Acceptance Criteria**: Verified lookup displays tracking number (Steadfast/Pathao) and current stage accurately.

---

## 2. Customer Account Routes

### 2.1 Account Overview (`/account`)
* **Primary Audience**: Authenticated customers.
* **Primary Task**: View active order status, saved addresses count, and PlayPoints balance.
* **Secondary Tasks**: Navigate to Order History, Address Book, or Rewards.
* **Primary Action**: Click active order to view delivery timeline.
* **Acceptance Criteria**: Scoped strictly to `session.user.id`; unauthorized visitors redirected to `/login?redirect=/account`.

### 2.2 Order History (`/account/orders`)
* **Primary Audience**: Returning customers checking past purchases.
* **Primary Task**: Browse past orders, view order numbers, totals, and individual line items.
* **Acceptance Criteria**: Displays real database records; empty state provides "Start Shopping" button.

### 2.3 Saved Address Book (`/account/addresses`)
* **Primary Audience**: Customers managing home and office delivery destinations across Bangladesh.
* **Primary Task**: Add, edit, delete, and set default shipping addresses.
* **Key Information**: Recipient name, mobile, division, city/thana, street address, default badge.
* **Acceptance Criteria**: Persists to PostgreSQL `Address` model; enforces maximum 10 addresses; deletion of default elects new default safely.

### 2.4 PlayPoints Rewards (`/account/rewards`)
* **Primary Audience**: Loyal customers tracking rewards points.
* **Primary Task**: View total points balance (100 welcome bonus + points earned from completed orders) and ledger history.
* **Acceptance Criteria**: Ledger history is immutable; balances cannot become negative.

---

## 3. Administrative Operations Console

### 3.1 Admin Dashboard (`/admin`)
* **Primary Audience**: Store owner, operations manager, warehouse supervisor.
* **Primary Task**: Inspect daily order volume, revenue, COD cash in transit, and dispatch work queues.
* **Secondary Tasks**: Switch date filter, inspect fulfillment kanban board, open low stock alerts.
* **Acceptance Criteria**: Accessible only by `ADMIN` or `STAFF` roles; non-admin redirected to `/login`.

### 3.2 Admin Orders & Fulfillment (`/admin/orders`)
* **Primary Audience**: Warehouse dispatch team.
* **Primary Task**: Advance order status through legal state machine (Confirm &rarr; Pack &rarr; Ship &rarr; Deliver).
* **Secondary Tasks**: Reconcile COD collection, assign tracking number, record internal notes.
* **Acceptance Criteria**: Status changes create immutable `OrderEvent` records; COD reconciliation requires `ADMIN` role.

### 3.3 Catalog Products Manager (`/admin/products`)
* **Primary Audience**: Catalog manager, store administrator.
* **Primary Task**: Create new toy products, upload image URLs, configure safety fields, edit pricing and stock.
* **Acceptance Criteria**: Enforces unique SKUs and URL slugs; deletion preserves historical order line snapshots.

### 3.4 Warehouse Inventory (`/admin/inventory`)
* **Primary Audience**: Inventory controller.
* **Primary Task**: Restock SKU quantities with audit reasons (`RESTOCK`, `AUDIT`, `RETURN_RESTOCK`).
* **Acceptance Criteria**: Enforces atomic updates; records actor name and timestamp in `StockMovement`.

### 3.5 Promotional Coupons (`/admin/coupons`)
* **Primary Audience**: Marketing administrator.
* **Primary Task**: Create percentage, fixed, or free-shipping coupons with expiry dates and minimum spend limits.
* **Acceptance Criteria**: Code uniqueness validated; toggle active/inactive executes immediately.

### 3.6 Store Settings (`/admin/settings`)
* **Primary Audience**: Store owner (`ADMIN` role only).
* **Primary Task**: Adjust delivery fees (Inside Dhaka, Outside Dhaka, Express), free shipping threshold, and store contact info.
* **Acceptance Criteria**: Client-side tampering blocked; changes propagate immediately to checkout calculations.
