import { PrismaClient, CouponType } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Production-Safe Essential Seed Script
 *
 * Populates ONLY core infrastructure:
 * 1. Default Store Settings
 * 2. Official Category Taxonomy
 * 3. Default Policy Pages (CMS shells)
 * 4. Default Store Coupon (KHELNA10)
 *
 * STRICT POLICY:
 * - NO demo users or passwords created.
 * - NO fake customers.
 * - NO fake orders.
 * - NO fake reviews or ratings.
 * Primary Administrator is provisioned exclusively via: `npm run admin:create`.
 */
async function main() {
  console.log("🚀 Starting Khelna Bazar Essential Production Seeder...");

  // 1. Default Store Settings
  console.log("⚙️  Initializing store configuration settings...");
  const defaultSettings = {
    storeName: "Khelna Bazar",
    legalName: "Khelna Bazar",
    hotline: process.env.STORE_HOTLINE || "01712039707",
    whatsapp: process.env.STORE_WHATSAPP || "01712039707",
    supportEmail: process.env.STORE_EMAIL || "",
    address: process.env.STORE_ADDRESS || "",
    tradeLicense: process.env.STORE_TRADE_LICENSE || "",
    binNumber: process.env.STORE_BIN || "",
    tinNumber: process.env.STORE_TIN || "",
    insideDhakaRate: 60,
    outsideDhakaRate: 120,
    expressDhakaRate: 150,
    freeShippingThreshold: 0,
    giftWrapFee: 0,
    announcementText: "ডেলিভারি ম্যানের সামনে পণ্যটি দেখে নিয়ে তারপর গ্রহণ করুন | Hotline & WhatsApp: 01712-039707",
    announcementActive: true,
    enableCod: true,
    enableBkash: true,
    enableNagad: true,
    bkashMerchantNumber: process.env.BKASH_MERCHANT_NUMBER || "01712039707",
    bkashInstructionType: "send_money",
    nagadMerchantNumber: process.env.NAGAD_MERCHANT_NUMBER || "01712039707",
    nagadInstructionType: "send_money",
    policyInspectAtDelivery: true,
    policyRefundDefectiveAtDelivery: true,
    policyRefundAfterAcceptance: false,
    maintenanceMode: false,
    facebookUrl: "",
    instagramUrl: "",
    youtubeUrl: "",
    tiktokUrl: "",
  };

  await prisma.setting.upsert({
    where: { key: "store_general_settings" },
    update: { value: defaultSettings },
    create: {
      key: "store_general_settings",
      value: defaultSettings,
    },
  });

  // 2. Official Category Taxonomy
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
      description: "Sensory development toys, soft plush, teething rings, and wooden activity gyms (0-36m).",
      sortOrder: 6,
      isFeatured: true,
    },
    {
      name: "Arts, Crafts & DIY",
      slug: "arts-crafts",
      description: "Non-toxic modelling clay, painting kits, bead craft, and creative stationery.",
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
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description,
        sortOrder: cat.sortOrder,
        isFeatured: cat.isFeatured,
      },
      create: cat,
    });
  }

  // 3. Default Policy Pages (CMS Shells)
  console.log("📜 Initializing legal and policy page shells...");
  const policyPages = [
    {
      slug: "terms",
      title: "Terms and Conditions of Service",
      contentHtml: `<h2>1. Introduction</h2><p>Welcome to Khelna Bazar. By accessing or using our website and services, you agree to be bound by these Terms and Conditions.</p><h2>2. Cash on Delivery (COD)</h2><p>Cash on Delivery is provided across all 64 districts of Bangladesh. Customers agree to inspect parcels upon delivery and tender payment to the authorized courier agent.</p><h2>3. Pricing & Currency</h2><p>All prices are listed in Bangladeshi Taka (৳ BDT) inclusive of applicable taxes.</p>`,
    },
    {
      slug: "privacy",
      title: "Privacy Policy",
      contentHtml: `<h2>1. Data Collection</h2><p>Khelna Bazar collects necessary customer information including name, delivery address, and Bangladeshi mobile number solely to fulfill toy delivery and customer service.</p><h2>2. Data Security</h2><p>We do not store plain-text payment passwords and never sell customer data to third-party marketing brokers.</p>`,
    },
    {
      slug: "return-refund",
      title: "Return and Refund Policy",
      contentHtml: `<h2>1. Inspect at Delivery</h2><p>When your order arrives, please open and check the product in front of the delivery person before you accept it and before you pay (for Cash on Delivery).</p><h2>2. Defective or Wrong Products</h2><p>If the product is defective, damaged, or not what you ordered, inform the delivery person immediately and refuse the item at the door. Contact us on 01712-039707 (Call or WhatsApp) the same day. We will provide a full refund or replacement subject to stock availability.</p><h2>3. Cash on Delivery (COD)</h2><p>If you refuse a defective item at delivery, you do not pay for it.</p><h2>4. Prepaid Orders (bKash / Nagad)</h2><p>If a defective item is returned at delivery, we refund the full amount to the mobile wallet number you paid from.</p><h2>5. After You Accept the Product</h2><p>Once you have inspected the product, accepted it, and received it, it cannot be refunded or returned.</p><h2>6. Change of Mind</h2><p>Products cannot be returned or refunded due to a change of mind after acceptance.</p><h2>7. Support Contact</h2><p>For any order queries, call or WhatsApp our official support line at 01712-039707.</p>`,
    },
    {
      slug: "shipping",
      title: "Shipping & Delivery Policy",
      contentHtml: `<h2>1. Delivery Zones & Rates</h2><p>Inside Dhaka: ৳60 (Standard 24–48 Hours)</p><p>Outside Dhaka: ৳120 (Nationwide 2–4 Business Days)</p><p>Free delivery applies automatically to all orders exceeding ৳1,500.</p>`,
    },
    {
      slug: "toy-safety",
      title: "Toy Safety & Quality Commitment",
      contentHtml: `<h2>Our Commitment to Child Safety</h2><p>At Khelna Bazar, every toy is carefully curated with child development, age appropriateness, and safety in mind. We provide explicit age recommendations and choking hazard warnings for all products containing small parts.</p>`,
    },
    {
      slug: "about",
      title: "About Khelna Bazar",
      contentHtml: `<h2>Bangladesh's Most Trusted Online Toy Marketplace</h2><p>Khelna Bazar was founded to bring joyful, educational, and safe toys to every child across Bangladesh with reliable doorstep Cash on Delivery.</p>`,
    },
  ];

  for (const page of policyPages) {
    await prisma.page.upsert({
      where: { slug: page.slug },
      update: {
        title: page.title,
        contentHtml: page.contentHtml,
      },
      create: {
        slug: page.slug,
        title: page.title,
        contentHtml: page.contentHtml,
        published: true,
      },
    });
  }

  // 4. Default Store Coupon
  console.log("🎟️  Initializing default launch promo coupon (KHELNA10)...");
  await prisma.coupon.upsert({
    where: { code: "KHELNA10" },
    update: {
      active: true,
      value: 10,
      minSpend: 500,
      maxDiscount: 500,
    },
    create: {
      code: "KHELNA10",
      type: CouponType.PERCENTAGE,
      value: 10,
      minSpend: 500,
      maxDiscount: 500,
      usageLimit: 5000,
      endsAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year validity
      active: true,
    },
  });

  console.log("✅ Essential production seeding completed successfully!");
  console.log("ℹ️  To create the store owner administrator account, run: npm run admin:create");
}

main()
  .catch((e) => {
    console.error("❌ Essential seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
