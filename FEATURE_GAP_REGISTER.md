# Feature Gap Register & Roadmap Prioritization (FEATURE_GAP_REGISTER.md)

This register compares all requirements from the original e-commerce work order against the actual implemented codebase in **Khelna Bazar**, establishing a prioritized roadmap.

---

## 1. Prioritized Feature Gap Matrix

### Priority A: Core Commerce Subsystems (Release Blocking)
| Feature | Work Order Expectation | Current Code Status | Decision / Action |
| :--- | :--- | :--- | :---: |
| **Catalog & Products** | Real toy taxonomy with variants and stock | Implemented & Verified in `prisma/schema.prisma` | **COMPLETE** |
| **Search & Discovery** | Instant search, autocomplete, debouncing | Implemented in `/api/search` & `/search` | **COMPLETE** |
| **Cart & Drawer** | Mini-cart drawer, free delivery meter | Implemented in `mini-cart-drawer.tsx` & `/cart` | **COMPLETE** |
| **One-Page Checkout** | BD phone normalization, district delivery | Implemented in `/checkout` with 64 districts | **COMPLETE** |
| **Payment Model** | Cash on Delivery (COD) nationwide | Implemented with atomic inventory decrement | **COMPLETE** |
| **Order Confirmation**| Real-time receipt, printable invoice | Implemented in `/order/[id]` with IDOR token | **COMPLETE** |
| **Order Tracking** | 5-step milestone tracking | Implemented in `/track-order` | **COMPLETE** |
| **Customer Auth** | Credentials auth with bcrypt cost 12 | Implemented in NextAuth v5 & `auth-actions.ts` | **COMPLETE** |
| **Admin Operations** | Order fulfillment, inventory, settings | Implemented in `/admin` with role guards | **COMPLETE** |

---

### Priority B: Trust & Operational Foundations
| Feature | Work Order Expectation | Current Code Status | Decision / Action |
| :--- | :--- | :--- | :---: |
| **Toy Safety Standards**| ASTM F963, CE, choking hazard alerts | Implemented in schema & displayed on PDPs | **COMPLETE** |
| **Policy Content** | Shipping, returns, privacy, terms | Implemented in `/pages/[slug]` | **COMPLETE** |
| **COD Reconciliation**| Separate cash collection state | Implemented in `updateCodStatus` (Admin only)| **COMPLETE** |
| **Audit Event Logging**| History of all order state changes | Implemented in `OrderEvent` model | **COMPLETE** |
| **Address Persistence**| Saved delivery addresses on account | Migrated to PostgreSQL `Address` model | **COMPLETE** |

---

### Priority C: Retention & Merchandising Enhancements
| Feature | Work Order Expectation | Current Code Status | Decision / Action |
| :--- | :--- | :--- | :---: |
| **Wishlist** | 1-click wishlist toggle with persistence | Implemented in `wishlist-store.ts` & `/wishlist`| **COMPLETE** |
| **Product Compare** | Side-by-side toy specs comparison | Implemented in `compare-store.ts` & `/compare` | **COMPLETE** |
| **Gift Finder** | Step-by-step recommendation quiz | Implemented in `/gift-finder` | **COMPLETE** |
| **Coupons & Promo** | Percentage, fixed, and free-shipping codes| Implemented in `/admin/coupons` & checkout | **COMPLETE** |
| **Loyalty Rewards** | PlayPoints earning on signup and checkout| Implemented in `loyaltyHistory` & `/account/rewards`| **COMPLETE** |
| **Transactional Email**| Automated dispatch confirmation email | Mock delivery sink active; live SMTP blocked | **PARTIAL / BLOCKED** (Awaiting merchant SMTP) |

---

### Priority D: Advanced Capabilities (Deferred to Future Phases)
| Feature | Work Order Expectation | Rationale for Deferral | Status |
| :--- | :--- | :--- | :---: |
| **Automated MFS Gateway**| Direct bKash / SSLCommerz API checkout | Excluded in favor of nationwide Cash on Delivery; merchant API credentials unavailable | **DEFERRED** |
| **Live Courier API Sync**| Real-time Steadfast / Pathao webhook API | Requires live merchant API keys | **DEFERRED** |
| **Product Q&A Forum** | Customer question & answer on PDP | Low conversion priority for launch phase | **DEFERRED** |
| **Multi-List Wishlists** | Creating multiple named wishlists | Single wishlist meets current consumer needs | **DEFERRED** |
| **PWA Service Worker** | Full offline catalog sync | Requires substantial offline caching layer | **DEFERRED** |
