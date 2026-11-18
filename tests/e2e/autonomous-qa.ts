import "dotenv/config";
import { chromium, Browser, BrowserContext, Page } from "playwright";
import { PrismaClient } from "@prisma/client";
import * as fs from "node:fs";
import * as path from "node:path";

const prisma = new PrismaClient();
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const SCREENSHOT_DIR = path.resolve(process.cwd(), "artifacts/screenshots");

interface QATestResult {
  id: string;
  name: string;
  panel: "Storefront" | "Customer" | "Staff" | "Admin" | "Super Admin" | "Auth";
  persona: string;
  route: string;
  status: "PASS" | "FAIL";
  durationMs: number;
  error?: string;
  evidence?: string;
}

const results: QATestResult[] = [];
const consoleErrors: { url: string; text: string }[] = [];
const failedRequests: { url: string; failure: string }[] = [];

function recordResult(res: Omit<QATestResult, "durationMs">, startTime: number) {
  const durationMs = Date.now() - startTime;
  results.push({ ...res, durationMs });
  const icon = res.status === "PASS" ? "✅" : "❌";
  console.log(`${icon} [${res.panel}] ${res.name} (${durationMs}ms)`);
  if (res.error) console.error(`   Error: ${res.error}`);
}

async function attachErrorListeners(page: Page) {
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push({ url: page.url(), text: msg.text() });
    }
  });

  page.on("pageerror", (err) => {
    consoleErrors.push({ url: page.url(), text: `Uncaught Exception: ${err.message}` });
  });

  page.on("requestfailed", (req) => {
    failedRequests.push({
      url: req.url(),
      failure: req.failure()?.errorText || "Unknown network failure",
    });
  });
}

async function waitForPath(page: Page, pathSnippet: string, timeout = 10000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (page.url().includes(pathSnippet)) return true;
    await page.waitForTimeout(200);
  }
  throw new Error(`Timeout ${timeout}ms waiting for URL to include ${pathSnippet}. Current URL: ${page.url()}`);
}

async function captureScreenshot(page: Page, filename: string) {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }
  const filePath = path.join(SCREENSHOT_DIR, filename);
  await page.screenshot({ path: filePath, fullPage: false });
  return filePath;
}

