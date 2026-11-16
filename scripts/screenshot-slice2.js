const { chromium } = require("C:/Users/Administrator/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright-core");
const fs = require("fs");
const path = require("path");

const REPORT_DIR = "C:/Users/Administrator/.gemini/antigravity/brain/5803c351-403e-4c58-8878-18c0b11e6484/playwright-reports";
const BASE_URL = "http://localhost:3000";

async function captureSlice2() {
  if (!fs.existsSync(REPORT_DIR)) {
    fs.mkdirSync(REPORT_DIR, { recursive: true });
  }

  const browser = await chromium.launch({
    executablePath: "C:\\Program Files (x86)\\Microsoft\\EdgeCore\\157.0.4341.46\\msedge.exe",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const targets = [
    { name: "slice2-header-1440", width: 1440, height: 900, dark: false },
    { name: "slice2-header-768", width: 768, height: 1024, dark: false },
    { name: "slice2-header-390", width: 390, height: 844, dark: false },
  ];

  for (const t of targets) {
    console.log(`📸 Capturing ${t.name} (${t.width}x${t.height})...`);
    const context = await browser.newContext({
      viewport: { width: t.width, height: t.height },
      colorScheme: t.dark ? "dark" : "light",
    });
    const page = await context.newPage();

    await page.goto(`${BASE_URL}`, { waitUntil: "networkidle" });
    const shotPath = path.join(REPORT_DIR, `${t.name}.png`);
    await page.screenshot({ path: shotPath, fullPage: false });
    console.log(`   Saved: ${shotPath}`);

    if (t.name === "slice2-header-1440") {
      // Trigger mini-cart drawer to screenshot
      console.log("   Opening mini-cart drawer...");
      await page.click('button[aria-label^="Open shopping cart"]');
      await page.waitForTimeout(400);
      const cartShotPath = path.join(REPORT_DIR, "slice2-mini-cart-drawer-1440.png");
      await page.screenshot({ path: cartShotPath, fullPage: false });
      console.log(`   Saved cart drawer: ${cartShotPath}`);
    }

    await context.close();
  }

  await browser.close();
  console.log("✅ Slice 2 visual capture completed successfully!");
}

captureSlice2().catch((err) => {
  console.error("❌ Error capturing Slice 2 screenshots:", err);
  process.exit(1);
});
