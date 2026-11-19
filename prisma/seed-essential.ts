import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Production-Safe Essential Seed Script
 *
 * Populates ONLY core infrastructure without overwriting owner changes:
 * 1. Default Store Settings (only if not already created)
 * 2. Official Category Taxonomy (only if not already created)
 * 3. Default Policy Pages / CMS shells (only if not already created)
 *
 * STRICT POLICY:
 * - NO unapproved default shipping rates (60, 120, 1500, etc.)
 * - NO unapproved coupons (KHELNA10 removed)
 * - NO demo users or hardcoded passwords
 * - NO fake customers, orders, reviews, or ratings
 * - NO overwriting of existing owner-maintained content
 *
 * Primary Administrator is provisioned exclusively via: `npm run admin:create`.
 */
async function main() {
  console.log("🚀 Starting Khelna Bazar Essential Production Seeder...");

  // 1. Store Settings (Non-destructive check)
  console.log("⚙️  Checking store configuration settings...");
  const existingSettings = await prisma.setting.findUnique({
    where: { key: "store_general_settings" },
  });

  if (!existingSettings) {
    const defaultSettings = {
      storeName: "Khelna Bazar",
      legalName: "Khelna Bazar",
      hotline: process.env.STORE_HOTLINE || "01712-039707",
      whatsapp: process.env.STORE_WHATSAPP || "01712039707",
      supportEmail: process.env.STORE_EMAIL || "",
      address: process.env.STORE_ADDRESS || "",
      tradeLicense: process.env.STORE_TRADE_LICENSE || "",
      binNumber: process.env.STORE_BIN || "",
      tinNumber: process.env.STORE_TIN || "",
      insideDhakaRate: null,
      outsideDhakaRate: null,
      expressDhakaRate: null,
      freeShippingThreshold: null,
      giftWrapFee: null,
      shippingConfigured: false,
      announcementText: "Welcome to Khelna Bazar — Quality toys for play, learning, and thoughtful gifting.",
      announcementActive: false,
      enableCod: true,
      enableBkash: true,
      enableNagad: true,
      bkashMerchantNumber: "01712039707",
      nagadMerchantNumber: "01712039707",
      policyInspectAtDelivery: true,
      policyRefundDefectiveAtDelivery: true,
      policyRefundAfterAcceptance: false,
      maintenanceMode: false,
      facebookUrl: "",
      instagramUrl: "",
      youtubeUrl: "",
      tiktokUrl: "",
    };

    await prisma.setting.create({
      data: {
        key: "store_general_settings",
        value: defaultSettings,
      },
    });
    console.log("✅ Initialized default store settings.");
  } else {
    console.log("ℹ️  Store settings already exist. Preserving existing settings without overwrite.");
  }

  // 2. Official Category Taxonomy (Non-destructive check)
  console.log("📁 Initializing official category taxonomy...");
  const categories = [
    {
      name: "STEM & Robotics",
      slug: "stem-robotics",
      description: "Science, technology, engineering, and logic building kits for developing young minds.",
      sortOrder: 1,
      isFeatured: true,
    },
    {
      name: "Building Blocks & Lego",
      slug: "building-blocks",
      description: "Creative interlocking bricks and architectural building sets.",
      sortOrder: 2,
      isFeatured: true,
    },
    {
      name: "Action Figures & Dolls",
      slug: "action-figures-dolls",
      description: "Imaginative pretend play figures, character toys, and collectible dolls.",
      sortOrder: 3,
      isFeatured: true,
    },
    {
      name: "Board Games & Puzzles",
      slug: "board-games-puzzles",
      description: "Family game night classics, strategic brain teasers, and jigsaw puzzles.",
      sortOrder: 4,
      isFeatured: true,
    },
    {
      name: "RC & Diecast Vehicles",
      slug: "rc-vehicles",
      description: "High-speed remote control cars, helicopters, trains, and metal scale models.",
      sortOrder: 5,
      isFeatured: true,
    },
    {
      name: "Baby & Toddler Montessori",
      slug: "baby-toddler",
      description: "Sensory development toys, soft plush, teething rings, and wooden activity gyms.",
      sortOrder: 6,
      isFeatured: true,
    },
    {
      name: "Arts, Crafts & DIY",
      slug: "arts-crafts",
      description: "Creative stationery, modeling clay, painting kits, and bead craft sets.",
      sortOrder: 7,
      isFeatured: false,
    },
    {
      name: "Outdoor & Sports Toys",
      slug: "outdoor-sports",
      description: "Ride-ons, scooters, balance bikes, water play, and active sporting gear.",
      sortOrder: 8,
      isFeatured: false,
    },
  ];

  for (const cat of categories) {
    const existing = await prisma.category.findUnique({
      where: { slug: cat.slug },
    });
    if (!existing) {
      await prisma.category.create({ data: cat });
    }
  }
  console.log("✅ Category taxonomy verified.");

  // 3. Default Policy Pages / CMS Shells (Part 6 Compliant, Non-destructive)
  console.log("📜 Initializing legal and policy page shells...");
  const policyPages = [
    {
      slug: "terms",
      title: "Terms and Conditions of Service",
      contentHtml: `<h2>1. Introduction</h2><p>Welcome to Khelna Bazar. By accessing or using our services, you agree to these Terms and Conditions.</p><h2>2. Cash on Delivery (COD)</h2><p>Cash on Delivery is available for designated delivery zones. Customers agree to inspect products upon delivery before accepting.</p><h2>3. Pricing & Currency</h2><p>All prices are listed in Bangladeshi Taka (৳ BDT).</p>`,
    },
    {
      slug: "privacy",
      title: "Privacy Policy",
      contentHtml: `<h2>1. Data Collection</h2><p>Khelna Bazar collects necessary customer information including full name, delivery address, and Bangladeshi mobile number solely to fulfill toy order deliveries and customer service inquiries.</p><h2>2. Customer Privacy</h2><p>We do not store plain-text payment passwords and never sell or distribute customer information to third-party marketing brokers.</p>`,
    },
    {
      slug: "return-refund",
      title: "Return and Refund Policy",
      contentHtml: `<h2>1. Inspect Before You Accept</h2><p>When your order arrives, please check the product in front of the delivery person before accepting it and before completing payment for Cash on Delivery.</p><h2>2. Defective Products at Delivery</h2><p>If the product is defective upon delivery, report the defect to the delivery person immediately at delivery. Defective products reported at delivery are eligible for return or refund.</p><h2>3. After You Inspect and Accept</h2><p>Once you have inspected the product, accepted it, and completed delivery, it is not refundable.</p><h2>4. No Change-of-Mind Returns</h2><p>Products cannot be returned or refunded due to a change of mind after acceptance.</p><h2>5. Official Support Contact</h2><p>For any inquiries regarding your delivery, call or WhatsApp our official support hotline at 01712-039707.</p>`,
    },
    {
      slug: "shipping",
      title: "Shipping & Delivery Policy",
      contentHtml: `<h2>1. Delivery Pricing & Information</h2><p>Delivery charges are calculated based on your destination zone and are displayed during checkout before placing your order. Cash on Delivery is available in eligible service areas.</p><h2>2. Delivery Inspection Requirement</h2><p>All deliveries require the recipient to inspect the parcel condition upon arrival in front of the delivery rider.</p>`,
    },
    {
      slug: "toy-safety",
      title: "Toy Safety & Quality Commitment",
      contentHtml: `<h2>Our Commitment to Child Safety</h2><p>At Khelna Bazar, we curate toys with child safety, developmental milestones, and age appropriateness in mind. Specific safety advisories and age guidance are noted on individual product listings.</p>`,
    },
    {
      slug: "about",
      title: "About Khelna Bazar",
      contentHtml: `<h2>About Khelna Bazar</h2><p>Khelna Bazar is an online marketplace dedicated to bringing quality toys for play, learning, and thoughtful gifting to children in Bangladesh.</p>`,
    },
  ];

  for (const page of policyPages) {
    const existing = await prisma.page.findUnique({
      where: { slug: page.slug },
    });
    if (!existing) {
      await prisma.page.create({
        data: {
          slug: page.slug,
          title: page.title,
          contentHtml: page.contentHtml,
          published: true,
        },
      });
    }
  }
  console.log("✅ Policy shells verified.");

  console.log("✅ Essential production seeding completed successfully!");
  console.log("ℹ️  To provision staff or admin accounts, run: npm run admin:create");
}

main()
  .catch((e) => {
    console.error("❌ Essential seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
