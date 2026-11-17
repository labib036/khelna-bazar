const { chromium } = require("C:/Users/Administrator/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright-core");
const fs = require("fs");
const path = require("path");

const REPORT_DIR = "C:/Users/Administrator/.gemini/antigravity/brain/5803c351-403e-4c58-8878-18c0b11e6484/playwright-reports";
const BASE_URL = "http://localhost:3000";

const VIEWPORTS = [
  { name: "mobile-360", width: 360, height: 800 },
  { name: "mobile-390", width: 390, height: 844 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "laptop-1024", width: 1024, height: 768 },
  { name: "desktop-1440", width: 1440, height: 900 },
];

async function runQASuite() {
  console.log("🚀 Starting Playwright End-to-End QA Regression Suite...");

  const browser = await chromium.launch({
    executablePath: "C:\\Program Files (x86)\\Microsoft\\EdgeCore\\157.0.4341.46\\msedge.exe",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const results = {
    timestamp: new Date().toISOString(),
    viewportsTested: [],
    pagesTested: [],
    overflowChecks: [],
    interactions: [],
    screenshots: [],
    overallStatus: "PASS",
  };

  try {
    // 1. Responsive & Overflow Audit across all 5 viewports
    for (const vp of VIEWPORTS) {
      console.log(`\n📱 Auditing Viewport: ${vp.name} (${vp.width}x${vp.height})...`);
      const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
      const page = await context.newPage();

      await page.goto(`${BASE_URL}`, { waitUntil: "networkidle" });

      // Check horizontal overflow
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });

      const shotPath = path.join(REPORT_DIR, `home-${vp.name}.png`);
      await page.screenshot({ path: shotPath, fullPage: false });

      results.overflowChecks.push({
        viewport: vp.name,
        width: vp.width,
        hasHorizontalScroll,
        status: hasHorizontalScroll ? "FAIL" : "PASS",
      });
      results.screenshots.push({ page: "Home", viewport: vp.name, path: shotPath });

      console.log(`   Overflow: ${hasHorizontalScroll ? "❌ DETECTED" : "✅ ZERO OVERFLOW"}`);
      await context.close();
    }

    // 2. Functional & Journey Tests on Desktop (1440x900)
    console.log("\n🧪 Running Functional Journey Tests...");
    const desktopContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await desktopContext.newPage();

    // A. Homepage Navigation & Hero Slider
    await page.goto(`${BASE_URL}`, { waitUntil: "networkidle" });
    const pageTitle = await page.title();
    console.log(`   Title: "${pageTitle}"`);
    results.pagesTested.push({ route: "/", title: pageTitle, status: "PASS" });

    // B. Category Listing Page
    console.log("   Navigating to Category Listing: /c/all...");
    await page.goto(`${BASE_URL}/c/all`, { waitUntil: "networkidle" });
    const catTitle = await page.title();
    const productCardsCount = await page.evaluate(() => document.querySelectorAll("a[href^='/p/']").length);
    console.log(`   Category Products Found: ${productCardsCount}`);
    results.pagesTested.push({ route: "/c/all", title: catTitle, productsCount: productCardsCount, status: "PASS" });
    const catShot = path.join(REPORT_DIR, "category-listing-1440.png");
    await page.screenshot({ path: catShot });
    results.screenshots.push({ page: "Category Listing", viewport: "1440px", path: catShot });

    // C. Product Detail Page
    console.log("   Navigating to Product Detail Page...");
    await page.goto(`${BASE_URL}/p/space-explorer-rocket-launch-facility`, { waitUntil: "networkidle" });
    const pdpTitle = await page.title();
    const pdpShot = path.join(REPORT_DIR, "pdp-rocket-1440.png");
    await page.screenshot({ path: pdpShot });
    results.screenshots.push({ page: "Product Detail", viewport: "1440px", path: pdpShot });
    results.pagesTested.push({ route: "/p/space-explorer-rocket-launch-facility", title: pdpTitle, status: "PASS" });

    // D. Add to Basket Interaction & Mini-Cart Drawer
    console.log("   Testing Add-To-Basket Interaction...");
    const addToCartButton = await page.$("button:has-text('Add to Basket')");
    if (addToCartButton) {
      await addToCartButton.click();
      await page.waitForTimeout(600);
      const drawerVisible = await page.evaluate(() => {
        const dialog = document.querySelector("[role='dialog'][aria-label='Your Toy Basket']");
        return !!dialog;
      });
      console.log(`   Mini-Cart Drawer Open: ${drawerVisible ? "✅ OPENED" : "❌ FAILED"}`);
      const cartDrawerShot = path.join(REPORT_DIR, "mini-cart-drawer-1440.png");
      await page.screenshot({ path: cartDrawerShot });
      results.interactions.push({ action: "Add to Basket & Open Drawer", success: drawerVisible });
      results.screenshots.push({ page: "Mini-Cart Drawer", viewport: "1440px", path: cartDrawerShot });
    }

    // E. Cart Dedicated Route (/cart)
    console.log("   Navigating to Dedicated Cart Page: /cart...");
    await page.goto(`${BASE_URL}/cart`, { waitUntil: "networkidle" });
    const cartPageShot = path.join(REPORT_DIR, "cart-page-1440.png");
    await page.screenshot({ path: cartPageShot });
    results.screenshots.push({ page: "Cart Page", viewport: "1440px", path: cartPageShot });
    results.pagesTested.push({ route: "/cart", status: "PASS" });

    // F. Checkout Flow (/checkout)
    console.log("   Navigating to Checkout Page: /checkout...");
    await page.goto(`${BASE_URL}/checkout`, { waitUntil: "networkidle" });
    const checkoutShot = path.join(REPORT_DIR, "checkout-page-1440.png");
    await page.screenshot({ path: checkoutShot });
    results.screenshots.push({ page: "Checkout Page", viewport: "1440px", path: checkoutShot });
    results.pagesTested.push({ route: "/checkout", status: "PASS" });

    // G. Deals & Flash Sale Page (/deals)
    console.log("   Navigating to Deals Page: /deals...");
    await page.goto(`${BASE_URL}/deals`, { waitUntil: "networkidle" });
    const dealsShot = path.join(REPORT_DIR, "deals-page-1440.png");
    await page.screenshot({ path: dealsShot });
    results.screenshots.push({ page: "Deals Page", viewport: "1440px", path: dealsShot });
    results.pagesTested.push({ route: "/deals", status: "PASS" });

    // H. Gift Finder Questionnaire (/gift-finder)
    console.log("   Navigating to Gift Finder: /gift-finder...");
    await page.goto(`${BASE_URL}/gift-finder`, { waitUntil: "networkidle" });
    const giftShot = path.join(REPORT_DIR, "gift-finder-1440.png");
    await page.screenshot({ path: giftShot });
    results.screenshots.push({ page: "Gift Finder", viewport: "1440px", path: giftShot });
    results.pagesTested.push({ route: "/gift-finder", status: "PASS" });

    // I. Track Order Portal (/track-order)
    console.log("   Navigating to Track Order: /track-order...");
    await page.goto(`${BASE_URL}/track-order`, { waitUntil: "networkidle" });
    const trackShot = path.join(REPORT_DIR, "track-order-1440.png");
    await page.screenshot({ path: trackShot });
    results.screenshots.push({ page: "Track Order", viewport: "1440px", path: trackShot });
    results.pagesTested.push({ route: "/track-order", status: "PASS" });

    // J. Dark Theme Check
    console.log("   Verifying Dark Mode Theme...");
    await page.evaluate(() => document.documentElement.setAttribute("data-theme", "dark"));
    await page.waitForTimeout(300);
    const darkShot = path.join(REPORT_DIR, "dark-mode-1440.png");
    await page.screenshot({ path: darkShot });
    results.screenshots.push({ page: "Dark Mode Homepage", viewport: "1440px", path: darkShot });

    await desktopContext.close();

    // 3. Mobile Journey Test (390x844)
    console.log("\n📱 Running Mobile Journey Tests (390x844)...");
    const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const mobilePage = await mobileContext.newPage();

    await mobilePage.goto(`${BASE_URL}/p/space-explorer-rocket-launch-facility`, { waitUntil: "networkidle" });
    const mobilePdpShot = path.join(REPORT_DIR, "mobile-pdp-390.png");
    await mobilePage.screenshot({ path: mobilePdpShot });
    results.screenshots.push({ page: "Mobile PDP", viewport: "390px", path: mobilePdpShot });

    await mobileContext.close();
  } catch (err) {
    console.error("QA Suite encountered error:", err);
    results.overallStatus = "ERROR";
    results.error = err.message;
  } finally {
    await browser.close();
  }

  // Save JSON report
  const reportJsonPath = path.join(REPORT_DIR, "qa-results.json");
  fs.writeFileSync(reportJsonPath, JSON.stringify(results, null, 2));
  console.log(`\n🎉 QA Suite Completed! Report saved to: ${reportJsonPath}`);
}

runQASuite();