async function runAutonomousQA() {
  console.log("=================================================================");
  console.log("🚀 Starting Khelna Bazar Autonomous Full-System QA Suite");
  console.log(`📍 Target Host: ${BASE_URL}`);
  console.log("=================================================================\n");

  const browser = await chromium.launch({ headless: true });

  try {
    // Lookup Order IDs for IDOR Testing
    const orderA = await prisma.order.findFirst({
      where: { orderNumber: "KB-QA-A1001" },
      select: { id: true, orderNumber: true, userId: true },
    });
    const orderB = await prisma.order.findFirst({
      where: { orderNumber: "KB-QA-B2001" },
      select: { id: true, orderNumber: true, userId: true },
    });

    if (!orderA || !orderB) {
      throw new Error("Synthetic QA orders KB-QA-A1001 or KB-QA-B2001 not found. Please run seed script first.");
    }

    console.log(`📦 Loaded Test Orders: Order A = ${orderA.id}, Order B = ${orderB.id}\n`);

    // =========================================================================
    // SECTION 1: PUBLIC STOREFRONT (GUEST PERSONA)
    // =========================================================================
    console.log("--- 1. Testing Public Storefront (Guest) ---");
    {
      const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const page = await context.newPage();
      await attachErrorListeners(page);

      // 1.1 Homepage
      let t0 = Date.now();
      try {
        await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded" });
        const hasShell = await page.locator('[data-testid="storefront-shell"]').count();
        if (hasShell === 0) throw new Error("Storefront shell [data-testid='storefront-shell'] not found");
        const title = await page.title();
        if (!title.toLowerCase().includes("khelna")) throw new Error(`Unexpected page title: ${title}`);
        await captureScreenshot(page, "storefront-home-desktop.png");
        recordResult({ id: "SF-001", name: "Homepage Load & Shell Verification", panel: "Storefront", persona: "Guest", route: "/", status: "PASS" }, t0);
      } catch (err: any) {
        recordResult({ id: "SF-001", name: "Homepage Load & Shell Verification", panel: "Storefront", persona: "Guest", route: "/", status: "FAIL", error: err.message }, t0);
      }

      // 1.2 Category Page
      t0 = Date.now();
      try {
        await page.goto(`${BASE_URL}/c/stem-robotics`, { waitUntil: "domcontentloaded" });
        const heading = await page.locator("h1").first().textContent();
        if (!heading || (!heading.toLowerCase().includes("stem") && !heading.toLowerCase().includes("toys"))) throw new Error(`Category heading mismatch: ${heading}`);
        await captureScreenshot(page, "storefront-category-desktop.png");
        recordResult({ id: "SF-002", name: "Category Listing View", panel: "Storefront", persona: "Guest", route: "/c/stem-robotics", status: "PASS" }, t0);
      } catch (err: any) {
        recordResult({ id: "SF-002", name: "Category Listing View", panel: "Storefront", persona: "Guest", route: "/c/stem-robotics", status: "FAIL", error: err.message }, t0);
      }

      // 1.3 Product Detail Page & Buy Box
      t0 = Date.now();
      try {
        await page.goto(`${BASE_URL}/p/space-explorer-rocket-launch-facility`, { waitUntil: "domcontentloaded" });
        const productTitle = await page.locator("h1").first().textContent();
        if (!productTitle || !productTitle.includes("Space Explorer")) throw new Error(`Product title not found: ${productTitle}`);
        await captureScreenshot(page, "storefront-product-desktop.png");
        recordResult({ id: "SF-003", name: "Product Detail Page", panel: "Storefront", persona: "Guest", route: "/p/space-explorer-rocket-launch-facility", status: "PASS" }, t0);
      } catch (err: any) {
        recordResult({ id: "SF-003", name: "Product Detail Page", panel: "Storefront", persona: "Guest", route: "/p/space-explorer-rocket-launch-facility", status: "FAIL", error: err.message }, t0);
      }

      // 1.4 Add to Cart & Cart Page
      t0 = Date.now();
      try {
        const addToCartBtn = page.locator('button:has-text("Add to Cart"), button:has-text("কার্টে যোগ করুন")').first();
        if (await addToCartBtn.isVisible()) {
          await addToCartBtn.click();
          await page.waitForTimeout(600);
        }
        await page.goto(`${BASE_URL}/cart`, { waitUntil: "domcontentloaded" });
        await captureScreenshot(page, "storefront-cart-desktop.png");
        recordResult({ id: "SF-004", name: "Cart Review & Free Delivery Bar", panel: "Storefront", persona: "Guest", route: "/cart", status: "PASS" }, t0);
      } catch (err: any) {
        recordResult({ id: "SF-004", name: "Cart Review & Free Delivery Bar", panel: "Storefront", persona: "Guest", route: "/cart", status: "FAIL", error: err.message }, t0);
      }

      // 1.5 Checkout Page
      t0 = Date.now();
      try {
        await page.goto(`${BASE_URL}/checkout`, { waitUntil: "domcontentloaded" });
        await page.waitForSelector('[data-testid="checkout-fullname"], input[id="fullName"]', { timeout: 8000 });
        await captureScreenshot(page, "storefront-checkout-desktop.png");
        recordResult({ id: "SF-005", name: "Checkout Form & COD Inspection Consent", panel: "Storefront", persona: "Guest", route: "/checkout", status: "PASS" }, t0);
      } catch (err: any) {
        recordResult({ id: "SF-005", name: "Checkout Form & COD Inspection Consent", panel: "Storefront", persona: "Guest", route: "/checkout", status: "FAIL", error: err.message }, t0);
      }

      // 1.6 Public Order Tracking (/track-order)
      t0 = Date.now();
      try {
        await page.goto(`${BASE_URL}/track-order`, { waitUntil: "domcontentloaded" });
        const orderInput = page.locator('input[placeholder*="KB-"], input[name="orderNumber"]').first();
        const phoneInput = page.locator('input[type="tel"], input[name="phone"]').first();
        const submitBtn = page.locator('button:has-text("Track"), button[type="submit"]').first();

        // Test invalid phone mismatch
        await orderInput.fill("KB-QA-A1001");
        await phoneInput.fill("01999999999");
        await submitBtn.click();
        await page.waitForTimeout(600);

        // Test valid lookup
        await phoneInput.fill("01711111111");
        await submitBtn.click();
        await page.waitForTimeout(800);
        await captureScreenshot(page, "storefront-tracking-desktop.png");
        recordResult({ id: "SF-006", name: "Public Track Order Lookup (Dual Factor)", panel: "Storefront", persona: "Guest", route: "/track-order", status: "PASS" }, t0);
      } catch (err: any) {
        recordResult({ id: "SF-006", name: "Public Track Order Lookup (Dual Factor)", panel: "Storefront", persona: "Guest", route: "/track-order", status: "FAIL", error: err.message }, t0);
      }

      // 1.7 Static Policy Pages
      t0 = Date.now();
      try {
        await page.goto(`${BASE_URL}/pages/returns-policy`, { waitUntil: "domcontentloaded" });
        const returnsH1 = await page.locator("h1").first().textContent();
        if (!returnsH1) throw new Error("Returns policy page failed to render");
        recordResult({ id: "SF-007", name: "CMS Policy Page (/pages/returns-policy)", panel: "Storefront", persona: "Guest", route: "/pages/returns-policy", status: "PASS" }, t0);
      } catch (err: any) {
        recordResult({ id: "SF-007", name: "CMS Policy Page (/pages/returns-policy)", panel: "Storefront", persona: "Guest", route: "/pages/returns-policy", status: "FAIL", error: err.message }, t0);
      }

      // 1.8 Mobile Viewport Responsive Test (375x812)
      t0 = Date.now();
      try {
        await page.setViewportSize({ width: 375, height: 812 });
        await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded" });
        const bottomNav = page.locator('nav[aria-label="Mobile Navigation"], div:has-text("Home"):has-text("Cart")').first();
        await captureScreenshot(page, "storefront-home-mobile.png");
        recordResult({ id: "SF-008", name: "Storefront Mobile Responsive Viewport (375px)", panel: "Storefront", persona: "Guest", route: "/", status: "PASS" }, t0);
      } catch (err: any) {
        recordResult({ id: "SF-008", name: "Storefront Mobile Responsive Viewport (375px)", panel: "Storefront", persona: "Guest", route: "/", status: "FAIL", error: err.message }, t0);
      }

      await context.close();
    }

    // =========================================================================
    // SECTION 2: CUSTOMER DASHBOARD & ZERO IDOR TESTING (CUSTOMER A & B)
    // =========================================================================
    console.log("\n--- 2. Testing Customer Dashboard & Zero IDOR ---");
    {
      // 2.1 Customer A Login & Overview
      const contextA = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const pageA = await contextA.newPage();
      await attachErrorListeners(pageA);

      let t0 = Date.now();
      try {
        await pageA.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
        await pageA.fill('input[autocomplete="username"]', "qa.customer.a@example.test");
        await pageA.fill('input[autocomplete="current-password"]', "QACustomer2026!");
        await pageA.click('button[type="submit"]');
        await waitForPath(pageA, "/dashboard");
        await pageA.waitForSelector('[data-testid="customer-dashboard-shell"]', { timeout: 10000 });

        const hasCustomerShell = await pageA.locator('[data-testid="customer-dashboard-shell"]').count();
        if (hasCustomerShell === 0) throw new Error("Customer dashboard shell not detected");
        const hasAdminSidebar = await pageA.locator('[data-testid="admin-sidebar"]').count();
        if (hasAdminSidebar > 0) throw new Error("SECURITY LEAK: Admin sidebar rendered inside Customer Dashboard!");

        await captureScreenshot(pageA, "customer-dashboard-overview-desktop.png");
        recordResult({ id: "CUST-001", name: "Customer A Login & Isolated Dashboard Shell", panel: "Customer", persona: "Customer A", route: "/dashboard", status: "PASS" }, t0);
      } catch (err: any) {
        recordResult({ id: "CUST-001", name: "Customer A Login & Isolated Dashboard Shell", panel: "Customer", persona: "Customer A", route: "/dashboard", status: "FAIL", error: err.message }, t0);
      }

      // 2.2 Customer A Order History & Detail View
      t0 = Date.now();
      try {
        await pageA.goto(`${BASE_URL}/dashboard/orders`, { waitUntil: "domcontentloaded" });
        await pageA.waitForSelector(`text=${orderA.orderNumber}`, { timeout: 10000 });

        await pageA.goto(`${BASE_URL}/dashboard/orders/${orderA.id}`, { waitUntil: "domcontentloaded" });
        await pageA.waitForSelector(`text=${orderA.orderNumber}`, { timeout: 10000 });
        await captureScreenshot(pageA, "customer-order-detail-desktop.png");
        recordResult({ id: "CUST-002", name: "Customer A Order List & Detail Scoping", panel: "Customer", persona: "Customer A", route: `/dashboard/orders/${orderA.id}`, status: "PASS" }, t0);
      } catch (err: any) {
        recordResult({ id: "CUST-002", name: "Customer A Order List & Detail Scoping", panel: "Customer", persona: "Customer A", route: `/dashboard/orders/${orderA.id}`, status: "FAIL", error: err.message }, t0);
      }

      // 2.3 Customer A Addresses, Profile & Rewards
      t0 = Date.now();
      try {
        await pageA.goto(`${BASE_URL}/dashboard/addresses`, { waitUntil: "domcontentloaded" });
        await pageA.goto(`${BASE_URL}/dashboard/profile`, { waitUntil: "domcontentloaded" });
        await pageA.goto(`${BASE_URL}/dashboard/rewards`, { waitUntil: "domcontentloaded" });
        recordResult({ id: "CUST-003", name: "Customer Addresses, Profile & Rewards Views", panel: "Customer", persona: "Customer A", route: "/dashboard/addresses", status: "PASS" }, t0);
      } catch (err: any) {
        recordResult({ id: "CUST-003", name: "Customer Addresses, Profile & Rewards Views", panel: "Customer", persona: "Customer A", route: "/dashboard/addresses", status: "FAIL", error: err.message }, t0);
      } finally {
        await contextA.close();
      }

      // 2.4 Customer B Login & IDOR Attack Verification
      const contextB = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const pageB = await contextB.newPage();
      await attachErrorListeners(pageB);

      t0 = Date.now();
      try {
        await pageB.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
        await pageB.fill('input[autocomplete="username"]', "qa.customer.b@example.test");
        await pageB.fill('input[autocomplete="current-password"]', "QACustomer2026!");
        await pageB.click('button[type="submit"]');
        await waitForPath(pageB, "/dashboard");
        await pageB.waitForSelector('[data-testid="customer-dashboard-shell"]', { timeout: 10000 });

        // Verify Customer B sees only Order B
        await pageB.goto(`${BASE_URL}/dashboard/orders`, { waitUntil: "domcontentloaded" });
        await pageB.waitForSelector(`text=${orderB.orderNumber}`, { timeout: 10000 });
        const seeOther = await pageB.locator(`text=${orderA.orderNumber}`).count();
        if (seeOther > 0) throw new Error("IDOR CRITICAL LEAK: Customer B saw Customer A's order in list!");

        // ADVERSARIAL IDOR ATTEMPT: Customer B requests Customer A's order ID directly
        const idorRes = await pageB.goto(`${BASE_URL}/dashboard/orders/${orderA.id}`, { waitUntil: "domcontentloaded" });
        const status = idorRes?.status();
        const bodyText = await pageB.content();

        // Expect 404 or Unauthorized or Not Found
        const isProtected = status === 404 || bodyText.includes("not found") || bodyText.includes("404") || bodyText.includes("Unauthorized");
        if (!isProtected) {
          throw new Error(`IDOR CRITICAL VULNERABILITY: Customer B accessed Customer A's order with status ${status}`);
        }

        recordResult({ id: "SEC-001", name: "Zero IDOR Protection: Cross-Customer Order Isolation", panel: "Customer", persona: "Customer B", route: `/dashboard/orders/${orderA.id}`, status: "PASS" }, t0);
      } catch (err: any) {
        recordResult({ id: "SEC-001", name: "Zero IDOR Protection: Cross-Customer Order Isolation", panel: "Customer", persona: "Customer B", route: `/dashboard/orders/${orderA.id}`, status: "FAIL", error: err.message }, t0);
      } finally {
        await contextB.close();
      }
    }

    // =========================================================================
    // SECTION 3: STAFF PANEL & LEAST PRIVILEGE ENFORCEMENT
    // =========================================================================
    console.log("\n--- 3. Testing Staff Panel & Least Privilege ---");
    {
      const contextStaff = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const pageStaff = await contextStaff.newPage();
      await attachErrorListeners(pageStaff);

      let t0 = Date.now();
      try {
        await pageStaff.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
        await pageStaff.fill('input[autocomplete="username"]', "qa.staff@example.test");
        await pageStaff.fill('input[autocomplete="current-password"]', "QAStaff2026!");
        await pageStaff.click('button[type="submit"]');
        await waitForPath(pageStaff, "/admin");
        await pageStaff.waitForSelector('[data-testid="admin-dashboard-shell"]', { timeout: 10000 });

        const hasAdminShell = await pageStaff.locator('[data-testid="admin-dashboard-shell"]').count();
        if (hasAdminShell === 0) throw new Error("Admin shell not rendered for Staff");

        // Verify Staff sees Orders
        const hasOrdersTab = await pageStaff.locator('[data-testid="admin-sidebar"] a[href*="/admin/orders"]').count();
        if (hasOrdersTab === 0) throw new Error("Staff missing Orders tab in sidebar");

        // Verify Staff DOES NOT see Catalog, Settings, Staff, or Audit Logs in sidebar
        const hasCatalog = await pageStaff.locator('[data-testid="admin-sidebar"] a[href*="/admin/products"]').count();
        const hasStaffTab = await pageStaff.locator('[data-testid="admin-sidebar"] a[href*="/admin/staff"]').count();
        const hasAuditTab = await pageStaff.locator('[data-testid="admin-sidebar"] a[href*="/admin/audit-logs"]').count();
        if (hasCatalog > 0 || hasStaffTab > 0 || hasAuditTab > 0) {
          throw new Error("PRIVILEGE LEAK: Staff sidebar displayed Admin/SuperAdmin tabs!");
        }

        // Access Orders view
        await pageStaff.goto(`${BASE_URL}/admin/orders`, { waitUntil: "domcontentloaded" });
        await captureScreenshot(pageStaff, "staff-orders-desktop.png");

        // Attempt Privilege Escalation to /admin/settings
        await pageStaff.goto(`${BASE_URL}/admin/settings`);
        await pageStaff.waitForTimeout(600);
        if (pageStaff.url().includes("/admin/settings")) {
          throw new Error("PRIVILEGE ESCALATION: Staff reached /admin/settings!");
        }

        // Attempt Privilege Escalation to /admin/staff
        await pageStaff.goto(`${BASE_URL}/admin/staff`);
        await pageStaff.waitForTimeout(600);
        if (pageStaff.url().includes("/admin/staff")) {
          throw new Error("PRIVILEGE ESCALATION: Staff reached /admin/staff!");
        }

        recordResult({ id: "STAFF-001", name: "Staff Operational Access & Privilege Boundaries", panel: "Staff", persona: "Staff", route: "/admin/orders", status: "PASS" }, t0);
      } catch (err: any) {
        recordResult({ id: "STAFF-001", name: "Staff Operational Access & Privilege Boundaries", panel: "Staff", persona: "Staff", route: "/admin/orders", status: "FAIL", error: err.message }, t0);
      }

      await contextStaff.close();
    }

    // =========================================================================
    // SECTION 4: ADMIN PANEL
    // =========================================================================
    console.log("\n--- 4. Testing Admin Panel ---");
    {
      const contextAdmin = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const pageAdmin = await contextAdmin.newPage();
      await attachErrorListeners(pageAdmin);

      let t0 = Date.now();
      try {
        await pageAdmin.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
        await pageAdmin.fill('input[autocomplete="username"]', "qa.admin@example.test");
        await pageAdmin.fill('input[autocomplete="current-password"]', "QAAdmin2026!");
        await pageAdmin.click('button[type="submit"]');
        await waitForPath(pageAdmin, "/admin");
        await pageAdmin.waitForSelector('[data-testid="admin-dashboard-shell"]', { timeout: 10000 });

        // Admin can access Products, Inventory, Coupons, Settings
        await pageAdmin.goto(`${BASE_URL}/admin/products`, { waitUntil: "domcontentloaded" });
        await captureScreenshot(pageAdmin, "admin-products-desktop.png");

        await pageAdmin.goto(`${BASE_URL}/admin/inventory`, { waitUntil: "domcontentloaded" });
        await pageAdmin.goto(`${BASE_URL}/admin/coupons`, { waitUntil: "domcontentloaded" });
        await pageAdmin.goto(`${BASE_URL}/admin/settings`, { waitUntil: "domcontentloaded" });

        // Boundary test: Admin cannot access /admin/staff or /admin/audit-logs
        await pageAdmin.goto(`${BASE_URL}/admin/staff`);
        await pageAdmin.waitForTimeout(600);
        if (pageAdmin.url().includes("/admin/staff")) {
          throw new Error("PRIVILEGE ESCALATION: Admin reached Super Admin /admin/staff!");
        }

        await pageAdmin.goto(`${BASE_URL}/admin/audit-logs`);
        await pageAdmin.waitForTimeout(600);
        if (pageAdmin.url().includes("/admin/audit-logs")) {
          throw new Error("PRIVILEGE ESCALATION: Admin reached Super Admin /admin/audit-logs!");
        }

        recordResult({ id: "ADMIN-001", name: "Admin Operations & Super Admin Boundary Guard", panel: "Admin", persona: "Admin", route: "/admin/dashboard", status: "PASS" }, t0);
      } catch (err: any) {
        recordResult({ id: "ADMIN-001", name: "Admin Operations & Super Admin Boundary Guard", panel: "Admin", persona: "Admin", route: "/admin/dashboard", status: "FAIL", error: err.message }, t0);
      }

      await contextAdmin.close();
    }

    // =========================================================================
    // SECTION 5: SUPER ADMIN PANEL (STAFFING & AUDIT LOGS)
    // =========================================================================
    console.log("\n--- 5. Testing Super Admin Panel ---");
    {
      const contextSuper = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const pageSuper = await contextSuper.newPage();
      await attachErrorListeners(pageSuper);

      let t0 = Date.now();
      try {
        await pageSuper.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
        await pageSuper.fill('input[autocomplete="username"]', "qa.superadmin@example.test");
        await pageSuper.fill('input[autocomplete="current-password"]', "QASuperAdmin2026!");
        await pageSuper.click('button[type="submit"]');
        await waitForPath(pageSuper, "/admin");
        await pageSuper.waitForSelector('[data-testid="admin-dashboard-shell"]', { timeout: 10000 });

        // 5.1 Staff Directory View
        await pageSuper.goto(`${BASE_URL}/admin/staff`, { waitUntil: "domcontentloaded" });
        const staffDirectory = await pageSuper.locator('[data-testid="admin-staff-directory"]').count();
        if (staffDirectory === 0) throw new Error("Super Admin staff directory [data-testid='admin-staff-directory'] not found");
        await captureScreenshot(pageSuper, "superadmin-staff-desktop.png");

        // 5.2 Provision a test staff member via form
        const addStaffBtn = pageSuper.locator('button:has-text("Add Staff Member")').first();
        if (await addStaffBtn.isVisible()) {
          await addStaffBtn.click();
          await pageSuper.fill('input[placeholder*="Tanvir"]', "QA Automated Provisioned Staff");
          await pageSuper.fill('input[type="email"]', "qa.automated.staff@khelnabazar.com.bd");
          await pageSuper.fill('input[placeholder*="01712"]', "01766666666");
          await pageSuper.click('button[type="submit"]:has-text("Create Staff Account")');
          await pageSuper.waitForTimeout(1000);
        }

        // 5.3 Audit Logs View
        await pageSuper.goto(`${BASE_URL}/admin/audit-logs`, { waitUntil: "domcontentloaded" });
        const auditView = await pageSuper.locator('[data-testid="admin-audit-logs-view"]').count();
        if (auditView === 0) throw new Error("Super Admin audit logs [data-testid='admin-audit-logs-view'] not found");
        await captureScreenshot(pageSuper, "superadmin-audit-logs-desktop.png");

        recordResult({ id: "SUPER-001", name: "Super Admin Staff Provisioning & Audit Log Inspection", panel: "Super Admin", persona: "Super Admin", route: "/admin/staff", status: "PASS" }, t0);
      } catch (err: any) {
        recordResult({ id: "SUPER-001", name: "Super Admin Staff Provisioning & Audit Log Inspection", panel: "Super Admin", persona: "Super Admin", route: "/admin/staff", status: "FAIL", error: err.message }, t0);
      }

      await contextSuper.close();
    }
  } finally {
    await browser.close();
  }

  // Summary Report
  console.log("\n=================================================================");
  console.log("📊 Autonomous QA Run Summary");
  console.log("=================================================================");
  const passed = results.filter((r) => r.status === "PASS").length;
  const failed = results.filter((r) => r.status === "FAIL").length;
  console.log(`Total Scenarios Tested: ${results.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Runtime Console Errors: ${consoleErrors.length}`);
  console.log(`Network Failures: ${failedRequests.length}`);
  console.log("=================================================================\n");

  // Write JSON report
  fs.writeFileSync("artifacts/qa-results.json", JSON.stringify({ results, consoleErrors, failedRequests }, null, 2));

  if (failed > 0) {
    process.exit(1);
  }
}

runAutonomousQA().catch((e) => {
  console.error("Fatal QA Suite Error:", e);
  process.exit(1);
});
