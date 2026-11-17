# Data Consistency & Lifecycle Audit (DATA_CONSISTENCY_AUDIT.md)

This document traces a canonical test order through every system touchpoint in **Khelna Bazar** to prove absolute data consistency, price integrity, and historical snapshot preservation.

---

## 1. Canonical Order Journey Trace

* **Test Scenario**: Customer orders 1 unit of `Solar Powered Mars Rover Kit` (Variant SKU: `KB-SLR-MARS-STD`, Unit Price: ৳2,500) to an address in Mirpur, Dhaka via Cash on Delivery.

| Lifecycle Step | Touchpoint / Route | Displayed Values | Underlying Server / DB State | Verification Result |
| :--- | :--- | :--- | :--- | :---: |
| **1. PDP Catalog** | `/p/solar-rover-kit` | Price: **৳2,500**, Stock: `12` | `db.productVariant.price = 2500` | **MATCH (Exact)** |
| **2. Cart Drawer** | Mini-Cart Drawer | Qty: `1`, Subtotal: **৳2,500**, Shipping: **৳0 (Free unlocked)** | Subtotal $\ge 1500$ threshold &rarr; Free delivery | **MATCH (Exact)** |
| **3. Checkout** | `/checkout` | Items: ৳2,500, Delivery: ৳0, Total Due: **৳2,500** | Server recalculates against DB variant price | **MATCH (Exact)** |
| **4. Database Write** | Server Action `placeOrder` | Order created: `KB-2611-100001` | `subtotal: 2500, shippingFee: 0, total: 2500` | **MATCH (Exact)** |
| **5. Inventory Update** | `adjustVariantStock` | Stock decremented from `12` to `11` | `StockMovement` recorded with reason `ORDER_FULFILLMENT`| **MATCH (Exact)** |
| **6. Confirmation** | `/order/KB-2611-100001` | Order: `KB-2611-100001`, Total: **৳2,500** | Gated with HMAC `orderAccessToken` | **MATCH (Exact)** |
| **7. Account Orders** | `/account/orders` | Order `KB-2611-100001`, Total: **৳2,500**, Status: `Pending` | Scoped to `session.user.id` | **MATCH (Exact)** |
| **8. Order Tracking** | `/track-order` | Order `KB-2611-100001`, Status: `Order Placed` | Requires phone verification `01712345678` | **MATCH (Exact)** |
| **9. Admin Console** | `/admin/orders` | Customer: `Abrar Fahim`, Due: **৳2,500**, COD: `Uncollected` | Appears in Kanban `New Orders` column | **MATCH (Exact)** |
| **10. Invoice Print** | Printable A4 Invoice | Subtotal: ৳2,500, Shipping: ৳0, Total Due: **৳2,500** | Uses immutable item snapshot from `OrderItem` | **MATCH (Exact)** |
| **11. Reconciliation** | Admin `updateCodStatus` | Cash collected: **৳2,500**, Status: `COLLECTED` | Immutable `OrderEvent` written to database | **MATCH (Exact)** |

---

## 2. Invariant Rules Verified

1. **Integer Minor Currency Representation**:
   - All prices and fees are stored as clean integers in Bangladeshi Taka (৳).
   - Zero floating-point rounding errors or `$0.9999999` artifacts.
2. **Catalog Decoupling (Historical Snapshot Preservation)**:
   - When an administrator modifies a toy's base price in `/admin/products`, existing past orders retain their immutable purchase snapshot (`nameSnapshot`, `skuSnapshot`, `unitPrice` at purchase time in `OrderItem`).
   - Past order totals **never** change when catalog prices are altered.
3. **Cash on Delivery (COD) Independence**:
   - Order fulfillment status (`CONFIRMED`, `SHIPPED`, `DELIVERED`) is decoupled from financial cash collection status (`UNCOLLECTED`, `COLLECTED`, `DISCREPANCY`).
   - A courier delivery confirmation does not mark cash collected until financial reconciliation is verified by an administrator.
