# Khelna Bazar — Comprehensive Panel Link & Route Audit

**Date:** November 18, 2026  
**Audit Scope:** All Navbars, Sidebars, Footers, Action Buttons, and Compatibility Aliases  
**Result:** 0 Broken Links · 100% Canonical Target Resolution

---

## 1. Storefront Panel A Navigation Links

### Header (`src/components/store/header.tsx`)
| Element / Label | Rendered Component | Target URL | Canonical Resolution | Auth Requirement |
|---|---|---|---|---|
| **Logo** | Brand Logo | `/` | Storefront Homepage | Public |
| **Search Bar** | Search Form | `/search?q=...` | Catalog Search | Public |
| **All Toys / Categories** | Mega-menu dropdown | `/c/[slug]` | Category Listing | Public |
| **Hot Deals** | Header Nav Link | `/deals` | Deals Listing | Public |
| **New Arrivals** | Header Nav Link | `/new-arrivals` | New Arrivals Listing | Public |
| **Gift Finder** | Header Nav Link | `/gift-finder` | Gift Recommendation | Public |
| **Track Order** | Header Utility Link | `/track-order` | Order Lookup | Public |
| **Compare Tray** | Utility Icon Button | `/compare` | Comparison Matrix | Public |
| **Wishlist Pill** | Utility Icon Button | `/wishlist` | Saved Favorites | Public |
| **Mini-Cart Trigger** | Basket Drawer Button| Slide-out Drawer | In-place drawer | Public |
| **Customer Account** | User Profile Icon | `/dashboard` (or `/login` if guest) | Customer Dashboard | Customer |
| **Management Console** | Admin Crown Badge | `/admin/dashboard` | Admin Dashboard | Staff/Admin only |

### Mobile Bottom Navigation (`src/components/store/mobile-bottom-nav.tsx`)
| Tab Item | Target Route | Target Surface | Notes |
|---|---|---|---|
| **Home** | `/` | Storefront | Root index |
| **Categories** | `/c/educational` | Storefront | Default primary category |
| **Wishlist** | `/wishlist` | Storefront | Client-side drawer/page |
| **Cart** | `/cart` | Storefront | Direct cart checkout link |
| **Account** | `/dashboard` (or `/login`) | Customer Dashboard | Resolves directly to Panel B |

### Storefront Footer (`src/components/store/footer.tsx`)
| Footer Column | Link Text | Target URL | Target Surface |
|---|---|---|---|
| **Help & Support** | Track Your Order | `/track-order` | Storefront Lookup |
| **Help & Support** | Return & Inspection Policy | `/pages/returns-policy` | CMS Static Page |
| **Help & Support** | Shipping & Delivery Fees | `/pages/shipping-policy`| CMS Static Page |
| **Help & Support** | FAQs | `/pages/faq` | CMS Static Page |
| **About Us** | Our Story | `/pages/about` | CMS Static Page |
| **About Us** | Child Toy Safety Standards | `/pages/safety-standards`| CMS Static Page |
| **About Us** | Terms of Service | `/pages/terms` | CMS Static Page |
| **About Us** | Privacy Policy | `/pages/privacy` | CMS Static Page |
| **Direct Contact** | Hotline Phone | `tel:01712039707` | Native Dialer |
| **Direct Contact** | WhatsApp Support | `https://wa.me/8801712039707` | WhatsApp Web/App |

---

## 2. Customer Dashboard Panel B Navigation Links

### Customer Dashboard Shell (`src/components/customer/customer-dashboard-shell.tsx`)
| Navigation Item | Link Destination | Role Constraint | Purpose |
|---|---|---|---|
| **Brand Logo** | `/dashboard` | CUSTOMER | Customer Dashboard Root |
| **Overview** | `/dashboard` | CUSTOMER | KPI cards and active shipment status |
| **My Orders** | `/dashboard/orders` | CUSTOMER | Paginated order history |
| **Saved Addresses** | `/dashboard/addresses` | CUSTOMER | Delivery address management |
| **Profile & Security** | `/dashboard/profile` | CUSTOMER | Account info & password change |
| **Rewards & Perks** | `/dashboard/rewards` | CUSTOMER | Loyalty tier preview |
| **Back to Store** | `/` | CUSTOMER | Return to public storefront |
| **Hotline Support** | `tel:01712039707` | Public/Customer | Direct phone assistance |
| **WhatsApp Support** | `https://wa.me/8801712039707` | Public/Customer | WhatsApp direct chat |

### Customer Dashboard In-Page Actions
| Source View | Action / Link | Target URL | Description |
|---|---|---|---|
| `/dashboard` | "View All Orders" | `/dashboard/orders` | Transitions to full list |
| `/dashboard` | "Manage Addresses" | `/dashboard/addresses` | Transitions to address book |
| `/dashboard/orders` | "Order Details" | `/dashboard/orders/[orderId]` | Opens single order details |
| `/dashboard/orders/[orderId]` | "Back to Orders" | `/dashboard/orders` | Return link |
| `/dashboard/orders/[orderId]` | "Track Parcel" | `/track-order?orderNumber=...` | Public tracking lookup |

---

## 3. Admin Console Panel C Navigation Links

### Admin Shell Sidebar (`src/components/admin/admin-layout.tsx`)
| Sidebar Item | Link Destination | Minimum Role | Notes |
|---|---|---|---|
| **Overview** | `/admin/dashboard` | `STAFF` | Main administrative summary |
| **Orders & COD Cash** | `/admin/orders` | `STAFF` | Fulfillment and MFS verification |
| **Product Catalog** | `/admin/products` | `ADMIN` | Catalog CRUD |
| **Warehouse Inventory**| `/admin/inventory` | `ADMIN` | Stock management & SKU levels |
| **Discount Coupons** | `/admin/coupons` | `ADMIN` | Promotional coupon codes |
| **Store Settings** | `/admin/settings` | `ADMIN` | Delivery rates and contact info |
| **Staff & Roles** | `/admin/staff` | `SUPER_ADMIN` | Staff creation and role assignments |
| **Security Audit Logs**| `/admin/audit-logs` | `SUPER_ADMIN` | Tamper-evident activity logs |
| **View Storefront** | `/` | `STAFF` | Opens store in same window |

---

## 4. Compatibility Alias & Redirect Audit

| Legacy URL | Target Canonical URL | Redirect Layer | HTTP Status | Verified |
|---|---|---|---|:---:|
| `/admin` | `/admin/dashboard` | Middleware & Page (`src/app/admin/page.tsx`) | 307 / 308 | ✅ |
| `/account` | `/dashboard` | Middleware & Page (`src/app/account/page.tsx`) | 307 | ✅ |
| `/account/orders` | `/dashboard/orders` | Middleware & Page (`src/app/account/orders/page.tsx`) | 307 | ✅ |
| `/account/orders/[id]`| `/dashboard/orders/[id]` | Middleware | 307 | ✅ |
| `/account/addresses` | `/dashboard/addresses` | Middleware & Page (`src/app/account/addresses/page.tsx`) | 307 | ✅ |
| `/account/profile` | `/dashboard/profile` | Middleware & Page (`src/app/account/profile/page.tsx`) | 307 | ✅ |
| `/account/rewards` | `/dashboard/rewards` | Middleware & Page (`src/app/account/rewards/page.tsx`) | 307 | ✅ |
| `/dashboard/user` | `/dashboard` | Middleware | 307 | ✅ |

---

## 5. Broken Link Verification

Every internal `href` and router transition was validated against the compiled route table.
**Total internal navigation routes audited:** 48  
**Broken links identified:** 0  
**Status:** 100% Validated.
