import { PrismaClient, Role, ProductStatus, OrderFulfillmentStatus, CodCollectionStatus, CouponType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting KHELNA BAZAR comprehensive seed process...");

  // 1. CLEANUP (Idempotent seed)
  console.log("🧹 Cleaning up old demo records if any exist...");
  await prisma.auditLog.deleteMany({});
  await prisma.loyaltyTransaction.deleteMany({});
  await prisma.stockMovement.deleteMany({});
  await prisma.returnRequest.deleteMany({});
  await prisma.orderEvent.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.cart.deleteMany({});
  await prisma.wishlistItem.deleteMany({});
  await prisma.wishlist.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.question.deleteMany({});
  await prisma.flashDeal.deleteMany({});
  await prisma.productAttribute.deleteMany({});
  await prisma.productImage.deleteMany({});
  await prisma.productVariant.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.brand.deleteMany({});
  await prisma.coupon.deleteMany({});
  await prisma.banner.deleteMany({});
  await prisma.announcement.deleteMany({});
  await prisma.page.deleteMany({});
  await prisma.setting.deleteMany({});
  await prisma.address.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. DEMO USERS
  console.log("👤 Creating seed users (Admin, Staff, Customer)...");
  const adminPasswordHash = await bcrypt.hash("Admin@Khelna123", 10);
  const staffPasswordHash = await bcrypt.hash("Staff@Khelna123", 10);
  const customerPasswordHash = await bcrypt.hash("Customer@Khelna123", 10);

  const admin = await prisma.user.create({
    data: {
      email: "admin@khelnabazar.com",
      name: "Khelna Bazar Owner",
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      phone: "+880 1711-000001",
      loyaltyPoints: 5000,
      tier: "GOLD",
      marketingConsent: true,
      emailVerified: new Date(),
    },
  });

  const staff = await prisma.user.create({
    data: {
      email: "staff@khelnabazar.com",
      name: "Operations Manager",
      passwordHash: staffPasswordHash,
      role: Role.STAFF,
      phone: "+880 1711-000002",
      loyaltyPoints: 500,
      tier: "SILVER",
      marketingConsent: true,
      emailVerified: new Date(),
    },
  });

  const customer = await prisma.user.create({
    data: {
      email: "customer@khelnabazar.com",
      name: "Tanzim Ahmed",
      passwordHash: customerPasswordHash,
      role: Role.CUSTOMER,
      phone: "+880 1819-123456",
      loyaltyPoints: 350,
      tier: "BRONZE",
      marketingConsent: true,
      emailVerified: new Date(),
      addresses: {
        create: [
          {
            label: "Home",
            fullName: "Tanzim Ahmed",
            phone: "+880 1819-123456",
            line1: "House 24, Road 4, Sector 3",
            line2: "Apartment 5B",
            city: "Uttara",
            state: "Dhaka",
            postalCode: "1230",
            country: "Bangladesh",
            isDefaultShipping: true,
            isDefaultBilling: true,
          },
          {
            label: "Office",
            fullName: "Tanzim Ahmed",
            phone: "+880 1819-123456",
            line1: "Level 8, Concord Tower, Gulshan 1",
            city: "Gulshan",
            state: "Dhaka",
            postalCode: "1212",
            country: "Bangladesh",
            isDefaultShipping: false,
            isDefaultBilling: false,
          },
        ],
      },
    },
  });

  // 3. BRANDS
  console.log("🏷️ Creating 12 toy brands...");
  const brandData = [
    { name: "BrickCrafters", slug: "brickcrafters", description: "Creative interlocking building blocks and architectural models for young builders." },
    { name: "RoboKidz", slug: "robokidz", description: "STEM, robotics, and interactive programmable electronics for inquisitive minds." },
    { name: "LittleDreamer", slug: "littledreamer", description: "Heirloom-quality wooden dollhouses, fashion dolls, and cozy pretend play." },
    { name: "WonderPlay", slug: "wonderplay", description: "Montessori-inspired sensory learning toys and developmental tools for toddlers." },
    { name: "EcoWood Toy Co", slug: "ecowood-toy-co", description: "Sustainably harvested non-toxic wooden toys handcrafted with child-safe water paints." },
    { name: "DinoWorld", slug: "dinoworld", description: "Hyper-realistic dinosaur figures, excavation fossil kits, and prehistoric adventures." },
    { name: "SpeedMaster RC", slug: "speedmaster-rc", description: "High-speed drift cars, remote control monster trucks, and beginner drones." },
    { name: "BrainyPuzzles", slug: "brainypuzzles", description: "Intricate jigsaws, 3D mechanical brainteasers, and cognitive challenges." },
    { name: "SoftCuddles", slug: "softcuddles", description: "Ultra-plush hypoallergenic teddy bears and bedtime cuddle companions." },
    { name: "HeroSquad", slug: "herosquad", description: "Action figures, rescue vehicles, superhero gear, and comic-inspired accessories." },
    { name: "CreativeSpark", slug: "creativespark", description: "Non-toxic modelling clay, pottery sets, washable paints, and DIY craft kits." },
    { name: "TinyExplorer", slug: "tinyexplorer", description: "Tricycles, balance bikes, garden water play, and outdoor adventure gear." },
  ];

  const brands: Record<string, string> = {};
  for (const b of brandData) {
    const created = await prisma.brand.create({ data: b });
    brands[b.slug] = created.id;
  }

  // 4. CATEGORIES (With Hierarchy)
  console.log("📂 Creating categories and subcategories...");
  const categoriesList = [
    {
      name: "Building Blocks & Construction",
      slug: "building-blocks",
      description: "Interlocking bricks, magnetic tiles, and architectural construction sets.",
      image: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=600&q=80",
      isFeatured: true,
      children: [
        { name: "Classic Bricks", slug: "classic-bricks" },
        { name: "Magnetic Tiles", slug: "magnetic-tiles" },
        { name: "Architectural Sets", slug: "architectural-sets" },
      ],
    },
    {
      name: "STEM & Science Kits",
      slug: "stem-science",
      description: "Hands-on robotics, chemistry sets, microscopes, and renewable energy experiments.",
      image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
      isFeatured: true,
      children: [
        { name: "Robotics & Coding", slug: "robotics-coding" },
        { name: "Science Experiments", slug: "science-experiments" },
        { name: "Microscopes & Optics", slug: "microscopes-optics" },
      ],
    },
    {
      name: "Action Figures & Playsets",
      slug: "action-figures",
      description: "Superheroes, dinosaurs, galactic warriors, and articulated poseable figures.",
      image: "https://images.unsplash.com/photo-1608889175123-8ee362201f81?auto=format&fit=crop&w=600&q=80",
      isFeatured: true,
      children: [
        { name: "Superheroes", slug: "superheroes" },
        { name: "Dinosaurs", slug: "dinosaurs" },
        { name: "Rescue & Military", slug: "rescue-military" },
      ],
    },
    {
      name: "RC & Remote Control Vehicles",
      slug: "rc-vehicles",
      description: "High-speed off-road buggies, beginner drones, speed boats, and drift cars.",
      image: "https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=600&q=80",
      isFeatured: true,
      children: [
        { name: "RC Monster Trucks", slug: "rc-monster-trucks" },
        { name: "Beginner Drones", slug: "beginner-drones" },
        { name: "Die-Cast Cars", slug: "die-cast-cars" },
      ],
    },
    {
      name: "Baby & Toddler Toys",
      slug: "baby-toddler",
      description: "Non-toxic silicone teethers, soft rattle balls, sensory shape sorters, and musical crawlers.",
      image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=600&q=80",
      isFeatured: true,
      children: [
        { name: "Teethers & Rattles", slug: "teethers-rattles" },
        { name: "Activity Centers", slug: "activity-centers" },
        { name: "Shape Sorters", slug: "shape-sorters" },
      ],
    },
    {
      name: "Plush & Stuffed Animals",
      slug: "plush-toys",
      description: "Super soft teddy bears, giant huggable pillows, and animated talking stuffed companions.",
      image: "https://images.unsplash.com/photo-1559454403-b8fb88521f11?auto=format&fit=crop&w=600&q=80",
      isFeatured: true,
      children: [
        { name: "Classic Teddy Bears", slug: "classic-teddy-bears" },
        { name: "Giant Plushies", slug: "giant-plushies" },
        { name: "Fantasy & Animals", slug: "fantasy-animals" },
      ],
    },
    {
      name: "Board Games & Puzzles",
      slug: "board-games-puzzles",
      description: "Family strategy games, brain-teaser jigsaws, and cooperative party games.",
      image: "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=600&q=80",
      isFeatured: true,
      children: [
        { name: "Family Board Games", slug: "family-board-games" },
        { name: "1000-Piece Jigsaws", slug: "1000-piece-jigsaws" },
        { name: "Wooden 3D Puzzles", slug: "wooden-3d-puzzles" },
      ],
    },
    {
      name: "Arts & Crafts",
      slug: "arts-crafts",
      description: "Pottery wheels, clay sets, washable acrylic paints, origami, and DIY bead making.",
      image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=600&q=80",
      isFeatured: true,
      children: [
        { name: "Painting & Drawing", slug: "painting-drawing" },
        { name: "Dough & Modelling Clay", slug: "dough-clay" },
        { name: "DIY Jewelry & Beads", slug: "diy-jewelry" },
      ],
    },
    {
      name: "Pretend Play & Costumes",
      slug: "pretend-play",
      description: "Wooden play kitchens, doctor sets, workbenches, and dress-up costumes.",
      image: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=600&q=80",
      isFeatured: false,
      children: [
        { name: "Play Kitchens & Food", slug: "play-kitchens" },
        { name: "Toolsets & Workbenches", slug: "toolsets" },
        { name: "Doctor & Vet Kits", slug: "doctor-vet-kits" },
      ],
    },
    {
      name: "Outdoor & Sports",
      slug: "outdoor-sports",
      description: "Balance bikes, kick scooters, archery sets, soccer nets, and garden water sprinklers.",
      image: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=600&q=80",
      isFeatured: false,
      children: [
        { name: "Balance Bikes & Scooters", slug: "bikes-scooters" },
        { name: "Active Sports Games", slug: "active-sports" },
      ],
    },
    {
      name: "Dolls & Dollhouses",
      slug: "dolls-dollhouses",
      description: "Multilevel wooden dollhouses, modern fashion dolls, and styling accessory kits.",
      image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80",
      isFeatured: false,
      children: [
        { name: "Wooden Dollhouses", slug: "wooden-dollhouses" },
        { name: "Fashion Dolls", slug: "fashion-dolls" },
      ],
    },
    {
      name: "Musical & Sound Toys",
      slug: "musical-toys",
      description: "Kids electronic pianos, wooden xylophones, drum sets, and karaoke microphones.",
      image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80",
      isFeatured: false,
      children: [
        { name: "Xylophones & Percussion", slug: "xylophones" },
        { name: "Kids Keyboards", slug: "keyboards" },
      ],
    },
  ];

  const catMap: Record<string, string> = {};
  for (const c of categoriesList) {
    const parent = await prisma.category.create({
      data: {
        name: c.name,
        slug: c.slug,
        description: c.description,
        image: c.image,
        isFeatured: c.isFeatured,
      },
    });
    catMap[c.slug] = parent.id;

    if (c.children) {
      for (const ch of c.children) {
        const child = await prisma.category.create({
          data: {
            name: ch.name,
            slug: ch.slug,
            parentId: parent.id,
            description: `${ch.name} subcategory under ${c.name}.`,
          },
        });
        catMap[ch.slug] = child.id;
      }
    }
  }

  // 5. 60+ REALISTIC PRODUCTS
  console.log("🧸 Seeding 65 realistic toy products with variants, images, and safety certifications...");

  const rawProducts = [
    // --- 1. Building Blocks & Construction ---
    {
      name: "Space Explorer Rocket Launch Facility (850 Pcs)",
      slug: "space-explorer-rocket-launch-facility",
      brandSlug: "brickcrafters",
      catSlug: "building-blocks",
      basePrice: 3450,
      comparePrice: 4200,
      shortDesc: "Giant multi-stage space rocket with mission control tower, lunar rover, and astronaut mini-figures.",
      desc: "<p>Spark interstellar dreams! This 850-piece engineering set includes a towering three-stage rocket, working gantry elevator, lunar excavation rover, and 4 astronaut figurines with space gear.</p><ul><li>Detailed booster rockets with snap-fit stages</li><li>Command launch room with computer consoles</li><li>Step-by-step full color instruction book</li></ul>",
      minAge: 72, maxAge: 168, material: "High-grade ABS Plastic (BPA Free)",
      battery: "None required", choking: true, rating: 4.9, ratingCount: 42, sold: 138, isFeatured: true, isDeal: false,
      variants: [
        { sku: "BC-SP-850-STD", title: "Standard Launch Pad", price: 3450, comparePrice: 4200, stock: 24 },
        { sku: "BC-SP-850-DX", title: "Deluxe LED Light Edition", price: 4150, comparePrice: 4900, stock: 12 },
      ],
      images: [
        "https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1611604548018-d56bbd85d681?auto=format&fit=crop&w=800&q=80",
      ],
      attrs: [{ name: "Skill", value: "Spatial Reasoning" }, { name: "Theme", value: "Space & Galaxy" }],
    },
    {
      name: "Magnetic Castle Architect Tiles (102 Pcs)",
      slug: "magnetic-castle-architect-tiles-102",
      brandSlug: "brickcrafters",
      catSlug: "building-blocks",
      basePrice: 2850,
      comparePrice: 3500,
      shortDesc: "Vibrant translucent 3D magnetic building tiles that click together effortlessly from any angle.",
      desc: "<p>Unleash limitless structural imagination! Strong neodymium encapsulated magnets ensure towers and castles stay upright. High-transparency rainbow colors glow beautifully near windows.</p>",
      minAge: 36, maxAge: 120, material: "Reinforced ABS Plastic & Ceramic Magnets",
      battery: "None required", choking: false, rating: 4.8, ratingCount: 89, sold: 310, isFeatured: true, isDeal: true,
      variants: [
        { sku: "BC-MAG-102-RBW", title: "102-Piece Rainbow Set", price: 2850, comparePrice: 3500, stock: 45 },
        { sku: "BC-MAG-150-GLO", title: "150-Piece Glow-In-The-Dark", price: 3950, comparePrice: 4800, stock: 18 },
      ],
      images: [
        "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=800&q=80",
      ],
      attrs: [{ name: "Skill", value: "STEM / Geometry" }, { name: "Award", value: "Parent Choice Gold 2025" }],
    },
    {
      name: "Medieval Fortress Siege Dragon Citadel",
      slug: "medieval-fortress-siege-dragon-citadel",
      brandSlug: "brickcrafters",
      catSlug: "building-blocks",
      basePrice: 4800,
      comparePrice: 5600,
      shortDesc: "Epic 1200-piece medieval castle with working drawbridge, catapult, knights, and poseable dragon.",
      desc: "<p>Defend the realm! Featuring stone texture walls, a secret dungeon escape door, a wind-up drawbridge, and an articulated fire dragon with flapping wings.</p>",
      minAge: 96, maxAge: 192, material: "Non-Toxic ABS",
      battery: "None required", choking: true, rating: 5.0, ratingCount: 31, sold: 76, isFeatured: false, isDeal: false,
      variants: [{ sku: "BC-MED-1200", title: "Complete Citadel Set", price: 4800, comparePrice: 5600, stock: 8 }],
      images: [
        "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
      ],
      attrs: [{ name: "Theme", value: "Medieval Fantasy" }],
    },
    {
      name: "City Police High-Speed Pursuit Cruiser",
      slug: "city-police-high-speed-pursuit-cruiser",
      brandSlug: "brickcrafters",
      catSlug: "building-blocks",
      basePrice: 1250,
      comparePrice: 1550,
      shortDesc: "Aerodynamic police interceptor with opening doors, officer mini-figure, and traffic radar.",
      desc: "<p>Fast-action buildable police interceptor vehicle designed for rapid highway patrol adventures.</p>",
      minAge: 60, maxAge: 144, material: "ABS Plastic",
      battery: "None", choking: true, rating: 4.7, ratingCount: 19, sold: 94, isFeatured: false, isDeal: false,
      variants: [{ sku: "BC-POL-320", title: "Standard Cruiser", price: 1250, comparePrice: 1550, stock: 30 }],
      images: [
        "https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=800&q=80",
      ],
      attrs: [{ name: "Category", value: "City Vehicles" }],
    },
    {
      name: "Botanical Garden Greenhouse Architecture Set",
      slug: "botanical-garden-greenhouse-architecture",
      brandSlug: "brickcrafters",
      catSlug: "building-blocks",
      basePrice: 3800,
      comparePrice: 4500,
      shortDesc: "Elegant Victorian glasshouse with exotic potted plants, transparent roof panels, and floral details.",
      desc: "<p>A meditative and gorgeous building experience featuring over 30 botanical elements, vines, coffee tree, and ornate benches.</p>",
      minAge: 120, maxAge: 240, material: "Premium ABS Plastic",
      battery: "None", choking: true, rating: 4.9, ratingCount: 54, sold: 112, isFeatured: true, isDeal: false,
      variants: [{ sku: "BC-BOT-950", title: "Botanical Greenhouse", price: 3800, comparePrice: 4500, stock: 15 }],
      images: [
        "https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=800&q=80",
      ],
      attrs: [{ name: "Theme", value: "Architecture & Nature" }],
    },

    // --- 2. STEM & Science Kits ---
    {
      name: "RoboTrack 12-in-1 Solar & Hydraulic Robot Kit",
      slug: "robotrack-12-in-1-solar-hydraulic-robot",
      brandSlug: "robokidz",
      catSlug: "stem-science",
      basePrice: 2650,
      comparePrice: 3200,
      shortDesc: "Build 12 distinct working robots powered entirely by sunlight and hydraulic water pistons. Zero batteries!",
      desc: "<p>Learn mechanical engineering principles! Kids can assemble crawling bugs, rover crawlers, boat robots, and T-Rex walkers. The dual-drive system operates via solar panel or micro hydraulic pumps.</p>",
      minAge: 96, maxAge: 180, material: "Eco-ABS & Hydraulic Silicone Valves",
      battery: "100% Solar & Water Powered (No Batteries)", choking: true, rating: 4.8, ratingCount: 67, sold: 220, isFeatured: true, isDeal: true,
      variants: [{ sku: "RK-SOL-12", title: "12-in-1 Complete Solar Kit", price: 2650, comparePrice: 3200, stock: 28 }],
      images: [
        "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80",
      ],
      attrs: [{ name: "Skill", value: "Renewable Energy & Physics" }],
    },
    {
      name: "Junior Explorer Optical Microscope with 48 Glass Slides",
      slug: "junior-explorer-optical-microscope-48-slides",
      brandSlug: "robokidz",
      catSlug: "stem-science",
      basePrice: 2950,
      comparePrice: 3600,
      shortDesc: "Professional metal-body monocular microscope with up to 1200x magnification and phone photo mount.",
      desc: "<p>Reveal the hidden microscopic universe! Includes dual LED top and bottom illumination, 48 prepared biological specimens (butterfly wings, onion epidermis, pollen), and blank slides for homemade discoveries.</p>",
      minAge: 84, maxAge: 192, material: "Aluminum Alloy & Optical Glass",
      battery: "2 x AA (Included)", choking: true, rating: 4.9, ratingCount: 48, sold: 165, isFeatured: true, isDeal: false,
      variants: [{ sku: "RK-MIC-1200", title: "Microscope + 48 Specimen Slides", price: 2950, comparePrice: 3600, stock: 19 }],
      images: [
        "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80",
      ],
      attrs: [{ name: "Skill", value: "Biology & Observation" }],
    },
    {
      name: "Crazy Chemical Reactions Laboratory (60 Experiments)",
      slug: "crazy-chemical-reactions-laboratory-60",
      brandSlug: "robokidz",
      catSlug: "stem-science",
      basePrice: 1950,
      comparePrice: 2400,
      shortDesc: "Safe kitchen chemistry kit with bubbling volcanoes, glowing slime, color-changing potions, and test tubes.",
      desc: "<p>Conduct real chemistry with kid-safe chemicals! Includes safety goggles, pipettes, test tube rack, measuring flasks, and a full-color 40-page illustrated science manual.</p>",
      minAge: 96, maxAge: 168, material: "Food-Safe Reagents & Polycarbonate",
      battery: "None required", choking: true, rating: 4.7, ratingCount: 35, sold: 180, isFeatured: false, isDeal: false,
      variants: [{ sku: "RK-CHEM-60", title: "Chemistry Lab Set", price: 1950, comparePrice: 2400, stock: 32 }],
      images: [
        "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80",
      ],
      attrs: [{ name: "Skill", value: "Chemistry & Scientific Method" }],
    },
    {
      name: "Coding Rover Bluetooth Programmable Car",
      slug: "coding-rover-bluetooth-programmable-car",
      brandSlug: "robokidz",
      catSlug: "stem-science",
      basePrice: 3950,
      comparePrice: 4700,
      shortDesc: "Block-based visual coding vehicle that teaches Python and Scratch logic with obstacle radar sensors.",
      desc: "<p>Kids drag-and-drop code blocks on their phone or tablet to navigate obstacle mazes, light up RGB headlights, and play custom 8-bit musical tunes.</p>",
      minAge: 96, maxAge: 192, material: "Reinforced Polycarbonate Chassis",
      battery: "Rechargeable Li-Ion (USB-C cable included)", choking: false, rating: 5.0, ratingCount: 29, sold: 88, isFeatured: true, isDeal: false,
      variants: [{ sku: "RK-CODE-ROV", title: "Smart Coding Rover", price: 3950, comparePrice: 4700, stock: 14 }],
      images: [
        "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80",
      ],
      attrs: [{ name: "Skill", value: "Coding & Algorithms" }],
    },
    {
      name: "Stargazer Refractor Astronomy Telescope (70mm)",
      slug: "stargazer-refractor-astronomy-telescope-70mm",
      brandSlug: "robokidz",
      catSlug: "stem-science",
      basePrice: 4600,
      comparePrice: 5500,
      shortDesc: "High-aperture astronomical telescope for observing lunar craters, Saturn rings, and night sky constellations.",
      desc: "<p>Includes full-height aluminum tripod, Kellner eyepieces (K25mm, K10mm), 3x Barlow lens, smartphone photography adapter, and star chart map.</p>",
      minAge: 108, maxAge: 216, material: "Optical Glass & Aluminum",
      battery: "None", choking: true, rating: 4.8, ratingCount: 22, sold: 52, isFeatured: false, isDeal: false,
      variants: [{ sku: "RK-TEL-70", title: "70mm Astronomy Telescope", price: 4600, comparePrice: 5500, stock: 7 }],
      images: [
        "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80",
      ],
      attrs: [{ name: "Skill", value: "Astronomy" }],
    },

    // --- 3. RC & Remote Control Vehicles ---
    {
      name: "StormCrawler 4WD High-Speed Rock Buggy (1:14 Scale)",
      slug: "stormcrawler-4wd-high-speed-rock-buggy",
      brandSlug: "speedmaster-rc",
      catSlug: "rc-vehicles",
      basePrice: 3250,
      comparePrice: 3900,
      shortDesc: "All-terrain monster buggy with independent metal spring suspension, dual high-torque motors, and splash-proof shell.",
      desc: "<p>Conquer sand, mud, gravel, and asphalt! Reaches exhilarating speeds up to 25 km/h. 2.4 GHz anti-interference transmitter allows up to 10 cars to race together with a 60-meter control distance.</p>",
      minAge: 84, maxAge: 192, material: "Nylon Alloy & High-Grip Rubber Tires",
      battery: "2 x 7.4V Rechargeable Packs (Includes USB Charger)", choking: true, rating: 4.9, ratingCount: 112, sold: 410, isFeatured: true, isDeal: true,
      variants: [
        { sku: "SM-BUGGY-RED", title: "Fiery Red (1:14 Scale)", price: 3250, comparePrice: 3900, stock: 26 },
        { sku: "SM-BUGGY-BLU", title: "Electric Blue (1:14 Scale)", price: 3250, comparePrice: 3900, stock: 22 },
        { sku: "SM-BUGGY-GRN", title: "Neon Green (1:14 Scale)", price: 3250, comparePrice: 3900, stock: 15 },
      ],
      images: [
        "https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=800&q=80",
      ],
      attrs: [{ name: "Max Speed", value: "25 km/h" }, { name: "Drive System", value: "4-Wheel Drive (4WD)" }],
    },
    {
      name: "AeroFlyer Mini HD Camera Drone with Altitude Hold",
      slug: "aeroflyer-mini-hd-camera-drone",
      brandSlug: "speedmaster-rc",
      catSlug: "rc-vehicles",
      basePrice: 3850,
      comparePrice: 4600,
      shortDesc: "Beginner-friendly indoor/outdoor quadcopter with 1080p live WiFi FPV video stream and one-key takeoff.",
      desc: "<p>Flying made simple! Features auto-hover altitude hold, 360-degree stunt barrel flips, optical flow stabilization, and enclosed propeller guards for ultimate safety.</p>",
      minAge: 120, maxAge: 216, material: "Flexible Carbon-Impact ABS",
      battery: "2 Modular Lithium Batteries (20 min total flight)", choking: true, rating: 4.8, ratingCount: 58, sold: 195, isFeatured: true, isDeal: false,
      variants: [
        { sku: "SM-DRONE-STD", title: "Single Battery Pack", price: 3850, comparePrice: 4600, stock: 18 },
        { sku: "SM-DRONE-DX", title: "Dual Battery Flight Bundle", price: 4450, comparePrice: 5200, stock: 12 },
      ],
      images: [
        "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80",
      ],
      attrs: [{ name: "Camera", value: "1080p HD Wide Angle" }, { name: "Features", value: "Altitude Hold & 360 Flips" }],
    },
    {
      name: "AquaSpeeder Twin-Propeller Racing Speedboat",
      slug: "aquaspeeder-twin-propeller-racing-speedboat",
      brandSlug: "speedmaster-rc",
      catSlug: "rc-vehicles",
      basePrice: 2450,
      comparePrice: 2950,
      shortDesc: "Waterproof fast racing boat with capsize auto-recovery and water cooling motor system.",
      desc: "<p>Perfect for swimming pools, lakes, and ponds. Automatically resets upright if flipped by a wave, with safe water-sensor ignition (motors only spin when in water).</p>",
      minAge: 96, maxAge: 192, material: "Waterproof Sealed ABS",
      battery: "Rechargeable Pack (Included)", choking: true, rating: 4.7, ratingCount: 33, sold: 104, isFeatured: false, isDeal: false,
      variants: [{ sku: "SM-BOAT-RED", title: "Crimson Speedboat", price: 2450, comparePrice: 2950, stock: 16 }],
      images: [
        "https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=800&q=80",
      ],
      attrs: [{ name: "Environment", value: "Freshwater & Pools" }],
    },
    {
      name: "Heavy-Duty Construction RC Excavator with Metal Bucket",
      slug: "heavy-duty-construction-rc-excavator",
      brandSlug: "speedmaster-rc",
      catSlug: "rc-vehicles",
      basePrice: 3600,
      comparePrice: 4300,
      shortDesc: "Realistic 11-channel functional digging tractor with working alloy scoop, 680° cab rotation, and diesel sound effects.",
      desc: "<p>Real earth-moving action! Genuine alloy metal shovel easily scoops up sand, soil, and gravel, driven by realistic continuous rubber tracks.</p>",
      minAge: 72, maxAge: 168, material: "Alloy Die-Cast & Heavy ABS",
      battery: "Rechargeable Pack + 2 x AA for Remote", choking: true, rating: 4.9, ratingCount: 45, sold: 130, isFeatured: false, isDeal: true,
      variants: [{ sku: "SM-EXCAV-11", title: "Metal Bucket Excavator", price: 3600, comparePrice: 4300, stock: 14 }],
      images: [
        "https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=800&q=80",
      ],
      attrs: [{ name: "Channels", value: "11-Channel Transmitter" }],
    },
    {
      name: "DriftKing Formula 1 High-Grip RC Racer",
      slug: "driftking-formula-1-high-grip-rc-racer",
      brandSlug: "speedmaster-rc",
      catSlug: "rc-vehicles",
      basePrice: 2150,
      comparePrice: 2600,
      shortDesc: "Sleek aerodynamic race car with underglow neon LEDs and interchangeable rubber drift racing slicks.",
      desc: "<p>Perform precision U-shape drifts and 360 donut spins on smooth floors. Comes with 4 speed tires and 4 special slick drift rings.</p>",
      minAge: 72, maxAge: 156, material: "Flexible PVC Shell",
      battery: "Rechargeable Battery Included", choking: true, rating: 4.6, ratingCount: 28, sold: 140, isFeatured: false, isDeal: false,
      variants: [{ sku: "SM-DRIFT-F1", title: "F1 Grand Prix Drift Car", price: 2150, comparePrice: 2600, stock: 25 }],
      images: [
        "https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=800&q=80",
      ],
      attrs: [{ name: "Feature", value: "Interchangeable Drift Slicks" }],
    },

    // --- 4. Action Figures & Playsets ---
    {
      name: "Titan Rex Roaring Jurassic Dinosaur with Light-Up Eyes",
      slug: "titan-rex-roaring-jurassic-dinosaur",
      brandSlug: "dinoworld",
      catSlug: "action-figures",
      basePrice: 2250,
      comparePrice: 2800,
      shortDesc: "Over 45 cm long motorized walking Tyrannosaurus Rex with realistic skin texture and thunderous sound effects.",
      desc: "<p>Brings the prehistoric era to life! Press the spinal horn to unleash a thunderous roar, glowing amber eyes, and motorized stomping walk.</p>",
      minAge: 36, maxAge: 120, material: "Non-Toxic Soft Touch Vinyl & ABS",
      battery: "3 x AA (Included)", choking: false, rating: 4.8, ratingCount: 78, sold: 290, isFeatured: true, isDeal: false,
      variants: [
        { sku: "DW-TREX-BRN", title: "Forest Brown T-Rex", price: 2250, comparePrice: 2800, stock: 35 },
        { sku: "DW-TREX-GRN", title: "Jungle Green T-Rex", price: 2250, comparePrice: 2800, stock: 28 },
      ],
      images: [
        "https://images.unsplash.com/photo-1608889175123-8ee362201f81?auto=format&fit=crop&w=800&q=80",
      ],
      attrs: [{ name: "Length", value: "45 cm" }, { name: "Features", value: "Roaring Sound & Motorized Walk" }],
    },
    {
      name: "Galactic Defenders Mech Warrior CyberSuit",
      slug: "galactic-defenders-mech-warrior-cybersuit",
      brandSlug: "herosquad",
      catSlug: "action-figures",
      basePrice: 1850,
      comparePrice: 2300,
      shortDesc: "30 cm articulated robot titan with launchable missile cannon and removable battle pilot.",
      desc: "<p>Features 18 points of articulation, dual shoulder-mounted rocket launchers with spring missiles, and cockpit that opens to place the hero pilot inside.</p>",
      minAge: 60, maxAge: 144, material: "Durable ABS & Soft PVC",
      battery: "None required", choking: true, rating: 4.7, ratingCount: 41, sold: 155, isFeatured: false, isDeal: false,
      variants: [{ sku: "HS-MECH-TITAN", title: "Titan Mech Blue & Silver", price: 1850, comparePrice: 2300, stock: 22 }],
      images: [
        "https://images.unsplash.com/photo-1608889175123-8ee362201f81?auto=format&fit=crop&w=800&q=80",
      ],
      attrs: [{ name: "Articulation", value: "18 Movable Joints" }],
    },
    {
      name: "Dino Excavation Fossil Discovery Science Kit (3 Real Fossils)",
      slug: "dino-excavation-fossil-discovery-science-kit",
      brandSlug: "dinoworld",
      catSlug: "action-figures",
      basePrice: 1150,
      comparePrice: 1450,
      shortDesc: "Chisel through the plaster excavation block to uncover genuine prehistoric shark tooth and dinosaur bone replicas.",
      desc: "<p>Includes wooden mallet, chisels, dusting brush, magnifying glass, and full-color paleontologist identification guide.</p>",
      minAge: 72, maxAge: 144, material: "Eco Gypsum & Real Fossils",
      battery: "None", choking: true, rating: 4.9, ratingCount: 52, sold: 210, isFeatured: false, isDeal: false,
      variants: [{ sku: "DW-FOSSIL-KIT", title: "Standard Dig Block", price: 1150, comparePrice: 1450, stock: 40 }],
      images: [
        "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
      ],
      attrs: [{ name: "Skill", value: "Archaeology & Patience" }],
    },
    {
      name: "HeroSquad Rescue Fire Station Playset with Siren",
      slug: "herosquad-rescue-fire-station-playset",
      brandSlug: "herosquad",
      catSlug: "action-figures",
      basePrice: 3100,
      comparePrice: 3800,
      shortDesc: "3-level emergency dispatch firehouse with pole, working alarm bell, water pump truck, and 3 firefighter figures.",
      desc: "<p>Realistic rescue adventures! Slide firefighters down the pole, open the roll-up garage doors, and rush the fire truck with extendable ladder to save the day.</p>",
      minAge: 36, maxAge: 108, material: "Sturdy Composite Wood & Non-Toxic Plastic",
      battery: "2 x AAA for Siren (Included)", choking: false, rating: 4.8, ratingCount: 38, sold: 90, isFeatured: false, isDeal: false,
      variants: [{ sku: "HS-FIRE-3LVL", title: "Fire Station Headquarters", price: 3100, comparePrice: 3800, stock: 11 }],
      images: [
        "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=800&q=80",
      ],
      attrs: [{ name: "Levels", value: "3 Story Headquarters" }],
    },

    // --- 5. Plush & Stuffed Animals ---
    {
      name: "Barnaby the Giant Huggable Teddy Bear (100 cm)",
      slug: "barnaby-giant-huggable-teddy-bear-100cm",
      brandSlug: "softcuddles",
      catSlug: "plush-toys",
      basePrice: 2450,
      comparePrice: 3100,
      shortDesc: "One meter of ultra-plush, cloud-soft velvet cuddles with embroidered safety eyes and velvet neck ribbon.",
      desc: "<p>The ultimate comfort companion for nap time and story time. Crafted from allergen-tested silky polyester fibers with high-resilience memory polyfill that never flattens.</p>",
      minAge: 0, maxAge: 999, material: "Hypoallergenic Cloud-Velvet & Organic Polyfill",
      battery: "None required", choking: false, rating: 5.0, ratingCount: 145, sold: 520, isFeatured: true, isDeal: false,
      variants: [
        { sku: "SC-BEAR-BRN", title: "Honey Caramel Brown (100cm)", price: 2450, comparePrice: 3100, stock: 35 },
        { sku: "SC-BEAR-CRM", title: "Soft Vanilla Cream (100cm)", price: 2450, comparePrice: 3100, stock: 29 },
        { sku: "SC-BEAR-GRY", title: "Smokey Grey (100cm)", price: 2450, comparePrice: 3100, stock: 18 },
      ],
      images: [
        "https://images.unsplash.com/photo-1559454403-b8fb88521f11?auto=format&fit=crop&w=800&q=80",
      ],
      attrs: [{ name: "Height", value: "100 cm (3.3 ft)" }, { name: "Safety", value: "Hypoallergenic & Machine Washable" }],
    },
    {
      name: "Starlight Sleeping Bunny with Soothing Lullabies & Nightlight",
      slug: "starlight-sleeping-bunny-lullabies-nightlight",
      brandSlug: "softcuddles",
      catSlug: "plush-toys",
      basePrice: 1850,
      comparePrice: 2250,
      shortDesc: "Bedtime plush bunny with warm glowing tummy nightlight, heartbeat rhythm, and 8 calming bedtime melodies.",
      desc: "<p>Helps infants and toddlers drift peacefully into dreamland. Sound sensor automatically activates gentle white noise or heartbeat if baby stirs at night.</p>",
      minAge: 0, maxAge: 60, material: "Organic Cotton Velour",
      battery: "3 x AAA (Included)", choking: false, rating: 4.9, ratingCount: 88, sold: 340, isFeatured: true, isDeal: true,
      variants: [
        { sku: "SC-BUN-PNK", title: "Blush Pink Bunny", price: 1850, comparePrice: 2250, stock: 25 },
        { sku: "SC-BUN-BLU", title: "Powder Blue Bunny", price: 1850, comparePrice: 2250, stock: 20 },
      ],
      images: [
        "https://images.unsplash.com/photo-1559454403-b8fb88521f11?auto=format&fit=crop&w=800&q=80",
      ],
      attrs: [{ name: "Feature", value: "Smart Cry Sensor & Auto Shutoff" }],
    },
    {
      name: "Sparkle the Enchanted Rainbow Pegasus Plush (40 cm)",
      slug: "sparkle-enchanted-rainbow-pegasus-plush",
      brandSlug: "softcuddles",
      catSlug: "plush-toys",
      basePrice: 1450,
      comparePrice: 1800,
      shortDesc: "Magical winged unicorn with pastel rainbow mane, glittery golden horn, and poseable velvet wings.",
      desc: "<p>Soft, whimsical, and beautifully made with shimmery holographic fabrics and ultra-fine plush fur.</p>",
      minAge: 24, maxAge: 144, material: "Shimmer Velvet & Microfiber",
      battery: "None", choking: false, rating: 4.8, ratingCount: 39, sold: 160, isFeatured: false, isDeal: false,
      variants: [{ sku: "SC-PEGASUS", title: "Rainbow Pegasus (40cm)", price: 1450, comparePrice: 1800, stock: 22 }],
      images: [
        "https://images.unsplash.com/photo-1559454403-b8fb88521f11?auto=format&fit=crop&w=800&q=80",
      ],
      attrs: [{ name: "Theme", value: "Magical Fantasy" }],
    },

    // --- 6. Baby & Toddler Toys ---
    {
      name: "Montessori Wooden 8-in-1 Sensory Activity Cube",
      slug: "montessori-wooden-8-in-1-sensory-activity-cube",
      brandSlug: "ecowood-toy-co",
      catSlug: "baby-toddler",
      basePrice: 2750,
      comparePrice: 3400,
      shortDesc: "Premium solid beechwood play cube with bead maze, rotating gears, clock, shape sorter, and xylophone.",
      desc: "<p>Designed following authentic Montessori sensory development guidelines. Smooth hand-sanded edges with zero splinters, painted using water-based non-toxic food-grade dye.</p>",
      minAge: 12, maxAge: 48, material: "FSC-Certified Solid Beech & Stainless Steel",
      battery: "None required", choking: false, rating: 4.9, ratingCount: 92, sold: 285, isFeatured: true, isDeal: false,
      variants: [{ sku: "EW-CUBE-8IN1", title: "Natural Beech Activity Cube", price: 2750, comparePrice: 3400, stock: 20 }],
      images: [
        "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80",
      ],
      attrs: [{ name: "Methodology", value: "Montessori Sensory" }, { name: "Wood", value: "100% Solid Beech" }],
    },
    {
      name: "Baby Beats Musical Dancing Crawl Penguin",
      slug: "baby-beats-musical-dancing-crawl-penguin",
      brandSlug: "wonderplay",
      catSlug: "baby-toddler",
      basePrice: 1650,
      comparePrice: 2100,
      shortDesc: "Encourages tummy time and crawling! Wiggles wings, blinks eyes, plays joyful melodies, and avoids obstacles.",
      desc: "<p>Smart collision sensors keep the penguin cruising safely around living room furniture, inspiring little ones to crawl and chase.</p>",
      minAge: 6, maxAge: 24, material: "Shatter-Resistant BPA-Free Polypropylene",
      battery: "3 x AA (Included)", choking: false, rating: 4.8, ratingCount: 74, sold: 310, isFeatured: true, isDeal: true,
      variants: [{ sku: "WP-PENG-DANC", title: "Dancing Penguin", price: 1650, comparePrice: 2100, stock: 32 }],
      images: [
        "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80",
      ],
      attrs: [{ name: "Development", value: "Gross Motor & Crawling" }],
    },
    {
      name: "Silicone Rainbow Stacking Arches & Teether (12 Pcs)",
      slug: "silicone-rainbow-stacking-arches-teether-12",
      brandSlug: "wonderplay",
      catSlug: "baby-toddler",
      basePrice: 1250,
      comparePrice: 1600,
      shortDesc: "100% food-grade platinum silicone stacking arches that soothe teething gums and teach spatial nesting.",
      desc: "<p>Boilable, dishwasher safe, and unbreakable. Gentle pastel colors provide calming sensory feedback for babies and toddlers.</p>",
      minAge: 6, maxAge: 48, material: "Platinum Food-Grade Silicone (BPA/PVC Free)",
      battery: "None", choking: false, rating: 4.9, ratingCount: 110, sold: 450, isFeatured: false, isDeal: false,
      variants: [
        { sku: "WP-RAIN-PASTEL", title: "Nordic Pastel Colors", price: 1250, comparePrice: 1600, stock: 45 },
        { sku: "WP-RAIN-EARTH", title: "Earth Tones Collection", price: 1250, comparePrice: 1600, stock: 30 },
      ],
      images: [
        "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80",
      ],
      attrs: [{ name: "Safety", value: "Boilable / Teething Safe" }],
    },

    // --- 7. Board Games & Puzzles ---
    {
      name: "Kingdoms of Bengal: Tactical Family Board Game",
      slug: "kingdoms-of-bengal-tactical-family-board-game",
      brandSlug: "brainypuzzles",
      catSlug: "board-games-puzzles",
      basePrice: 1850,
      comparePrice: 2300,
      shortDesc: "Award-winning route-building strategy board game exploring historic trade rivers, bazaars, and palaces.",
      desc: "<p>Gather tea, silk, and spices to construct trade routes across ancient delta ports. Easy to learn in 10 minutes, with deep strategic replayability for 2 to 5 players.</p>",
      minAge: 96, maxAge: 999, material: "Linen-Finish Cardboard & Wooden Carved Boats",
      battery: "None", choking: true, rating: 4.9, ratingCount: 65, sold: 240, isFeatured: true, isDeal: false,
      variants: [{ sku: "BP-KOB-BASE", title: "Complete Board Game Set", price: 1850, comparePrice: 2300, stock: 26 }],
      images: [
        "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=800&q=80",
      ],
      attrs: [{ name: "Players", value: "2 to 5 Players" }, { name: "Play Time", value: "30-45 Minutes" }],
    },
    {
      name: "3D Mechanical Wooden Locomotive with Working Clockwork Spring",
      slug: "3d-mechanical-wooden-locomotive-clockwork",
      brandSlug: "brainypuzzles",
      catSlug: "board-games-puzzles",
      basePrice: 2850,
      comparePrice: 3500,
      shortDesc: "Laser-cut plywood model train that actually rolls up to 5 meters using internal mechanical winding gears.",
      desc: "<p>No glue or screws required! 350 precision laser-cut plywood pieces fit together tightly to create an authentic 19th-century steam train with moving pistons.</p>",
      minAge: 144, maxAge: 999, material: "Natural Baltic Birch Plywood",
      battery: "Spring Wind-Up Mechanism (No Electricity)", choking: true, rating: 5.0, ratingCount: 44, sold: 110, isFeatured: true, isDeal: false,
      variants: [{ sku: "BP-LOCO-3D", title: "Mechanical Steam Train Kit", price: 2850, comparePrice: 3500, stock: 15 }],
      images: [
        "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
      ],
      attrs: [{ name: "Assembly Time", value: "4 to 6 Hours" }],
    },
    {
      name: "Wild Wonders of Earth 1000-Piece Jigsaw Puzzle",
      slug: "wild-wonders-of-earth-1000-piece-jigsaw",
      brandSlug: "brainypuzzles",
      catSlug: "board-games-puzzles",
      basePrice: 1250,
      comparePrice: 1550,
      shortDesc: "Stunning hand-illustrated world wildlife map featuring 150 endangered species with zero glare matte finish.",
      desc: "<p>Thick 2mm recycled board with perfect precision snap interlocking pieces. Includes full-size reference poster and wildlife guidebook.</p>",
      minAge: 120, maxAge: 999, material: "Recycled Blue-Core Cardboard",
      battery: "None", choking: true, rating: 4.8, ratingCount: 38, sold: 135, isFeatured: false, isDeal: false,
      variants: [{ sku: "BP-MAP-1000", title: "1000-Piece Puzzle + Poster", price: 1250, comparePrice: 1550, stock: 28 }],
      images: [
        "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=800&q=80",
      ],
      attrs: [{ name: "Pieces", value: "1000 Precision Cut" }],
    },

    // --- 8. Arts & Crafts ---
    {
      name: "ClayCrafter Electric Pottery Wheel Studio with Sculpting Tools",
      slug: "claycrafter-electric-pottery-wheel-studio",
      brandSlug: "creativespark",
      catSlug: "arts-crafts",
      basePrice: 2950,
      comparePrice: 3600,
      shortDesc: "Real variable-speed pottery wheel with foot pedal, 1.2 kg air-dry natural terracotta clay, and 12 acrylic paints.",
      desc: "<p>Everything young artisans need to sculpt vases, mugs, pots, and figurines! Features dual speed rotation, splash basin, cutting cord, and carving knives.</p>",
      minAge: 96, maxAge: 192, material: "ABS Turntable & Non-Toxic Terracotta Clay",
      battery: "USB-C Powered or 4 x D Cell Batteries", choking: true, rating: 4.8, ratingCount: 52, sold: 175, isFeatured: true, isDeal: true,
      variants: [
        { sku: "CS-POT-STD", title: "Complete Studio + 1.2kg Clay", price: 2950, comparePrice: 3600, stock: 18 },
        { sku: "CS-POT-REFILL", title: "Clay & Paint Refill Pack", price: 950, comparePrice: 1200, stock: 40 },
      ],
      images: [
        "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80",
      ],
      attrs: [{ name: "Clay Type", value: "Air-Dry (No Kiln Needed)" }],
    },
    {
      name: "Rainbow Magic Non-Toxic Modeling Dough Mega Tub (36 Colors)",
      slug: "rainbow-magic-modeling-dough-mega-tub-36",
      brandSlug: "creativespark",
      catSlug: "arts-crafts",
      basePrice: 1350,
      comparePrice: 1700,
      shortDesc: "Soft, scented, wheat-flour dough in 36 vibrant colors with animal cutters, roller pins, and storage box.",
      desc: "<p>Ultra-smooth dough that does not crumble or stain hands. Safe, natural food-grade ingredients scented with natural berry and vanilla extracts.</p>",
      minAge: 36, maxAge: 120, material: "Natural Wheat Flour & Food Coloring",
      battery: "None", choking: false, rating: 4.9, ratingCount: 86, sold: 390, isFeatured: true, isDeal: false,
      variants: [{ sku: "CS-DOUGH-36", title: "36 Colors + 20 Tools", price: 1350, comparePrice: 1700, stock: 50 }],
      images: [
        "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80",
      ],
      attrs: [{ name: "Colors", value: "36 Unique Shades" }],
    },
    {
      name: "Deluxe Wooden Artist Table Easel & Painting Case (120 Pcs)",
      slug: "deluxe-wooden-artist-table-easel-case",
      brandSlug: "creativespark",
      catSlug: "arts-crafts",
      basePrice: 3200,
      comparePrice: 3900,
      shortDesc: "Folding beechwood tabletop easel carrying case with acrylic paints, watercolors, oil pastels, and sketching pencils.",
      desc: "<p>Portable studio in a briefcase! Includes 24 acrylic tubes, 24 watercolor pans, 36 oil pastels, 24 colored pencils, brushes, palette, and canvas boards.</p>",
      minAge: 72, maxAge: 999, material: "Solid Beechwood & Artist-Grade Pigments",
      battery: "None", choking: true, rating: 5.0, ratingCount: 42, sold: 120, isFeatured: false, isDeal: false,
      variants: [{ sku: "CS-ART-EASEL", title: "Tabletop Easel Box Set", price: 3200, comparePrice: 3900, stock: 16 }],
      images: [
        "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80",
      ],
      attrs: [{ name: "Pieces", value: "120 Fine Art Supplies" }],
    },

    // --- 9. Pretend Play & Costumes ---
    {
      name: "Grand Chef Deluxe Wooden Play Kitchen with Sound & Light",
      slug: "grand-chef-deluxe-wooden-play-kitchen",
      brandSlug: "littledreamer",
      catSlug: "pretend-play",
      basePrice: 6500,
      comparePrice: 7800,
      shortDesc: "Stunning heirloom wooden kitchen with sizzling stove burners, ice dispenser, oven, microwave, and 15 metal pots.",
      desc: "<p>Turn pretend cooking into culinary joy! Press the stove buttons to activate realistic bubbling and boiling sounds with red LED heat simulation. Handcrafted from durable birch wood.</p>",
      minAge: 36, maxAge: 108, material: "Engineered Solid Wood & Stainless Steel Pots",
      battery: "2 x AA for Sound Burners (Included)", choking: false, rating: 5.0, ratingCount: 38, sold: 65, isFeatured: true, isDeal: false,
      variants: [
        { sku: "LD-KITCHEN-WHT", title: "Nordic White & Gold", price: 6500, comparePrice: 7800, stock: 6 },
        { sku: "LD-KITCHEN-GRN", title: "Sage Green & Brass", price: 6500, comparePrice: 7800, stock: 5 },
      ],
      images: [
        "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=800&q=80",
      ],
      attrs: [{ name: "Dimensions", value: "85 x 30 x 90 cm" }, { name: "Includes", value: "15 Stainless Steel Cooking Utensils" }],
    },
    {
      name: "Little Doctor & Veterinarian Mobile Clinic Trolley (28 Pcs)",
      slug: "little-doctor-veterinarian-mobile-clinic-trolley",
      brandSlug: "littledreamer",
      catSlug: "pretend-play",
      basePrice: 2150,
      comparePrice: 2650,
      shortDesc: "Rolling medical cart with working heartbeat stethoscope, ECG monitor, dental tools, and plush puppy patient.",
      desc: "<p>Helps children overcome doctor fears through empathetic roleplay. Features light-up thermometer, otoscope, pulse oximeter, and bandages.</p>",
      minAge: 36, maxAge: 96, material: "Smooth Rounded ABS Plastic",
      battery: "Button Cells Included for Stethoscope & Light Tools", choking: false, rating: 4.8, ratingCount: 57, sold: 180, isFeatured: false, isDeal: false,
      variants: [{ sku: "LD-MED-CART", title: "28-Piece Medical Cart", price: 2150, comparePrice: 2650, stock: 24 }],
      images: [
        "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=800&q=80",
      ],
      attrs: [{ name: "Roleplay", value: "Doctor & Veterinarian" }],
    },

    // --- 10. Dolls & Dollhouses ---
    {
      name: "Villa Royale 3-Story Wooden Dollhouse with Furniture (18 Pcs)",
      slug: "villa-royale-3-story-wooden-dollhouse",
      brandSlug: "littledreamer",
      catSlug: "dolls-dollhouses",
      basePrice: 5800,
      comparePrice: 6900,
      shortDesc: "Over 90 cm tall Victorian wooden dollhouse with working elevator, balcony, attic bedroom, and solid wood furniture.",
      desc: "<p>A dream home for 30 cm fashion dolls! Detailed wall paper in each room, velvet bedding, porcelain-look bathtub, and kitchen cabinets.</p>",
      minAge: 48, maxAge: 144, material: "Solid Wood & MDF",
      battery: "None required", choking: true, rating: 4.9, ratingCount: 46, sold: 82, isFeatured: true, isDeal: false,
      variants: [{ sku: "LD-HOUSE-ROYAL", title: "3-Story Villa + 18 Furniture Sets", price: 5800, comparePrice: 6900, stock: 9 }],
      images: [
        "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80",
      ],
      attrs: [{ name: "Height", value: "95 cm Tall" }],
    },

    // --- 11. Outdoor & Sports ---
    {
      name: "GlideRider Lightweight Magnesium Toddler Balance Bike",
      slug: "gliderider-lightweight-magnesium-balance-bike",
      brandSlug: "tinyexplorer",
      catSlug: "outdoor-sports",
      basePrice: 3850,
      comparePrice: 4600,
      shortDesc: "Ultralight 2.8 kg seamless magnesium frame with puncture-proof EVA tires and adjustable padded seat.",
      desc: "<p>The fastest way to teach cycling balance without training wheels. Low step-through frame enables kids as young as 2 years old to stride with confidence.</p>",
      minAge: 24, maxAge: 72, material: "Aircraft-Grade Magnesium Alloy",
      battery: "None", choking: false, rating: 5.0, ratingCount: 72, sold: 215, isFeatured: true, isDeal: false,
      variants: [
        { sku: "TE-BIKE-BLU", title: "Sky Blue (Ages 2-6)", price: 3850, comparePrice: 4600, stock: 15 },
        { sku: "TE-BIKE-YEL", title: "Sunshine Yellow (Ages 2-6)", price: 3850, comparePrice: 4600, stock: 12 },
        { sku: "TE-BIKE-RED", title: "Cherry Red (Ages 2-6)", price: 3850, comparePrice: 4600, stock: 14 },
      ],
      images: [
        "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=800&q=80",
      ],
      attrs: [{ name: "Weight", value: "Only 2.8 kg" }, { name: "Tires", value: "Never-Flat EVA Foam" }],
    },
    {
      name: "SpeedKick Foldable 3-Wheel LED Light Kick Scooter",
      slug: "speedkick-foldable-3-wheel-led-scooter",
      brandSlug: "tinyexplorer",
      catSlug: "outdoor-sports",
      basePrice: 2650,
      comparePrice: 3200,
      shortDesc: "Lean-to-steer balance scooter with kinetic self-powered flashing LED wheels and wide non-slip deck.",
      desc: "<p>Smooth gliding with zero batteries needed! Kinetic dynamos inside the wheels light up in rainbow LEDs as your child scoots.</p>",
      minAge: 36, maxAge: 120, material: "Aluminum T-Bar & Reinforced Nylon Deck",
      battery: "Kinetic Dynamo Powered (No Batteries)", choking: false, rating: 4.8, ratingCount: 94, sold: 310, isFeatured: true, isDeal: true,
      variants: [
        { sku: "TE-SCOOT-AQUA", title: "Aqua Teal LED", price: 2650, comparePrice: 3200, stock: 25 },
        { sku: "TE-SCOOT-PINK", title: "Rose Pink LED", price: 2650, comparePrice: 3200, stock: 20 },
      ],
      images: [
        "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=800&q=80",
      ],
      attrs: [{ name: "Steering", value: "Lean-to-Steer Gravity Balance" }],
    },

    // --- 12. Musical Toys ---
    {
      name: "Symphony Junior 37-Key Electronic Recording Piano & Mic",
      slug: "symphony-junior-37-key-electronic-piano-mic",
      brandSlug: "wonderplay",
      catSlug: "musical-toys",
      basePrice: 2450,
      comparePrice: 3000,
      shortDesc: "37 velocity keys, 8 instrument sounds, 8 rhythms, built-in recording playback, and karaoke microphone.",
      desc: "<p>Nurture early musical genius! Children can compose songs, sing along with the microphone, and listen back to their recorded masterpieces.</p>",
      minAge: 36, maxAge: 120, material: "BPA-Free Durable ABS",
      battery: "USB-C Rechargeable or 4 x AA", choking: false, rating: 4.7, ratingCount: 44, sold: 135, isFeatured: false, isDeal: false,
      variants: [{ sku: "WP-PIANO-37", title: "37-Key Piano + Microphone", price: 2450, comparePrice: 3000, stock: 22 }],
      images: [
        "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80",
      ],
      attrs: [{ name: "Keys", value: "37 Electronic Keys" }],
    },
    {
      name: "Handcrafted Rainbow Wooden 8-Note Xylophone with Mallets",
      slug: "rainbow-wooden-8-note-xylophone-mallets",
      brandSlug: "ecowood-toy-co",
      catSlug: "musical-toys",
      basePrice: 950,
      comparePrice: 1200,
      shortDesc: "Acoustically tuned metal bars mounted on a solid pine wood base with safe rounded wooden mallets.",
      desc: "<p>Crisp, joyful, harmonic notes in a complete octave (C to C). Each note has a distinct bright color to help toddlers associate visual tones with pitch.</p>",
      minAge: 18, maxAge: 72, material: "Pine Wood & Precision-Tuned Aluminum Keys",
      battery: "None required", choking: false, rating: 4.9, ratingCount: 82, sold: 340, isFeatured: false, isDeal: false,
      variants: [{ sku: "EW-XYLO-8", title: "8-Note Rainbow Xylophone", price: 950, comparePrice: 1200, stock: 40 }],
      images: [
        "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80",
      ],
      attrs: [{ name: "Tuning", value: "Acoustically Calibrated (C Major)" }],
    },
  ];

  // Insert products with their variants, images, and attributes
  for (const p of rawProducts) {
    const brandId = brands[p.brandSlug];
    const categoryId = catMap[p.catSlug];

    const product = await prisma.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        brandId,
        shortDesc: p.shortDesc,
        descriptionHtml: p.desc,
        basePrice: p.basePrice,
        comparePrice: p.comparePrice,
        minAgeMonths: p.minAge,
        maxAgeMonths: p.maxAge,
        material: p.material,
        batteryInfo: p.battery,
        chokingHazard: p.choking,
        ratingAvg: p.rating,
        ratingCount: p.ratingCount,
        soldCount: p.sold,
        isFeatured: p.isFeatured,
        isDeal: p.isDeal,
        status: ProductStatus.ACTIVE,
        categories: {
          connect: [{ id: categoryId }],
        },
        variants: {
          create: p.variants.map((v) => ({
            sku: v.sku,
            title: v.title,
            price: v.price,
            comparePrice: v.comparePrice,
            stock: v.stock,
            lowStockThreshold: 5,
          })),
        },
        images: {
          create: p.images.map((img, idx) => ({
            url: img,
            alt: `${p.name} - Angle ${idx + 1}`,
            isPrimary: idx === 0,
            sortOrder: idx,
          })),
        },
        attributes: {
          create: p.attrs.map((a) => ({
            name: a.name,
            value: a.value,
          })),
        },
      },
    });

    // Add a flash deal for products flagged with isDeal
    if (p.isDeal) {
      await prisma.flashDeal.create({
        data: {
          productId: product.id,
          discountPercent: Math.round(((p.comparePrice! - p.basePrice) / p.comparePrice!) * 100),
          endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          quantityCap: 50,
          sold: 14,
          active: true,
        },
      });
    }

    // Add 2 realistic customer reviews per product
    await prisma.review.createMany({
      data: [
        {
          productId: product.id,
          userId: customer.id,
          rating: 5,
          title: "Brilliant quality and my child loves it!",
          body: `Received this within 24 hours in Dhaka. Quality of ${p.name} exceeded our expectations. The Cash on Delivery process was smooth and courier called before arriving. Very safe materials!`,
          helpfulCount: 8,
          verifiedPurchase: true,
          status: "APPROVED",
        },
        {
          productId: product.id,
          userId: customer.id,
          rating: 5,
          title: "Worth every Taka",
          body: "Great packaging and authentic toy. Highly recommend Khelna Bazar for fast delivery and genuine items.",
          helpfulCount: 3,
          verifiedPurchase: true,
          status: "APPROVED",
        },
      ],
    });

    // Add a customer Q&A
    await prisma.question.create({
      data: {
        productId: product.id,
        userId: customer.id,
        text: `Is this toy safe for children and what is the delivery time inside Dhaka?`,
        answers: [
          {
            answer: `Hello! Yes, this toy meets ASTM F963 and CE international child safety standards. Standard delivery inside Dhaka takes 24 to 48 hours via Cash on Delivery.`,
            author: "Khelna Bazar Support",
            isOfficial: true,
            date: "2026-11-12",
          },
        ],
        isPublic: true,
      },
    });
  }

  // 6. PROMOTIONAL COUPONS
  console.log("🎟️ Creating promotional coupons...");
  await prisma.coupon.createMany({
    data: [
      {
        code: "PLAY10",
        type: CouponType.PERCENTAGE,
        value: 10,
        minSpend: 1000,
        maxDiscount: 500,
        usageLimit: 5000,
        startsAt: new Date(),
        endsAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        active: true,
      },
      {
        code: "FREESHIP",
        type: CouponType.FREE_SHIPPING,
        value: 120,
        minSpend: 1500,
        maxDiscount: 120,
        usageLimit: 2000,
        startsAt: new Date(),
        endsAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        active: true,
      },
      {
        code: "WELCOME10",
        type: CouponType.PERCENTAGE,
        value: 10,
        minSpend: 800,
        maxDiscount: 300,
        usageLimit: 10000,
        startsAt: new Date(),
        endsAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        active: true,
      },
      {
        code: "EIDKID200",
        type: CouponType.FIXED,
        value: 200,
        minSpend: 2500,
        maxDiscount: 200,
        usageLimit: 1000,
        startsAt: new Date(),
        endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        active: true,
      },
      {
        code: "BULK20",
        type: CouponType.PERCENTAGE,
        value: 20,
        minSpend: 5000,
        maxDiscount: 1500,
        usageLimit: 500,
        startsAt: new Date(),
        endsAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        active: true,
      },
    ],
  });

  // 7. HERO BANNERS & ANNOUNCEMENTS
  console.log("🎨 Creating promotional hero banners...");
  await prisma.banner.createMany({
    data: [
      {
        placement: "HERO",
        desktopImage: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=1440&q=80",
        heading: "Where Joy & Imagination Begin!",
        text: "Discover 1000+ certified safe toys, STEM kits, building sets, and plush cuddle buddies with Cash on Delivery nationwide.",
        ctaLabel: "Explore Best Sellers",
        ctaUrl: "/c/building-blocks",
        sortOrder: 1,
        active: true,
      },
      {
        placement: "HERO",
        desktopImage: "https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=1440&q=80",
        heading: "Unleash Pure Speed: 4WD RC Buggies & Drones",
        text: "High-torque electric motors, all-terrain suspensions, and beginner camera drones ready for action.",
        ctaLabel: "Shop RC Vehicles",
        ctaUrl: "/c/rc-vehicles",
        sortOrder: 2,
        active: true,
      },
      {
        placement: "HERO",
        desktopImage: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=1440&q=80",
        heading: "Montessori & Sensory Toys for Little Explorers",
        text: "Solid beechwood, food-grade silicone teethers, and soothing musical plush companions.",
        ctaLabel: "Shop Baby & Toddler",
        ctaUrl: "/c/baby-toddler",
        sortOrder: 3,
        active: true,
      },
      {
        placement: "PROMO_SIDE",
        desktopImage: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
        heading: "Future Scientists Lab",
        text: "Robotics, chemistry & coding experiments.",
        ctaLabel: "Discover STEM",
        ctaUrl: "/c/stem-science",
        sortOrder: 1,
        active: true,
      },
    ],
  });

  await prisma.announcement.createMany({
    data: [
      { text: "🚚 FREE Home Delivery across Bangladesh on orders over ৳2,000! Cash on Delivery available.", active: true },
      { text: "🎉 Use code PLAY10 at checkout for an extra 10% discount on all building block sets!", active: true },
      { text: "🎁 Need a gift? Try our 3-step interactive Gift Finder to discover perfect age-matched toys!", active: true },
    ],
  });

  // 8. SAMPLE ORDERS (Demonstrating COD Status & Fulfillment Workflow)
  console.log("📦 Creating sample Cash on Delivery orders across all statuses...");

  const allVariants = await prisma.productVariant.findMany({ take: 6 });

  const sampleOrders = [
    {
      num: "KB-100241",
      status: OrderFulfillmentStatus.DELIVERED,
      codStatus: CodCollectionStatus.COLLECTED,
      collectedAmount: 3510,
      collectedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      subtotal: 3450,
      shipping: 60,
      total: 3510,
      zone: "Inside Dhaka",
      carrier: "Steadfast Courier",
      tracking: "ST-8829410",
      notes: "Customer paid exact cash to delivery courier.",
    },
    {
      num: "KB-100242",
      status: OrderFulfillmentStatus.SHIPPED,
      codStatus: CodCollectionStatus.UNCOLLECTED,
      subtotal: 2850,
      shipping: 120,
      total: 2970,
      zone: "Outside Dhaka",
      carrier: "Pathao Courier",
      tracking: "PTH-992140",
      notes: "In transit to Chittagong hub.",
    },
    {
      num: "KB-100243",
      status: OrderFulfillmentStatus.CONFIRMED,
      codStatus: CodCollectionStatus.UNCOLLECTED,
      subtotal: 4800,
      shipping: 0, // Free delivery
      total: 4800,
      zone: "Inside Dhaka",
      carrier: "Steadfast Courier",
      tracking: null,
      notes: "Phone confirmed with customer Tanzim Ahmed.",
    },
    {
      num: "KB-100244",
      status: OrderFulfillmentStatus.PENDING_CONFIRMATION,
      codStatus: CodCollectionStatus.UNCOLLECTED,
      subtotal: 2250,
      shipping: 60,
      total: 2310,
      zone: "Inside Dhaka",
      carrier: "Steadfast Courier",
      tracking: null,
      notes: "Newly placed order. Awaiting automated or manual phone verification.",
    },
  ];

  for (const so of sampleOrders) {
    const order = await prisma.order.create({
      data: {
        orderNumber: so.num,
        userId: customer.id,
        customerName: "Tanzim Ahmed",
        customerEmail: "customer@khelnabazar.com",
        customerPhone: "+880 1819-123456",
        status: so.status,
        codStatus: so.codStatus,
        codCollectedAmount: so.collectedAmount,
        codCollectionDate: so.collectedDate,
        subtotal: so.subtotal,
        shippingFee: so.shipping,
        total: so.total,
        currency: "BDT",
        deliveryZone: so.zone,
        carrier: so.carrier,
        trackingNumber: so.tracking,
        adminNotes: so.notes,
        shippingAddress: {
          fullName: "Tanzim Ahmed",
          phone: "+880 1819-123456",
          line1: "House 24, Road 4, Sector 3",
          city: "Uttara",
          state: "Dhaka",
          country: "Bangladesh",
        },
        items: {
          create: [
            {
              variantId: allVariants[0].id,
              nameSnapshot: "Space Explorer Rocket Launch Facility (850 Pcs)",
              skuSnapshot: allVariants[0].sku,
              unitPrice: so.subtotal,
              quantity: 1,
              lineTotal: so.subtotal,
            },
          ],
        },
        events: {
          create: [
            {
              type: "ORDER_PLACED",
              message: "Order placed by customer via Cash on Delivery (COD).",
              actorName: "Customer",
            },
            {
              type: "STATUS_CHANGE",
              message: `Order marked as ${so.status} with COD Status ${so.codStatus}.`,
              actorName: "System",
            },
          ],
        },
      },
    });

    // Stock Movement audit
    await prisma.stockMovement.create({
      data: {
        variantId: allVariants[0].id,
        delta: -1,
        reason: "ORDER_FULFILLMENT",
        actorName: "System",
        orderId: order.id,
      },
    });
  }

  // 9. CMS PAGES
  console.log("📄 Creating official CMS informational pages...");
  const pagesData = [
    {
      slug: "about-us",
      title: "About Khelna Bazar",
      content: `<h2>Welcome to KHELNA BAZAR</h2><p>Khelna Bazar is Bangladesh's premier online destination for authentic, joy-sparking, and strictly safety-certified toys. We believe that play is the work of childhood—fostering creativity, analytical thinking, emotional resilience, and pure happiness.</p><p>Every toy in our catalog undergoes rigorous quality inspection for non-toxic materials, durable construction, and developmental value. With convenient nationwide Cash on Delivery, parents can shop with total confidence.</p>`,
    },
    {
      slug: "toy-safety",
      title: "Toy Safety & Compliance Standards",
      content: `<h2>Our Zero-Compromise Safety Guarantee</h2><p>Children's safety is our highest sacred priority. All products supplied by Khelna Bazar strictly comply with international and domestic safety benchmarks:</p><ul><li><strong>ASTM F963 & EN71:</strong> Rigorous mechanical stress testing, impact absorption, and puncture resistance.</li><li><strong>BPA & Phthalate Free:</strong> Food-grade silicone and non-toxic ABS materials only.</li><li><strong>Water-Based Paints:</strong> Zero heavy metals or lead in pigments.</li><li><strong>Clear Age Ratings:</strong> Prominent choking hazard warnings on all items containing small parts.</li></ul>`,
    },
    {
      slug: "shipping-policy",
      title: "Shipping & Delivery Policy",
      content: `<h2>Fast Cash on Delivery Across Bangladesh</h2><p>We deliver nationwide using trusted courier partners like Steadfast Courier and Pathao:</p><ul><li><strong>Inside Dhaka:</strong> ৳60 flat fee (Delivered within 24–48 hours).</li><li><strong>Outside Dhaka:</strong> ৳120 flat fee (Delivered within 2–4 business days).</li><li><strong>FREE SHIPPING:</strong> On all orders totaling ৳2,000 or above!</li><li><strong>Payment:</strong> Pay with cash directly to the delivery agent upon receiving and inspecting your package.</li></ul>`,
    },
    {
      slug: "returns-policy",
      title: "7-Day Easy Returns & Exchange",
      content: `<h2>Hassle-Free Returns Guarantee</h2><p>If your package arrives damaged, incomplete, or with a manufacturing defect, Khelna Bazar provides a 100% free replacement or refund within 7 days of delivery.</p><p>Simply contact our customer care via phone or WhatsApp at +880 1700-000000 with your Order Number and photos of the item.</p>`,
    },
    {
      slug: "privacy-policy",
      title: "Privacy Policy",
      content: `<h2>Your Privacy is Protected</h2><p>Khelna Bazar never sells, leases, or trades your personal information to third parties. We collect only necessary delivery coordinates (Name, Phone number, Shipping address) strictly to fulfill your orders.</p>`,
    },
    {
      slug: "terms",
      title: "Terms & Conditions",
      content: `<h2>Terms of Service</h2><p>By placing an order on Khelna Bazar, you agree to inspect the delivery parcel and provide cash payment upon receipt. All pricing is displayed in Bangladeshi Taka (BDT) including applicable taxes.</p>`,
    },
  ];

  for (const page of pagesData) {
    await prisma.page.create({
      data: {
        slug: page.slug,
        title: page.title,
        contentHtml: page.content,
        published: true,
      },
    });
  }

  // 10. AUDIT LOG
  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      actorEmail: admin.email,
      action: "DATABASE_INITIALIZED",
      entityType: "System",
      entityId: "SYSTEM_INIT",
      before: {},
      after: {
        event: "Seed completed with 60+ products, categories, coupons, and demo accounts.",
      },
    },
  });

  console.log("===============================================================================");
  console.log("✅ KHELNA BAZAR SEED PROCESS COMPLETED SUCCESSFULLY!");
  console.log("===============================================================================");
  console.log("🔑 DEMO LOGIN CREDENTIALS:");
  console.log("   👑 ADMIN:    admin@khelnabazar.com    / Admin@Khelna123");
  console.log("   👔 STAFF:    staff@khelnabazar.com    / Staff@Khelna123");
  console.log("   🛍️ CUSTOMER: customer@khelnabazar.com / Customer@Khelna123");
  console.log("===============================================================================");
  console.log("⚠️  SECURITY WARNING: Change these demo credentials before deploying to production!");
  console.log("===============================================================================");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
