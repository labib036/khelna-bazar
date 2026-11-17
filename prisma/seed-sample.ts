import { PrismaClient, ProductStatus } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Sample Catalog Seed Script (For Local Development & Staging ONLY)
 *
 * BLOCKED IN PRODUCTION unless explicitly allowed with ALLOW_SAMPLE_SEED=true.
 */
async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "🛑 [SEED GUARD] Sample catalog seeding is STRICTLY BLOCKED in production mode! Use `npm run db:seed:essential` instead."
    );
  }

  console.log("🌱 Seeding sample local development catalog...");

  // Find or create default category
  const category = await prisma.category.upsert({
    where: { slug: "stem-robotics" },
    update: {},
    create: {
      name: "STEM & Robotics",
      slug: "stem-robotics",
      description: "Sample development category",
    },
  });

  const brand = await prisma.brand.upsert({
    where: { slug: "khelna-bazar-tech" },
    update: {},
    create: {
      name: "Khelna Bazar Tech",
      slug: "khelna-bazar-tech",
    },
  });

  const sampleProducts = [
    {
      name: "Space Explorer Rocket Launch Facility (850 Pcs)",
      slug: "space-explorer-rocket-launch-facility",
      basePrice: 3450,
      comparePrice: 4200,
      shortDesc: "STEM engineering rocket kit with launch pad, gantry elevator, and 4 astronaut figurines.",
      descriptionHtml: "<p>Three-stage rocket building kit with snap-fit boosters and command room consoles.</p>",
      stock: 25,
      sku: "KB-SP-850-STD",
      images: ["https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80"],
    },
    {
      name: "Smart Wooden Montessori Activity Cube",
      slug: "smart-wooden-montessori-activity-cube",
      basePrice: 1850,
      comparePrice: 2200,
      shortDesc: "5-in-1 sensory wooden bead maze, shape sorter, spinning gears, and clock.",
      descriptionHtml: "<p>Smooth non-toxic water-based paint, FSC certified natural beechwood.</p>",
      stock: 18,
      sku: "KB-WOD-CUB-01",
      images: ["https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80"],
    },
    {
      name: "All-Terrain RC High-Speed Monster Truck",
      slug: "all-terrain-rc-high-speed-monster-truck",
      basePrice: 2750,
      comparePrice: 3200,
      shortDesc: "2.4GHz remote control 4WD buggy with shock absorbers and rechargeable battery.",
      descriptionHtml: "<p>Durable anti-collision bumper, speeds up to 25 km/h across grass and gravel.</p>",
      stock: 14,
      sku: "KB-RC-MST-4WD",
      images: ["https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=800&q=80"],
    },
  ];

  for (const item of sampleProducts) {
    const product = await prisma.product.upsert({
      where: { slug: item.slug },
      update: {
        name: item.name,
        basePrice: item.basePrice,
        comparePrice: item.comparePrice,
        shortDesc: item.shortDesc,
        status: ProductStatus.ACTIVE,
      },
      create: {
        name: item.name,
        slug: item.slug,
        basePrice: item.basePrice,
        comparePrice: item.comparePrice,
        shortDesc: item.shortDesc,
        descriptionHtml: item.descriptionHtml,
        status: ProductStatus.ACTIVE,
        brandId: brand.id,
        categories: {
          connect: [{ id: category.id }],
        },
        variants: {
          create: {
            sku: item.sku,
            title: "Standard Edition",
            price: item.basePrice,
            comparePrice: item.comparePrice,
            stock: item.stock,
          },
        },
        images: {
          create: item.images.map((url, i) => ({
            url,
            sortOrder: i,
            isPrimary: i === 0,
          })),
        },
      },
    });

    console.log(`✓ Sample product seeded: ${product.name}`);
  }

  console.log("✅ Sample catalog seeding finished.");
}

main()
  .catch((e) => {
    console.error("❌ Sample seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
