const { chromium } = require("C:/Users/Administrator/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright-core");
const fs = require("fs");
const path = require("path");

const REPORT_DIR = "C:/Users/Administrator/.gemini/antigravity/brain/5803c351-403e-4c58-8878-18c0b11e6484/playwright-reports";
const BASE_URL = "http://localhost:3000";

async function captureSlice4() {
  if (!fs.existsSync(REPORT_DIR)) {
    fs.mkdirSync(REPORT_DIR, { recursive: true });
  }

  const browser = await chromium.launch({
    executablePath: "C:\\Program Files (x86)\\Microsoft\\EdgeCore\\157.0.4341.46\\msedge.exe",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const targets = [
    { name: "slice4-listing-1440", url: `${BASE_URL}/c/all`, width: 1440, height: 900, dark: false },
    { name: "slice4-listing-390", url: `${BASE_URL}/c/all`, width: 390, height: 844, dark: false },
    { name: "slice4-search-1440", url: `${BASE_URL}/search?q=robot`, width: 1440, height: 900, dark: false },
    { name: "slice4-listing-1440-dark", url: `${BASE_URL}/c/all`, width: 1440, height: 900, dark: true },
  ];

  for (const t of targets) {
    console.log(`📸 Capturing ${t.name} (${t.width}x${t.height}, dark: ${t.dark})...`);
    const context = await browser.newContext({
      viewport: { width: t.width, height: t.height },
      colorScheme: t.dark ? "dark" : "light",
    });
    const page = await context.newPage();

    await page.goto(t.url, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(2000);
    if (t.dark) {
      await page.evaluate(() => {
        document.documentElement.setAttribute("data-theme", "dark");
        document.documentElement.classList.add("dark");
      });
      await page.waitForTimeout(300);
    }

    const shotPath = path.join(REPORT_DIR, `${t.name}.png`);
    await page.screenshot({ path: shotPath, fullPage: true });
    console.log(`   Saved: ${shotPath}`);
    await context.close();
  }

  await browser.close();
  console.log("✅ Slice 4 visual capture completed successfully!");
}

captureSlice4().catch((err) => {
  console.error("❌ Error capturing Slice 4 screenshots:", err);
  process.exit(1);
});
