const { chromium } = require("C:/Users/Administrator/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright-core");
const fs = require("fs");
const path = require("path");

const REPORT_DIR = "C:/Users/Administrator/.gemini/antigravity/brain/5803c351-403e-4c58-8878-18c0b11e6484/playwright-reports";
const BASE_URL = "http://localhost:3000";

async function captureSlice7() {
  if (!fs.existsSync(REPORT_DIR)) {
    fs.mkdirSync(REPORT_DIR, { recursive: true });
  }

  const browser = await chromium.launch({
    executablePath: "C:\\Program Files (x86)\\Microsoft\\EdgeCore\\157.0.4341.46\\msedge.exe",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const targets = [
    { name: "slice7-wishlist-1440", url: `${BASE_URL}/wishlist`, width: 1440, height: 900, dark: false },
    { name: "slice7-compare-1440", url: `${BASE_URL}/compare`, width: 1440, height: 900, dark: false },
    { name: "slice7-giftfinder-1440", url: `${BASE_URL}/gift-finder`, width: 1440, height: 900, dark: false },
    { name: "slice7-trackorder-1440", url: `${BASE_URL}/track-order`, width: 1440, height: 900, dark: false },
  ];

  for (const t of targets) {
    console.log(`📸 Capturing ${t.name} (${t.width}x${t.height}, dark: ${t.dark})...`);
    const context = await browser.newContext({
      viewport: { width: t.width, height: t.height },
      colorScheme: t.dark ? "dark" : "light",
    });
    const page = await context.newPage();

    if (t.name.includes("wishlist")) {
      await page.addInitScript(() => {
        const mockWishlist = {
          state: {
            items: [
              {
                productId: "kb-prod-1",
                name: "Space Explorer Rocket Launch Facility (850 Pcs)",
                slug: "space-explorer-rocket-launch-facility",
                price: 3450,
                comparePrice: 4200,
                image: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=600&q=80",
                ratingAvg: 4.9,
                ratingCount: 42,
              },
            ],
          },
          version: 0,
        };
        localStorage.setItem("khelna_bazar_wishlist_v2", JSON.stringify(mockWishlist));
      });
    }

    if (t.name.includes("compare")) {
      await page.addInitScript(() => {
        const mockCompare = {
          state: {
            products: [
              {
                id: "kb-prod-1",
                name: "Space Explorer Rocket Launch Facility (850 Pcs)",
                slug: "space-explorer-rocket-launch-facility",
                price: 3450,
                comparePrice: 4200,
                image: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=600&q=80",
                ratingAvg: 4.9,
                ratingCount: 42,
                minAgeMonths: 72,
                maxAgeMonths: 168,
                material: "High-grade ABS Plastic (BPA Free)",
                batteryInfo: "None required",
                chokingHazard: true,
                brandName: "BrickCrafters",
                categoryName: "Building Blocks",
              },
              {
                id: "kb-prod-2",
                name: "Montessori Wooden Sorting Stacker",
                slug: "montessori-wooden-sorting-stacker",
                price: 1250,
                comparePrice: 1600,
                image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=600&q=80",
                ratingAvg: 4.8,
                ratingCount: 28,
                minAgeMonths: 12,
                maxAgeMonths: 36,
                material: "Natural Beechwood with Water Pigments",
                batteryInfo: "None required",
                chokingHazard: false,
                brandName: "TinyGeniuses",
                categoryName: "Baby & Toddler",
              },
            ],
          },
          version: 0,
        };
        localStorage.setItem("khelna_bazar_compare_v2", JSON.stringify(mockCompare));
      });
    }

    await page.goto(t.url, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(2000);

    const shotPath = path.join(REPORT_DIR, `${t.name}.png`);
    await page.screenshot({ path: shotPath, fullPage: true });
    console.log(`   Saved: ${shotPath}`);
    await context.close();
  }

  await browser.close();
  console.log("✅ Slice 7 visual capture completed successfully!");
}

captureSlice7().catch((err) => {
  console.error("❌ Error capturing Slice 7 screenshots:", err);
  process.exit(1);
});
