export interface ToyProduct {
  id: string;
  name: string;
  slug: string;
  brand: string;
  category: string;
  categorySlug: string;
  basePrice: number;
  comparePrice?: number | null;
  shortDesc: string;
  descriptionHtml: string;
  minAgeMonths: number;
  maxAgeMonths: number;
  material: string;
  batteryInfo: string;
  chokingHazard: boolean;
  chokingWarning?: string;
  certifications: string[];
  ratingAvg: number;
  ratingCount: number;
  soldCount: number;
  isFeatured: boolean;
  isDeal: boolean;
  stock: number;
  images: string[];
  variants: {
    id: string;
    sku: string;
    title: string;
    price: number;
    comparePrice?: number | null;
    stock: number;
  }[];
  attributes: { name: string; value: string }[];
}

export const MOCK_CATEGORIES = [
  {
    name: "Building Blocks & Construction",
    slug: "building-blocks",
    description: "Interlocking bricks, magnetic tiles, and architectural construction sets.",
    image: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=600&q=80",
    itemCount: 14,
  },
  {
    name: "STEM & Science Kits",
    slug: "stem-science",
    description: "Hands-on robotics, chemistry sets, microscopes, and renewable energy experiments.",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
    itemCount: 12,
  },
  {
    name: "Action Figures & Playsets",
    slug: "action-figures",
    description: "Superheroes, dinosaurs, galactic warriors, and articulated poseable figures.",
    image: "https://images.unsplash.com/photo-1608889175123-8ee362201f81?auto=format&fit=crop&w=600&q=80",
    itemCount: 18,
  },
  {
    name: "RC & Remote Control Vehicles",
    slug: "rc-vehicles",
    description: "High-speed off-road buggies, beginner drones, speed boats, and drift cars.",
    image: "https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=600&q=80",
    itemCount: 15,
  },
  {
    name: "Baby & Toddler Toys",
    slug: "baby-toddler",
    description: "Non-toxic silicone teethers, soft rattle balls, sensory shape sorters, and musical crawlers.",
    image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=600&q=80",
    itemCount: 16,
  },
  {
    name: "Plush & Stuffed Animals",
    slug: "plush-toys",
    description: "Super soft teddy bears, giant huggable pillows, and animated talking stuffed companions.",
    image: "https://images.unsplash.com/photo-1559454403-b8fb88521f11?auto=format&fit=crop&w=600&q=80",
    itemCount: 10,
  },
  {
    name: "Board Games & Puzzles",
    slug: "board-games-puzzles",
    description: "Family strategy games, brain-teaser jigsaws, and cooperative party games.",
    image: "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=600&q=80",
    itemCount: 11,
  },
  {
    name: "Arts & Crafts",
    slug: "arts-crafts",
    description: "Pottery wheels, clay sets, washable acrylic paints, origami, and DIY bead making.",
    image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=600&q=80",
    itemCount: 13,
  },
  {
    name: "Pretend Play & Costumes",
    slug: "pretend-play",
    description: "Wooden play kitchens, doctor sets, workbenches, and dress-up costumes.",
    image: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=600&q=80",
    itemCount: 9,
  },
  {
    name: "Outdoor & Sports",
    slug: "outdoor-sports",
    description: "Balance bikes, kick scooters, archery sets, soccer nets, and garden water sprinklers.",
    image: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=600&q=80",
    itemCount: 8,
  },
];

