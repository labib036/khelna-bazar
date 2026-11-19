# Repository Cleanse Report (F-26, F-29, F-30)

**Date:** 2026-11-19  
**Branch:** `panels-fixes`  
**Auditor:** QA Engineering Lead  

---

## 1. Executive Summary
As part of finding **F-29** (Repo bloat) and **F-30** (Unused variables/unverified email sender), this cleanse removed:
- **43 stale AI-generated audit reports** from the root repository directory that asserted unverified "PASS" claims.
- **6 duplicate/unused heavy media files** (`.gif`, `.mp4`, duplicate `.png`, `.webp`) in `public/images/`, recovering **1.75 MB** of storage.
- **1 redundant prompt duplicate** (`khelna-bazar-stitch-ui-and-launch-master-prompt.md`).
- **1 unsafe sample seed script** (`prisma/seed-sample.ts`) which contained unapproved Unsplash remote image references.
- **Unverified default email sender** (`EMAIL_FROM`) in `.env.example`, resetting to empty string until explicitly configured.

All real human and operational documentation (`README.md`, `OWNER_INPUTS.md`, `ADMIN_GUIDE.md`, `SECURITY.md`, etc.) remains preserved and authoritative.

---

## 2. Cleansed Files Breakdown

### 2.1 Stale Audit Reports Removed from Root (43 files)
1. `ACCESSIBILITY_AUDIT.md`
2. `ADMIN_TASK_EFFICIENCY.md`
3. `ASSET_AUDIT.md`
4. `BUGS_AND_FIXES.md`
5. `CHANGELOG_QA.md`
6. `CONTENT_TRUST_REVIEW.md`
7. `DATA_CONSISTENCY_AUDIT.md`
8. `DESIGN_SYSTEM_AUDIT.md`
9. `ERROR_RECOVERY_AUDIT.md`
10. `FEATURE_COVERAGE_MATRIX.md`
11. `FEATURE_GAP_REGISTER.md`
12. `LAUNCH_CHECKLIST.md`
13. `OVERNIGHT_QA_REPORT.md`
14. `PAGE_BRIEFS.md`
15. `PANEL_ARCHITECTURE_AUDIT.md`
16. `PANEL_ISOLATION_TEST_REPORT.md`
17. `PANEL_LINK_AUDIT.md`
18. `PANEL_MIGRATION_REPORT.md`
19. `PANEL_ROUTE_MAP.md`
20. `PANEL_SECURITY_REVIEW.md`
21. `PANEL_UI_QA_REPORT.md`
22. `PERFORMANCE_AUDIT.md`
23. `PROJECT_PROGRESS.md`
24. `QA_ACCESSIBILITY_REPORT.md`
25. `QA_CHANGELOG.md`
26. `QA_DATA_CLEANUP_REPORT.md`
27. `QA_DEFECT_REGISTER.md`
28. `QA_DEPLOYMENT_READINESS.md`
29. `QA_EXECUTION_SUMMARY.md`
30. `QA_INTERACTIVE_ELEMENT_AUDIT.md`
31. `QA_PERFORMANCE_REPORT.md`
32. `QA_ROLE_PERMISSION_MATRIX.md`
33. `QA_ROUTE_COVERAGE_MATRIX.md`
34. `QA_SECURITY_REPORT.md`
35. `QA_VISUAL_RESPONSIVE_REPORT.md`
36. `RELEASE_READINESS.md`
37. `RESPONSIVE_AUDIT.md`
38. `SECURITY_AUDIT.md`
39. `UX_IMPROVEMENT_LOG.md`
40. `UX_OWNER_INPUTS_BLOCKED.md`
41. `UX_QA_EVIDENCE.md`
42. `UX_REMEDIATION_TRACKER.md`
43. `VISUAL_AUDIT.md`

### 2.2 Heavy Duplicate Media Removed (6 files, 1.75 MB)
| File Removed | Size | Reason |
| :--- | :--- | :--- |
| `public/images/logo.png` | 493.9 KB | Identical duplicate of `khelna-bazar-logo.png` |
| `public/images/khelna-bazar-logo.webp` | 492.9 KB | Unreferenced copy |
| `public/images/khelna-bazar-logo.gif` | 328.1 KB | Duplicate of animated logo |
| `public/images/logo-animated.gif` | 328.1 KB | Unreferenced animated GIF |
| `public/images/khelna-bazar-logo.mp4` | 50.4 KB | Unreferenced animated MP4 |
| `public/images/logo-animated.mp4` | 50.4 KB | Unreferenced animated MP4 |

**Canonical Active Brand Assets Kept:**
- `public/images/khelna-bazar-logo.png` (High-resolution official storefront brand logo)
- `public/images/toy-placeholder.svg` (Branded toy placeholder illustration)
- `public/favicon.ico` & `public/favicon.png` (Storefront tab icons)
- `public/icon-192.png` & `public/icon-512.png` (PWA mobile app icons)

### 2.3 Scripts & Seed Code
- Removed `prisma/seed-sample.ts`: Contained dead external Unsplash URLs.
- Removed `db:seed:sample` script from `package.json`. Canonical database seed remains `prisma/seed-essential.ts` which uses zero hardcoded passwords and fails closed in production.

---

## 3. Real Lint Installed (F-27)
- Installed `eslint`, `@next/eslint-plugin-next`, and `typescript-eslint`.
- Configured `npm run lint` to execute: `eslint src/ && tsc --noEmit`.
- Zero errors across all `src/` files.
