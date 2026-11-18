# Security Policy — Khelna Bazar

This document describes the security model, authentication architecture, and hardening measures implemented across **Khelna Bazar**.

---

## 1. Authentication & Identity Architecture

* **Framework**: Auth.js / NextAuth v5 beta running on Next.js 16 App Router.
* **Session Strategy**: JSON Web Token (JWT) with encrypted HTTP-only cookies (`authjs.session-token`).
* **Password Hashing**: Passwords are cryptographically salted and hashed server-side using `bcryptjs` with **12 salt rounds**. Plaintext passwords are never logged, stored, or transmitted.
* **Dual Login Identifiers**: Customers can sign in using either their Bangladeshi 11-digit mobile phone number (`01[3-9]XXXXXXXX`) or email address. Identifiers are normalized and sanitized before database lookup.
* **Zero Default Credentials**: The production codebase contains zero seeded demo passwords or mock credentials. Store administrators are provisioned explicitly via the authenticated CLI utility (`npm run admin:create`).

---

## 2. Multi-Layer Authorization & Panel Route Protection

Khelna Bazar implements **defense-in-depth authorization across three separate panels**:

1. **Panel Layout Isolation**:
   * Public Storefront (`src/app/(store)/layout.tsx`) isolates shopping chrome from administrative and customer dashboards.
   * Customer Dashboard (`src/app/dashboard/layout.tsx`) mounts personal profile navigation and is flagged with `noindex, nofollow`.
   * Management Console (`src/app/admin/layout.tsx`) isolates internal operations and requires staff authentication.

2. **Edge Middleware Guard (`src/middleware.ts`)**:
   * Intercepts all requests matching `/admin/*` and `/dashboard/*`.
   * Unauthenticated requests are immediately redirected to `/login` with an open-redirect-protected callback URL.
   * Normal customers attempting to access `/admin/*` are redirected to `/dashboard`.
   * Staff/Admin accounts are restricted from Super Admin routes (`/admin/staff`, `/admin/audit-logs`).
   * Legacy `/account/*` URLs are redirected seamlessly to `/dashboard/*`.

3. **Server Authorization Guards (`src/lib/authorization-guards.ts`)**:
   * Centralized helpers (`requireCustomer`, `requireStaff`, `requireAdmin`, `requireSuperAdmin`) verify caller role server-side.
   * Client-side role claims are completely ignored; permissions are evaluated strictly on the server against the database.

4. **Database-Level Ownership Scoping (Zero IDOR)**:
   * Every customer order, address, and profile query enforces `where: { userId: session.user.id }`.
   * Cross-account data tampering and IDOR vulnerabilities are prevented at the database driver level.

---

## 3. Input Validation & Injection Prevention

* **Zod Schema Validation**: Every server action, API route handler, and checkout payload is parsed and validated against strict Zod schemas (`OrderInputSchema`, `ProductInputSchema`, `CouponInputSchema`, `RegisterSchema`).
* **SQL Injection Prevention**: All database interactions use Prisma ORM with parameterized queries. Raw string interpolation in SQL is strictly prohibited.
* **Cross-Site Scripting (XSS)**: Next.js automatic React escaping protects all dynamic content. Rich-text CMS pages are vetted and served from trusted database records.

---

## 4. HTTP Security Headers

Production HTTP security headers are enforced via `next.config.ts`:

| Header | Configured Value | Purpose |
| :--- | :--- | :--- |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | Enforces HTTPS connections |
| `X-Content-Type-Options` | `nosniff` | Prevents MIME-type sniffing |
| `X-Frame-Options` | `SAMEORIGIN` | Defends against clickjacking |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Limits cross-origin referrer leakage |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Restricts sensitive device hardware APIs |
| `Content-Security-Policy` | Structured directives | Restricts unauthorized scripts and frame sources |

*Note: The deprecated `X-XSS-Protection` header has been intentionally removed per modern OWASP recommendations.*

---

## 5. Launch Guard Runtime Verification

The application integrates `validateProductionConfig()` in `src/server/launch-guard.ts`:
* Executes automatically during Next.js initialization.
* Verifies active PostgreSQL database connectivity.
* Asserts `AUTH_SECRET` is set to a cryptographically sound key of at least 32 bytes.
* Blocks server startup in production if insecure mock credentials or missing environment variables are detected.

---

## 6. Reporting a Security Vulnerability

If you discover a security vulnerability in Khelna Bazar, please report it privately:

* **Email**: `security@khelnabazar.com.bd` (or the store owner's technical contact)
* **Response Time**: We acknowledge reports within 24 hours and will provide a status update or patch within 72 hours.
* **Responsible Disclosure**: Please do not publicly disclose vulnerabilities before a fix has been released.
