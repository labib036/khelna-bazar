# Store Owner's Operational Guide: KHELNA BAZAR Admin

This guide explains how the owner and staff operate the daily business of **KHELNA BAZAR** from laptop, tablet, or phone without writing code.

---

## 1. How to Access the Admin Console
1. Navigate to your website URL: `https://khelnabazar.com.bd/admin/dashboard` (or `http://localhost:3000/admin/dashboard` locally; visiting `/admin` automatically forwards here).
2. If not logged in, you will be redirected to the sign-in page with a secure return callback.
3. Sign in with your internal staff, admin, or super-admin account:
   * **Super Admin**: Full root access, user provisioning, role assignments, audit logs.
   * **Admin**: Catalog, stock, coupon codes, and store settings.
   * **Staff**: Orders fulfillment, courier tracking, and payment verification.

---

## 2. Operational Roles & Permissions

| Role | Permitted Areas | Key Responsibilities |
|---|---|---|
| **`STAFF`** | `/admin/dashboard`, `/admin/orders` | Customer order confirmation calls, courier dispatch, tracking numbers, MFS verification. |
| **`ADMIN`** | All staff areas + `/admin/products`, `/admin/inventory`, `/admin/coupons`, `/admin/settings` | Product catalog CRUD, warehouse stock restocking, discounts, delivery charges. |
| **`SUPER_ADMIN`** | All admin areas + `/admin/staff`, `/admin/audit-logs` | Staff hiring/provisioning, role elevation/demotion, immutable security audit review. |

---

## 3. Managing Orders, Payments & COD Workflow

Because KHELNA BAZAR is strictly Cash on Delivery, your fulfillment workflow looks like this:

### Step 1: Customer Places Order
* A new order arrives with status: **`PENDING_CONFIRMATION`** and COD status: **`UNCOLLECTED`**.
* The customer has chosen their items and delivery address.

### Step 2: Verification Call
* Open **Orders & COD Cash** from the sidebar.
* Call the customer's phone number to verify:
  * "Hello, is this [Customer Name]? We are calling from Khelna Bazar regarding your order. Are you available to receive the package tomorrow?"
* Click the status dropdown and change status to **`CONFIRMED`**.

### Step 3: Packing & Courier Dispatch
* When your warehouse team packs the toy into the safety box and adds the shipping label, change status to **`PACKED`**.
* Hand the parcel over to your courier partner (e.g. Steadfast Courier, Pathao, or RedX).
* Enter the tracking number (e.g. `ST-8829410`) and update status to **`SHIPPED`**.

### Step 4: Doorstep Delivery & Cash Collection
* The courier delivers the toy to the customer and receives the cash payment.
* Once the courier company pays your courier settlement account, click **Inspect / Collect** on the order row.
* Click **Record Full Cash Collected (৳X)**.
* The order COD status updates to **`COLLECTED`** with a green audit verification badge!

---

## 3. Adding New Toys & Managing Catalog

1. In the admin sidebar, click **Product Catalog**.
2. To add a new toy, click the blue **`+ Add New Toy`** button.
3. Fill in:
   * **Toy Name**: e.g., `Super Magnetic Racing Loop (64 Pcs)`
   * **Price (BDT ৳)**: e.g., `2450`
   * **Initial Stock**: e.g., `30`
   * **Category**: e.g., `Building Blocks & Construction`
   * **Min Age**: e.g., `36` (meaning 3 years)
   * **Choking Hazard Flag**: Check if the toy contains small parts that pose a risk to toddlers under 3 years old.
4. Click **Publish to Store**. The product immediately appears live on the storefront!

---

## 4. Managing Inventory & Quick Restocks

1. In the sidebar, click **Inventory Stock**.
2. You will see every toy SKU and its live stock count.
3. When new inventory arrives at your warehouse:
   * Click **`+5`** or **`+20`** to instantly add stock.
   * If an item was damaged in shipping, click **`-1`** to adjust.

---

## 5. Running Promotions & Coupon Codes

1. In the sidebar, click **Coupons & Deals**.
2. Click **Create Coupon**.
3. Choose:
   * **Code**: e.g. `EIDJOY` or `WEEKEND15`
   * **Type**: Percentage discount (`%`), Fixed Taka (`৳`), or Free Delivery.
   * **Minimum Spend**: e.g., `1500`
4. Click **Save Coupon**.
5. Announce the code on your Facebook/Instagram page or announcement bar! Customers can enter it in their basket for instant discounts.

---

## 6. Adjusting Delivery Charges & Store Info

1. In the sidebar, click **Delivery & Store Settings**.
2. You can adjust:
   * **Inside Dhaka Rate**: Default `৳60`.
   * **Outside Dhaka / Nationwide Rate**: Default `৳120`.
   * **Free Shipping Threshold**: Default `৳2,000` (Any order over ৳2,000 automatically receives free delivery).
   * **Gift Wrapping Fee**: Default `৳50` per item.
3. Click **Save All Settings**.

---

## 7. Staff & Role Management (Super Admin Only)

1. In the sidebar, navigate to **Staff & Roles** (`/admin/staff`).
2. Click **Add Staff Member** to provision a new team member:
   * Enter their full name, work email, phone number, and temporary password.
   * Select their initial role: `STAFF`, `ADMIN`, or `SUPER_ADMIN`.
3. To promote or modify an existing staff member's permissions, use the dropdown in the **Role Management** column.
4. *Safety Guard*: Super Admins cannot demote their own account, preventing accidental lockouts.

---

## 8. Security & System Audit Logs (Super Admin Only)

1. In the sidebar, navigate to **Security Audit Logs** (`/admin/audit-logs`).
2. Search or filter through immutable event logs for:
   * Staff provisioning (`STAFF_PROVISIONED`)
   * Role changes (`STAFF_ROLE_CHANGE`)
   * Product and coupon deletions
3. Click **View Diff** on any entry to see side-by-side JSON snapshots of state before and after the modification.
