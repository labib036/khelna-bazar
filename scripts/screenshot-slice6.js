const { chromium } = require("C:/Users/Administrator/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright-core");
const fs = require("fs");
const path = require("path");

const REPORT_DIR = "C:/Users/Administrator/.gemini/antigravity/brain/5803c351-403e-4c58-8878-18c0b11e6484/playwright-reports";
const BASE_URL = "http://localhost:3000";

async function captureSlice6() {
  if (!fs.existsSync(REPORT_DIR)) {
    fs.mkdirSync(REPORT_DIR, { recursive: true });
  }

  const browser = await chromium.launch({
    executablePath: "C:\\Program Files (x86)\\Microsoft\\EdgeCore\\157.0.4341.46\\msedge.exe",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const targets = [
    { name: "slice6-checkout-1440", url: `${BASE_URL}/checkout`, width: 1440, height: 900, dark: false },
    { name: "slice6-checkout-390", url: `${BASE_URL}/checkout`, width: 390, height: 844, dark: false },
    { name: "slice6-cart-1440", url: `${BASE_URL}/cart`, width: 1440, height: 900, dark: false },
    { name: "slice6-checkout-1440-dark", url: `${BASE_URL}/checkout`, width: 1440, height: 900, dark: true },
  ];

  for (const t of targets) {
    console.log(`📸 Capturing ${t.name} (${t.width}x${t.height}, dark: ${t.dark})...`);
    const context = await browser.newContext({
      viewport: { width: t.width, height: t.height },
      colorScheme: t.dark ? "dark" : "light",
    });
    const page = await context.newPage();

    // Populate a test cart item in localStorage so checkout shows order summary items
    await page.addInitScript(() => {
      const mockCart = {
        state: {
          items: [
            {
              id: "kb-prod-1-var-default",
              productId: "kb-prod-1",
              variantId: "var-default",
              name: "Space Explorer Rocket Launch Facility (850 Pcs)",
              title: "Standard Edition",
              price: 3450,
              comparePrice: 4200,
              image: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=600&q=80",
              sku: "KB-SPACEROCKET-01",
              quantity: 1,
              giftWrap: true,
              maxStock: 24,
            },
            {
              id: "kb-prod-2-var-default",
              productId: "kb-prod-2",
              variantId: "var-default",
              name: "Montessori Wooden Sorting Stacker",
              title: "Standard Edition",
              price: 1250,
              comparePrice: 1600,
              image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=600&q=80",
              sku: "KB-MONT-02",
              quantity: 1,
              giftWrap: false,
              maxStock: 15,
            },
          ],
          deliveryZone: "inside_dhaka",
          coupon: {
            code: "JOY10",
            type: "PERCENTAGE",
            value: 10,
            discountAmount: 470,
          },
        },
        version: 0,
      };
      localStorage.setItem("khelna_bazar_cart_v2", JSON.stringify(mockCart));
    });

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
  console.log("✅ Slice 6 visual capture completed successfully!");
}

captureSlice6().catch((err) => {
  console.error("❌ Error capturing Slice 6 screenshots:", err);
  process.exit(1);
});
