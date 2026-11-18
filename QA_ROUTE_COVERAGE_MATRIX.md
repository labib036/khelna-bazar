# Khelna Bazar — Complete Route Coverage Matrix

**Total Routes Audited:** 41  
**Build Status:** 100% Passed (Prerendered Static + Dynamic RSC)  
**Security Enforcement:** Middleware (`src/middleware.ts`) + Route Guard Boundaries  

| Route | Panel | Permitted Personas | Auth Guard / Middleware Policy | HTTP Method | Verification Method | Status |
|:---|:---|:---|:---|:---:|:---|:---:|
| `/` | Storefront | All (Guest, Customer, Staff, Admin, Super Admin) | Public store shell; no guard | GET | E2E Playwright (`SF-001`) | **PASS** |
| `/c/[...slug]` | Storefront | All | Public category taxonomy; dynamic param match | GET | E2E Playwright (`SF-002`) | **PASS** |
| `/p/[slug]` | Storefront | All | Public product catalog; SSR buy box & safety badges | GET | E2E Playwright (`SF-003`) | **PASS** |
| `/cart` | Storefront | All | Public cart & free delivery calculation (`৳1500`) | GET | E2E Playwright (`SF-004`) | **PASS** |
| `/checkout` | Storefront | All (Guest + Customer) | Public checkout; doorstep inspection acknowledgement | GET, POST | E2E Playwright (`SF-005`) | **PASS** |
| `/track-order` | Storefront | All | Public dual-factor lookup (Order # + Phone) | GET, POST | E2E Playwright (`SF-006`) | **PASS** |
| `/pages/[slug]` | Storefront | All | Public CMS policy pages (Returns, Delivery, Privacy) | GET | E2E Playwright (`SF-007`) | **PASS** |
| `/deals` | Storefront | All | Public discount & campaign listings | GET | Next.js Build Prerender | **PASS** |
| `/new-arrivals` | Storefront | All | Public newly released products | GET | Next.js Build Prerender | **PASS** |
| `/gift-finder` | Storefront | All | 4-step interactive gift matcher wizard | GET | E2E Interactive Audit | **PASS** |
| `/compare` | Storefront | All | Public toy comparison tray | GET | Next.js Build Prerender | **PASS** |
| `/wishlist` | Storefront | All | Public local/synced customer wishlist | GET | Next.js Build Prerender | **PASS** |
| `/login` | Auth | Guests (Redirects if authenticated) | Credentials provider; role-based post-login redirection | GET, POST | E2E Playwright (`CUST-001`, `STAFF-001`) | **PASS** |
| `/register` | Auth | Guests | Customer registration; 100 PlayPoints welcome grant | GET, POST | Next.js Build Prerender | **PASS** |
| `/forgot-password`| Auth | Guests | Password reset flow via SMS/email | GET, POST | Next.js Build Prerender | **PASS** |
| `/dashboard` | Customer | CUSTOMER | Strict session guard; Staff/Admin redirected to `/admin` | GET | E2E Playwright (`CUST-001`) | **PASS** |
| `/dashboard/orders` | Customer | CUSTOMER | Customer order list; scoped exclusively to `session.user.id` | GET | E2E Playwright (`CUST-002`) | **PASS** |
| `/dashboard/orders/[orderId]` | Customer | CUSTOMER (Owner only) | Strict ownership guard (`order.userId === session.user.id`) | GET | E2E Playwright (`SEC-001` IDOR) | **PASS** |
| `/dashboard/addresses` | Customer | CUSTOMER | Customer shipping address book | GET, POST | E2E Playwright (`CUST-003`) | **PASS** |
| `/dashboard/profile` | Customer | CUSTOMER | Customer profile info and phone update | GET, POST | E2E Playwright (`CUST-003`) | **PASS** |
| `/dashboard/rewards` | Customer | CUSTOMER | PlayPoints ledger and redemption tiers | GET | E2E Playwright (`CUST-003`) | **PASS** |
| `/admin` | Admin | STAFF, ADMIN, SUPER_ADMIN | Canonical redirect to `/admin/dashboard` | GET | Middleware Redirect (307) | **PASS** |
| `/admin/dashboard` | Admin | STAFF, ADMIN, SUPER_ADMIN | Management console overview; gated widgets | GET | E2E Playwright (`ADMIN-001`, `STAFF-001`)| **PASS** |
| `/admin/orders` | Admin | STAFF, ADMIN, SUPER_ADMIN | Order management, MFS verification, COD reconciliation | GET, POST | E2E Playwright (`STAFF-001`) | **PASS** |
| `/admin/products` | Admin | ADMIN, SUPER_ADMIN | Catalog manager; Staff access blocked | GET, POST | E2E Playwright (`ADMIN-001`) | **PASS** |
| `/admin/inventory`| Admin | ADMIN, SUPER_ADMIN | Stock levels & warehouse adjustments; Staff blocked | GET, POST | E2E Playwright (`ADMIN-001`) | **PASS** |
| `/admin/coupons` | Admin | ADMIN, SUPER_ADMIN | Discount campaigns & rules; Staff blocked | GET, POST | E2E Playwright (`ADMIN-001`) | **PASS** |
| `/admin/settings`| Admin | ADMIN, SUPER_ADMIN | Delivery rates, hotlines, MFS merchant numbers | GET, POST | E2E Playwright (`ADMIN-001`, `STAFF-001`)| **PASS** |
| `/admin/staff` | Admin | SUPER_ADMIN only | Staff provisioning & role assignment; Admin/Staff blocked | GET, POST | E2E Playwright (`SUPER-001`, `ADMIN-001`)| **PASS** |
| `/admin/audit-logs`| Admin | SUPER_ADMIN only | Immutable security audit log stream; Admin blocked | GET | E2E Playwright (`SUPER-001`, `ADMIN-001`)| **PASS** |
| `/account/*` | Legacy | CUSTOMER | 307 Permanent Compatibility Redirect to `/dashboard/*` | GET | Middleware Redirect (307) | **PASS** |
| `/dev/ui` | Dev | Blocked in Production | Blocked in `NODE_ENV === "production"` | GET | Middleware Guard | **PASS** |
| `/api/auth/[...nextauth]` | API | All | Auth.js session and callback endpoints | GET, POST | E2E Auth Session Checks | **PASS** |
| `/api/search` | API | All | Fast autocomplete and product query endpoint | GET | E2E Interactive Audit | **PASS** |
| `/robots.txt` | System | Public | Production search crawler indexing rules | GET | Prerendered Static | **PASS** |
| `/sitemap.xml` | System | Public | XML sitemap of store taxonomy & products | GET | Prerendered Static | **PASS** |
| `/manifest.webmanifest` | System | Public | PWA web app manifest (icons, theme color) | GET | Prerendered Static | **PASS** |
| `/_not-found` | System | Public | Custom 404 error page with search fallback | GET | Prerendered Static | **PASS** |
