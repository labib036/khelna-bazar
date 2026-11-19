# Khelna Bazar Role-Permission Matrix

## 1. Overview
Khelna Bazar operates four strict roles across its architecture:
- `CUSTOMER`: Public store buyer, personal dashboard (`/dashboard`)
- `STAFF`: Fulfillment & operations, order processing, inventory adjustment (`/admin/orders`, `/admin/dashboard`)
- `ADMIN`: Catalog, categories, coupons, banners, settings, reports, operational management (`/admin/*` except staff & audit logs)
- `SUPER_ADMIN`: Complete platform authority, staff provisioning, role updates, platform audit logs

## 2. Permission Matrix

| Permission | Description | CUSTOMER | STAFF | ADMIN | SUPER_ADMIN |
|---|---|:---:|:---:|:---:|:---:|
| `orders.view` | View orders, filter, inspect details | ❌ | ✅ | ✅ | ✅ |
| `orders.updateStatus` | Advance order state (PROCESSING, SHIPPED, DELIVERED) | ❌ | ✅ | ✅ | ✅ |
| `payments.verify` | Verify bKash/Nagad transactions | ❌ | ✅ | ✅ | ✅ |
| `refunds.record` | Record approved delivery-day returns & refunds | ❌ | ✅ | ✅ | ✅ |
| `products.view` | View product catalog in admin | ❌ | ✅ | ✅ | ✅ |
| `products.edit` | Create, edit, publish products, upload images | ❌ | ❌ | ✅ | ✅ |
| `products.delete` | Soft delete / archive catalog products | ❌ | ❌ | ✅ | ✅ |
| `inventory.adjust` | Adjust stock levels on variants | ❌ | ✅ | ✅ | ✅ |
| `categories.manage` | Create, edit, reorder categories and brands | ❌ | ❌ | ✅ | ✅ |
| `coupons.manage` | Create, update, archive promo coupons | ❌ | ❌ | ✅ | ✅ |
| `banners.manage` | Upload promo banners and manage homepage placement | ❌ | ❌ | ✅ | ✅ |
| `customers.view` | View customer directory and purchase histories | ❌ | ❌ | ✅ | ✅ |
| `reviews.moderate` | Approve, moderate, or reject toy reviews & Q&A | ❌ | ❌ | ✅ | ✅ |
| `settings.manage` | Update store configuration, delivery rates, contact | ❌ | ❌ | ✅ | ✅ |
| `reports.view` | View sales analytics and performance reports | ❌ | ❌ | ✅ | ✅ |
| `staff.manage` | Provision, demote, update staff & admin roles | ❌ | ❌ | ❌ | ✅ |
| `audit.view` | Inspect platform security and operation audit logs | ❌ | ❌ | ❌ | ✅ |

## 3. Enforcement Layers
1. **Edge Proxy (`src/proxy.ts`)**: Fast, coarse URL routing and anti-admin ordering guards.
2. **Page & Layout Level (`requirePermission`)**: Server-side redirect before page render.
3. **Server Actions & API Routes (`assertPermission`)**: Non-bypassable action authorization returning typed errors.