export const MOCK_PRODUCTS: ToyProduct[] = [
  {
    id: "kb-prod-1",
    name: "Space Explorer Rocket Launch Facility (850 Pcs)",
    slug: "space-explorer-rocket-launch-facility",
    brand: "BrickCrafters",
    category: "Building Blocks & Construction",
    categorySlug: "building-blocks",
    basePrice: 3450,
    comparePrice: 4200,
    shortDesc: "Giant multi-stage space rocket with mission control tower, lunar rover, and astronaut mini-figures.",
    descriptionHtml: "<p>Spark interstellar dreams! This 850-piece engineering set includes a towering three-stage rocket, working gantry elevator, lunar excavation rover, and 4 astronaut figurines with space gear.</p><ul><li>Detailed booster rockets with snap-fit stages</li><li>Command launch room with computer consoles</li><li>Step-by-step full color instruction book</li></ul>",
    minAgeMonths: 72,
    maxAgeMonths: 168,
    material: "High-grade ABS Plastic (BPA Free)",
    batteryInfo: "None required",
    chokingHazard: true,
    chokingWarning: "WARNING: CHOKING HAZARD - Small parts. Not for children under 3 years.",
    certifications: ["ASTM F963", "EN71", "CE Certified"],
    ratingAvg: 4.9,
    ratingCount: 42,
    soldCount: 138,
    isFeatured: true,
    isDeal: false,
    stock: 24,
    images: [
      "https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1611604548018-d56bbd85d681?auto=format&fit=crop&w=800&q=80",
    ],
    variants: [
      { id: "var-1", sku: "BC-SP-850-STD", title: "Standard Launch Pad", price: 3450, comparePrice: 4200, stock: 24 },
      { id: "var-2", sku: "BC-SP-850-DX", title: "Deluxe LED Edition", price: 4150, comparePrice: 4900, stock: 12 },
    ],
    attributes: [
      { name: "Skill", value: "Spatial Reasoning & Patience" },
      { name: "Theme", value: "Space & Galaxy" },
    ],
  },
  {
    id: "kb-prod-2",
    name: "Magnetic Castle Architect Tiles (102 Pcs)",
    slug: "magnetic-castle-architect-tiles-102",
    brand: "BrickCrafters",
    category: "Building Blocks & Construction",
    categorySlug: "building-blocks",
    basePrice: 2850,
    comparePrice: 3500,
    shortDesc: "Vibrant translucent 3D magnetic building tiles that click together effortlessly from any angle.",
    descriptionHtml: "<p>Unleash limitless structural imagination! Strong neodymium encapsulated magnets ensure towers and castles stay upright. High-transparency rainbow colors glow beautifully near windows.</p>",
    minAgeMonths: 36,
    maxAgeMonths: 120,
    material: "Reinforced ABS Plastic & Ceramic Magnets",
    batteryInfo: "None required",
    chokingHazard: false,
    certifications: ["ASTM F963", "EN71", "CE Certified"],
    ratingAvg: 4.8,
    ratingCount: 89,
    soldCount: 310,
    isFeatured: true,
    isDeal: true,
    stock: 45,
    images: [
      "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=800&q=80",
    ],
    variants: [
      { id: "var-3", sku: "BC-MAG-102-RBW", title: "102-Piece Rainbow Set", price: 2850, comparePrice: 3500, stock: 45 },
      { id: "var-4", sku: "BC-MAG-150-GLO", title: "150-Piece Glow Edition", price: 3950, comparePrice: 4800, stock: 18 },
    ],
    attributes: [
      { name: "Skill", value: "STEM / Geometry" },
      { name: "Award", value: "Parent Choice Gold 2025" },
    ],
  },
  {
    id: "kb-prod-3",
    name: "RoboTrack 12-in-1 Solar & Hydraulic Robot Kit",
    slug: "robotrack-12-in-1-solar-hydraulic-robot",
    brand: "RoboKidz",
    category: "STEM & Science Kits",
    categorySlug: "stem-science",
    basePrice: 2650,
    comparePrice: 3200,
    shortDesc: "Build 12 distinct working robots powered entirely by sunlight and hydraulic water pistons. Zero batteries!",
    descriptionHtml: "<p>Learn mechanical engineering principles! Kids can assemble crawling bugs, rover crawlers, boat robots, and T-Rex walkers. The dual-drive system operates via solar panel or micro hydraulic pumps.</p>",
    minAgeMonths: 96,
    maxAgeMonths: 180,
    material: "Eco-ABS & Hydraulic Silicone Valves",
    batteryInfo: "100% Solar & Water Powered (No Batteries)",
    chokingHazard: true,
    certifications: ["ASTM F963", "CE Certified"],
    ratingAvg: 4.8,
    ratingCount: 67,
    soldCount: 220,
    isFeatured: true,
    isDeal: true,
    stock: 28,
    images: [
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80",
    ],
    variants: [
      { id: "var-5", sku: "RK-SOL-12", title: "12-in-1 Complete Solar Kit", price: 2650, comparePrice: 3200, stock: 28 },
    ],
    attributes: [
      { name: "Skill", value: "Renewable Energy & Physics" },
    ],
  },
  {
    id: "kb-prod-4",
    name: "StormCrawler 4WD High-Speed Rock Buggy (1:14 Scale)",
    slug: "stormcrawler-4wd-high-speed-rock-buggy",
    brand: "SpeedMaster RC",
    category: "RC & Remote Control Vehicles",
    categorySlug: "rc-vehicles",
    basePrice: 3250,
    comparePrice: 3900,
    shortDesc: "All-terrain monster buggy with independent metal spring suspension, dual high-torque motors, and splash-proof shell.",
    descriptionHtml: "<p>Conquer sand, mud, gravel, and asphalt! Reaches exhilarating speeds up to 25 km/h. 2.4 GHz anti-interference transmitter allows up to 10 cars to race together with a 60-meter control distance.</p>",
    minAgeMonths: 84,
    maxAgeMonths: 192,
    material: "Nylon Alloy & High-Grip Rubber Tires",
    batteryInfo: "2 x 7.4V Rechargeable Packs (Includes USB Charger)",
    chokingHazard: true,
    certifications: ["ASTM F963", "CE Certified"],
    ratingAvg: 4.9,
    ratingCount: 112,
    soldCount: 410,
    isFeatured: true,
    isDeal: true,
    stock: 26,
    images: [
      "https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=800&q=80",
    ],
    variants: [
      { id: "var-6", sku: "SM-BUGGY-RED", title: "Fiery Red (1:14 Scale)", price: 3250, comparePrice: 3900, stock: 26 },
      { id: "var-7", sku: "SM-BUGGY-BLU", title: "Electric Blue (1:14 Scale)", price: 3250, comparePrice: 3900, stock: 22 },
    ],
    attributes: [
      { name: "Max Speed", value: "25 km/h" },
      { name: "Drive System", value: "4-Wheel Drive (4WD)" },
    ],
  },
  {
    id: "kb-prod-5",
    name: "Barnaby the Giant Huggable Teddy Bear (100 cm)",
    slug: "barnaby-giant-huggable-teddy-bear-100cm",
    brand: "SoftCuddles",
    category: "Plush & Stuffed Animals",
    categorySlug: "plush-toys",
    basePrice: 2450,
    comparePrice: 3100,
    shortDesc: "One meter of ultra-plush, cloud-soft velvet cuddles with embroidered safety eyes and velvet neck ribbon.",
    descriptionHtml: "<p>The ultimate comfort companion for nap time and story time. Crafted from allergen-tested silky polyester fibers with high-resilience memory polyfill that never flattens.</p>",
    minAgeMonths: 0,
    maxAgeMonths: 999,
    material: "Hypoallergenic Cloud-Velvet & Organic Polyfill",
    batteryInfo: "None required",
    chokingHazard: false,
    certifications: ["ASTM F963", "EN71", "CE Certified"],
    ratingAvg: 5.0,
    ratingCount: 145,
    soldCount: 520,
    isFeatured: true,
    isDeal: false,
    stock: 35,
    images: [
      "https://images.unsplash.com/photo-1559454403-b8fb88521f11?auto=format&fit=crop&w=800&q=80",
    ],
    variants: [
      { id: "var-8", sku: "SC-BEAR-BRN", title: "Caramel Brown (100cm)", price: 2450, comparePrice: 3100, stock: 35 },
      { id: "var-9", sku: "SC-BEAR-CRM", title: "Vanilla Cream (100cm)", price: 2450, comparePrice: 3100, stock: 29 },
    ],
    attributes: [
      { name: "Height", value: "100 cm (3.3 ft)" },
      { name: "Safety", value: "Hypoallergenic & Washable" },
    ],
  },
  {
    id: "kb-prod-6",
    name: "Montessori Wooden 8-in-1 Sensory Activity Cube",
    slug: "montessori-wooden-8-in-1-sensory-activity-cube",
    brand: "EcoWood Toy Co",
    category: "Baby & Toddler Toys",
    categorySlug: "baby-toddler",
    basePrice: 2750,
    comparePrice: 3400,
    shortDesc: "Premium solid beechwood play cube with bead maze, rotating gears, clock, shape sorter, and xylophone.",
    descriptionHtml: "<p>Designed following authentic Montessori sensory development guidelines. Smooth hand-sanded edges with zero splinters, painted using water-based non-toxic food-grade dye.</p>",
    minAgeMonths: 12,
    maxAgeMonths: 48,
    material: "FSC-Certified Solid Beech & Stainless Steel",
    batteryInfo: "None required",
    chokingHazard: false,
    certifications: ["ASTM F963", "EN71", "CE Certified"],
    ratingAvg: 4.9,
    ratingCount: 92,
    soldCount: 285,
    isFeatured: true,
    isDeal: false,
    stock: 20,
    images: [
      "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80",
    ],
    variants: [
      { id: "var-10", sku: "EW-CUBE-8IN1", title: "Natural Beech Activity Cube", price: 2750, comparePrice: 3400, stock: 20 },
    ],
    attributes: [
      { name: "Methodology", value: "Montessori Sensory" },
      { name: "Wood", value: "100% Solid Beech" },
    ],
  },
  {
    id: "kb-prod-7",
    name: "Titan Rex Roaring Jurassic Dinosaur with Light-Up Eyes",
    slug: "titan-rex-roaring-jurassic-dinosaur",
    brand: "DinoWorld",
    category: "Action Figures & Playsets",
    categorySlug: "action-figures",
    basePrice: 2250,
    comparePrice: 2800,
    shortDesc: "Over 45 cm long motorized walking Tyrannosaurus Rex with realistic skin texture and thunderous sound effects.",
    descriptionHtml: "<p>Brings the prehistoric era to life! Press the spinal horn to unleash a thunderous roar, glowing amber eyes, and motorized stomping walk.</p>",
    minAgeMonths: 36,
    maxAgeMonths: 120,
    material: "Non-Toxic Soft Touch Vinyl & ABS",
    batteryInfo: "3 x AA (Included)",
    chokingHazard: false,
    certifications: ["ASTM F963", "CE Certified"],
    ratingAvg: 4.8,
    ratingCount: 78,
    soldCount: 290,
    isFeatured: true,
    isDeal: false,
    stock: 35,
    images: [
      "https://images.unsplash.com/photo-1608889175123-8ee362201f81?auto=format&fit=crop&w=800&q=80",
    ],
    variants: [
      { id: "var-11", sku: "DW-TREX-BRN", title: "Forest Brown T-Rex", price: 2250, comparePrice: 2800, stock: 35 },
    ],
    attributes: [
      { name: "Length", value: "45 cm" },
      { name: "Features", value: "Roaring Sound & Motorized Walk" },
    ],
  },
  {
    id: "kb-prod-8",
    name: "ClayCrafter Electric Pottery Wheel Studio with Sculpting Tools",
    slug: "claycrafter-electric-pottery-wheel-studio",
    brand: "CreativeSpark",
    category: "Arts & Crafts",
    categorySlug: "arts-crafts",
    basePrice: 2950,
    comparePrice: 3600,
    shortDesc: "Real variable-speed pottery wheel with foot pedal, 1.2 kg air-dry natural terracotta clay, and 12 acrylic paints.",
    descriptionHtml: "<p>Everything young artisans need to sculpt vases, mugs, pots, and figurines! Features dual speed rotation, splash basin, cutting cord, and carving knives.</p>",
    minAgeMonths: 96,
    maxAgeMonths: 192,
    material: "ABS Turntable & Non-Toxic Terracotta Clay",
    batteryInfo: "USB-C Powered or 4 x D Batteries",
    chokingHazard: true,
    certifications: ["ASTM F963", "EN71", "CE Certified"],
    ratingAvg: 4.8,
    ratingCount: 52,
    soldCount: 175,
    isFeatured: true,
    isDeal: true,
    stock: 18,
    images: [
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80",
    ],
    variants: [
      { id: "var-12", sku: "CS-POT-STD", title: "Complete Studio + 1.2kg Clay", price: 2950, comparePrice: 3600, stock: 18 },
    ],
    attributes: [
      { name: "Clay Type", value: "Air-Dry (No Kiln Needed)" },
    ],
  },
];
