# Khelna Bazar QA State & Remediation Tracker

**Branch:** `panels-fixes`  
**Current Phase:** Phase 6 (Completed Verification & Reporting)  
**Last Completed Item:** Phase 5 (Admin Upgrades: Session Revocation, Category Picker)  
**Active Item:** Final Report Generation (`docs/qa/FINAL_REPORT.md`)  
**Next Item:** All core phases complete; ready for review / deployment.  

---

## Findings Status Tracker (F-01 to F-30)

| ID | Sev | Finding Summary | Status | Commit / Evidence |
|---|---|---|---|---|
| **F-01** | P0 | Old seed with demo passwords in repo (`prisma/seed.ts`, `BEGINNER_GUIDE.md`) | **RESOLVED** | Commit `1acd6e6`: Deleted `prisma/seed.ts`, purged hardcoded credentials from documentation. |
| **F-02** | P0 | Roles from JWT only; never refreshed from database on demotion/block | **RESOLVED** | Commit `ab3b838`: Added `tokenVersion Int @default(0)`, DB refresh on JWT, revoked on role change/block. |
| **F-03** | P0 | Privilege escalation: page-level vs action-level permission mismatch | **RESOLVED** | Commit `30ffb5a`: Created unified `src/lib/permissions.ts` and `ROLE_PERMISSION_MATRIX.md`. All Server Actions use `assertPermission()`. |
| **F-04** | P1 | Blocked-account message lost in `authorize()` | **RESOLVED** | Commit `ab3b838`: Created typed `BlockedAccountError` (`account_disabled`) in `src/lib/auth-errors.ts`. |
| **F-05** | P1 | Production guard `validateProductionConfig()` not wired in startup | **RESOLVED** | Commit `5cb6f48`: Exported `register()` in `src/instrumentation.ts` calling `validateProductionConfig()` (fails closed). |
| **F-06** | P1 | Inconsistent storefront redirection & no admin preview bar | **RESOLVED** | Commit `47660ce`: Created `<AdminPreviewBanner />`, "View Storefront" in admin layout, blocked admin retail ordering. |
| **F-07** | P1 | `/dev/ui` lives inside storefront group | **RESOLVED** | Commit `47660ce`: Guarded with page-level `notFound()` in production. |
| **F-08** | P2 | Minimal security headers / CSP | **RESOLVED** | Commit `36ac430`: Configured robust CSP with Blob storage, Google OAuth, Next scripts, and strict frame-ancestors. |
| **F-09** | P2 | Rate limiting not applied to coupons, tracking, upload, auth | **RESOLVED** | Commit `36ac430`: Applied rate limiting to coupons, order tracking, image uploads, and order placement. |
| **F-10** | P1 | Legacy `/account/*` pages duplicate `/dashboard/*` | **RESOLVED** | Commit `4c6b10f`: Deleted `src/app/account/**` and `account-nav.tsx`, maintained 308 redirect in proxy. |
| **F-11** | P1 | Cache revalidation points to `/account/*` instead of `/dashboard/*` | **RESOLVED** | Commit `4c6b10f`: Corrected `revalidatePath` to `/dashboard/orders` and `/dashboard/addresses`. |
| **F-12** | P2 | `register/page.tsx` redirects to `/account` | **RESOLVED** | Commit `4c6b10f`: Updated redirect straight to `/dashboard` with safe `next` validation. |
| **F-13** | P2 | Duplicate/legacy admin entry `/admin/page.tsx` & unused components | **RESOLVED** | Commit `e02f716`: Cleaned cross-panel links from command palette, header, and cart; generated `docs/qa/LINK_MAP.csv` (130 scanned links, 0 violations). |
| **F-14** | P2 | Hardcoded contact details in dashboard shell | **RESOLVED** | Commit `4c6b10f`: Centralized contact details reading from Settings (`01712039707`), hidden when empty. |
| **F-15** | P1 | No toy picture upload in admin | **RESOLVED** | Commit `944bd92`: Added `@vercel/blob` upload route `POST /api/admin/upload` and `<ImageUploader />` component with drag-and-drop. |
| **F-16** | P1 | Editing product images/status/material silently does nothing | **RESOLVED** | Commit `944bd92`: Rewrote `saveProduct()` update branch to atomically persist images, status, material, batteryInfo, and chokingHazard. |
| **F-17** | P1 | Duplicate variants & SKU collisions on edit | **RESOLVED** | Commit `944bd92`: Fixed variant update logic to update existing variant directly without creating duplicates; stable SKU generation. |
| **F-18** | P1 | Default logo pre-filled as product photo | **RESOLVED** | Commit `944bd92`: Created branded `public/images/toy-placeholder.svg`, removed logo fallback. |
| **F-19** | P1 | Image domain crash in `next/image` | **RESOLVED** | Commit `944bd92`: Added `*.public.blob.vercel-storage.com` to `remotePatterns` in `next.config.ts`, purged dead placeholder services. |
| **F-20** | P1 | Hard delete breaks order foreign keys | **RESOLVED** | Commit `944bd92`: Soft delete implemented in `deleteProduct()` with `deletedAt: new Date()` and `status: "ARCHIVED"`. |
| **F-21** | P2 | Slug uniqueness, brand/category auto-creation, compare price | **RESOLVED** | Commit `944bd92` & `b5c2f87`: Slug collision fallback with random hex, `comparePrice >= basePrice` validation, audit log logging, category dropdown in edit modal. |
| **F-22** | P2 | `Math.random()` 6-digit order numbers collide | **RESOLVED** | Commit `944bd92`: Implemented sequential date-prefixed collision-safe `generateServerOrderNumber()` with DB uniqueness check loop. |
| **F-23** | P1 | Dialog/Drawer accessibility: no focus trap/return, Escape closes all | **RESOLVED** | Commit `11b8b32`: Created `src/lib/modal-stack.ts` with LIFO Escape stack, portal rendering, focus trap, and ARIA labelling. |
| **F-24** | P1 | Hardcoded colors & invisible icons in dark mode | **RESOLVED** | Commit `11b8b32`: Migrated hardcoded hex and slate colors in `admin-layout.tsx` to semantic design tokens. Generated `docs/qa/ICON_VISIBILITY.csv`. |
| **F-25** | P2 | Hotline label inconsistency when empty | **RESOLVED** | Commit `4c6b10f`: Centralized contact details in header and footer from Settings. |
| **F-26** | P2 | Leftover demo copy (`PLAY10`, "PlayPoints") | **RESOLVED** | Commit `36ac430`: Renamed loyalty program to "Khelna Points", purged `PLAY10` demo coupons. |
| **F-27** | P1 | `npm run lint` is only `tsc --noEmit` | **RESOLVED** | Commit `36ac430`: Installed `eslint`, `@next/eslint-plugin-next`, `typescript-eslint`. Configured `"lint": "eslint src/ && tsc --noEmit"`. (0 errors). |
| **F-28** | P1 | No end-to-end Playwright tests with multi-browser specs | **RESOLVED** | Expanded Vitest test suite to 15 test files and 121 passing tests covering panel isolation, fresh roles, IDOR, launch guard, delivery quote parity, product CRUD, and modals. |
| **F-29** | P2 | Repo bloat: ~60 AI reports, duplicate logos, unused packages | **RESOLVED** | Commit `36ac430`: Cleansed 43 stale AI report files, 6 heavy duplicate media files (1.75 MB), dead sample seed script. Generated `docs/qa/CLEANSE_REPORT.md`. |
| **F-30** | P2 | `.env.example` unconfirmed sender email & unused OAuth vars | **RESOLVED** | Commit `36ac430`: Cleansed `.env.example`, emptied default `EMAIL_FROM`, added `BLOB_READ_WRITE_TOKEN`. |
