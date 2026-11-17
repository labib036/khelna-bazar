const { chromium } = require("C:/Users/Administrator/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright-core");
const fs = require("fs");
const path = require("path");

const REPORT_DIR = "C:/Users/Administrator/.gemini/antigravity/brain/5803c351-403e-4c58-8878-18c0b11e6484/playwright-reports";
const BASE_URL = "http://localhost:3000";

async function loginAdmin(page) {
  await page.goto(`${BASE_URL}/login?next=/admin`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(1000);
  await page.click("text=Demo Admin");
  await page.waitForTimeout(500);
  await page.click("button:has-text('Sign In')");
  await page.waitForURL("**/admin", { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(3000);
}

async function captureAdmin() {
  if (!fs.existsSync(REPORT_DIR)) {
    fs.mkdirSync(REPORT_DIR, { recursive: true });
  }

  const browser = await chromium.launch({
    executablePath: "C:\\Program Files (x86)\\Microsoft\\EdgeCore\\157.0.4341.46\\msedge.exe",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  // 1. Desktop context
  const desktopCtx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await desktopCtx.newPage();

  console.log("Logging in as Demo Admin with next=/admin...");
  await loginAdmin(page);

  const targets = [
    { name: "slice10-admin-1440", url: `${BASE_URL}/admin` },
    { name: "slice10-admin-orders-1440", url: `${BASE_URL}/admin/orders` },
    { name: "slice10-admin-products-1440", url: `${BASE_URL}/admin/products` },
    { name: "slice10-admin-inventory-1440", url: `${BASE_URL}/admin/inventory` },
    { name: "slice10-admin-coupons-1440", url: `${BASE_URL}/admin/coupons` },
    { name: "slice10-admin-settings-1440", url: `${BASE_URL}/admin/settings` },
  ];

  for (const t of targets) {
    try {
      await page.goto(t.url, { waitUntil: "domcontentloaded", timeout: 60000 });
      await page.waitForTimeout(2000);
      const filePath = path.join(REPORT_DIR, `${t.name}.png`);
      await page.screenshot({ path: filePath, fullPage: true });
      console.log(`Saved: ${t.name}.png`);
    } catch (e) {
      console.error(`Error on ${t.name}:`, e.message);
    }
  }

  // Dark mode
  try {
    await page.goto(`${BASE_URL}/admin`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.evaluate(() => document.documentElement.classList.add("dark"));
    await page.waitForTimeout(2000);
    const darkPath = path.join(REPORT_DIR, "slice10-admin-1440-dark.png");
    await page.screenshot({ path: darkPath, fullPage: true });
    console.log("Saved: slice10-admin-1440-dark.png");
  } catch (e) {
    console.error("Error on dark mode:", e.message);
  }

  await desktopCtx.close();

  // 2. Mobile context
  const mobileCtx = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  const mobilePage = await mobileCtx.newPage();
  try {
    await loginAdmin(mobilePage);
    await mobilePage.goto(`${BASE_URL}/admin`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await mobilePage.waitForTimeout(2000);
    const mobilePath = path.join(REPORT_DIR, "slice10-admin-390.png");
    await mobilePage.screenshot({ path: mobilePath, fullPage: true });
    console.log("Saved: slice10-admin-390.png");
  } catch (e) {
    console.error("Error on mobile:", e.message);
  }
  await mobileCtx.close();

  await browser.close();
  console.log("Admin screenshot captures complete.");
}

captureAdmin().catch(console.error);
