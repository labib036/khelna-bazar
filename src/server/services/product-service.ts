import { db } from "@/lib/db";
import { MOCK_PRODUCTS, MOCK_CATEGORIES, ToyProduct } from "@/server/mock-data";

export async function getProducts(params?: {
  category?: string;
  ageRange?: string; // e.g. "0-12m", "1-2y", "3-4y", "5-7y", "8-11y", "12+"
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  sort?: string;
  query?: string;
  isDeal?: boolean;
  limit?: number;
  page?: number;
}): Promise<{ products: ToyProduct[]; total: number }> {
  try {
    // Attempt Prisma database lookup
    const whereClause: any = {
      status: "ACTIVE",
    };

    if (params?.category) {
      whereClause.categories = {
        some: {
          slug: params.category,
        },
      };
    }

    if (params?.brand) {
      whereClause.brand = {
        slug: params.brand,
      };
    }

    if (params?.minPrice !== undefined || params?.maxPrice !== undefined) {
      whereClause.basePrice = {};
      if (params.minPrice !== undefined) whereClause.basePrice.gte = params.minPrice;
      if (params.maxPrice !== undefined) whereClause.basePrice.lte = params.maxPrice;
    }

    if (params?.isDeal) {
      whereClause.isDeal = true;
    }

    if (params?.query) {
      whereClause.OR = [
        { name: { contains: params.query, mode: "insensitive" } },
        { shortDesc: { contains: params.query, mode: "insensitive" } },
      ];
    }

    // Age range filters (months)
    if (params?.ageRange) {
      if (params.ageRange === "0-12m") {
        whereClause.minAgeMonths = { lte: 12 };
      } else if (params.ageRange === "1-2y") {
        whereClause.minAgeMonths = { lte: 24 };
        whereClause.maxAgeMonths = { gte: 12 };
      } else if (params.ageRange === "3-4y") {
        whereClause.minAgeMonths = { lte: 48 };
        whereClause.maxAgeMonths = { gte: 36 };
      } else if (params.ageRange === "5-7y") {
        whereClause.minAgeMonths = { lte: 84 };
        whereClause.maxAgeMonths = { gte: 60 };
      } else if (params.ageRange === "8-11y") {
        whereClause.minAgeMonths = { lte: 132 };
        whereClause.maxAgeMonths = { gte: 96 };
      } else if (params.ageRange === "12+") {
        whereClause.minAgeMonths = { gte: 144 };
      }
    }

    let orderBy: any = { createdAt: "desc" };
    if (params?.sort === "price-asc") orderBy = { basePrice: "asc" };
    else if (params?.sort === "price-desc") orderBy = { basePrice: "desc" };
    else if (params?.sort === "rating") orderBy = { ratingAvg: "desc" };
    else if (params?.sort === "bestselling") orderBy = { soldCount: "desc" };

    const take = params?.limit || 24;
    const skip = ((params?.page || 1) - 1) * take;

    const [dbProducts, total] = await Promise.all([
      db.product.findMany({
        where: whereClause,
        include: {
          brand: true,
          categories: true,
          variants: true,
          images: { orderBy: { sortOrder: "asc" } },
          attributes: true,
        },
        orderBy,
        take,
        skip,
      }),
      db.product.count({ where: whereClause }),
    ]);

    if (dbProducts && dbProducts.length > 0) {
      const mapped: ToyProduct[] = dbProducts.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        brand: p.brand?.name || "Khelna Bazar Brand",
        category: p.categories[0]?.name || "Toys",
        categorySlug: p.categories[0]?.slug || "toys",
        basePrice: p.basePrice,
        comparePrice: p.comparePrice,
        shortDesc: p.shortDesc || "",
        descriptionHtml: p.descriptionHtml,
        minAgeMonths: p.minAgeMonths,
        maxAgeMonths: p.maxAgeMonths,
        material: p.material || "Non-Toxic ABS",
        batteryInfo: p.batteryInfo || "None required",
        chokingHazard: p.chokingHazard,
        chokingWarning: p.chokingWarning || undefined,
        certifications: p.certifications,
        ratingAvg: p.ratingAvg,
        ratingCount: p.ratingCount,
        soldCount: p.soldCount,
        isFeatured: p.isFeatured,
        isDeal: p.isDeal,
        stock: p.variants.reduce((sum, v) => sum + v.stock, 0),
        images: p.images.map((img) => img.url),
        variants: p.variants.map((v) => ({
          id: v.id,
          sku: v.sku,
          title: v.title,
          price: v.price,
          comparePrice: v.comparePrice,
          stock: v.stock,
        })),
        attributes: p.attributes.map((a) => ({ name: a.name, value: a.value })),
      }));

      return { products: mapped, total };
    }
  } catch (error) {
    // Database connection or table not yet initialized; fallback to mock data
    console.warn("Falling back to rich catalog mock data:", (error as Error).message);
  }

  // Fallback to MOCK_PRODUCTS
  let filtered = [...MOCK_PRODUCTS];

  if (params?.category) {
    filtered = filtered.filter((p) => p.categorySlug === params.category);
  }

  if (params?.brand) {
    filtered = filtered.filter(
      (p) => p.brand.toLowerCase().replace(/\s+/g, "-") === params.brand
    );
  }

  if (params?.minPrice !== undefined) {
    filtered = filtered.filter((p) => p.basePrice >= params.minPrice!);
  }

  if (params?.maxPrice !== undefined) {
    filtered = filtered.filter((p) => p.basePrice <= params.maxPrice!);
  }

  if (params?.isDeal) {
    filtered = filtered.filter((p) => p.isDeal);
  }

  if (params?.query) {
    const q = params.query.toLowerCase();
    filtered = filtered.filter(
      (p) => p.name.toLowerCase().includes(q) || p.shortDesc.toLowerCase().includes(q)
    );
  }

  if (params?.sort === "price-asc") {
    filtered.sort((a, b) => a.basePrice - b.basePrice);
  } else if (params?.sort === "price-desc") {
    filtered.sort((a, b) => b.basePrice - a.basePrice);
  } else if (params?.sort === "rating") {
    filtered.sort((a, b) => b.ratingAvg - a.ratingAvg);
  } else if (params?.sort === "bestselling") {
    filtered.sort((a, b) => b.soldCount - a.soldCount);
  }

  return { products: filtered, total: filtered.length };
}

export async function getProductBySlug(slug: string): Promise<ToyProduct | null> {
  try {
    const dbProduct = await db.product.findUnique({
      where: { slug },
      include: {
        brand: true,
        categories: true,
        variants: true,
        images: { orderBy: { sortOrder: "asc" } },
        attributes: true,
      },
    });

    if (dbProduct) {
      return {
        id: dbProduct.id,
        name: dbProduct.name,
        slug: dbProduct.slug,
        brand: dbProduct.brand?.name || "Khelna Bazar Brand",
        category: dbProduct.categories[0]?.name || "Toys",
        categorySlug: dbProduct.categories[0]?.slug || "toys",
        basePrice: dbProduct.basePrice,
        comparePrice: dbProduct.comparePrice,
        shortDesc: dbProduct.shortDesc || "",
        descriptionHtml: dbProduct.descriptionHtml,
        minAgeMonths: dbProduct.minAgeMonths,
        maxAgeMonths: dbProduct.maxAgeMonths,
        material: dbProduct.material || "Non-Toxic Child Safe",
        batteryInfo: dbProduct.batteryInfo || "None required",
        chokingHazard: dbProduct.chokingHazard,
        chokingWarning: dbProduct.chokingWarning || undefined,
        certifications: dbProduct.certifications,
        ratingAvg: dbProduct.ratingAvg,
        ratingCount: dbProduct.ratingCount,
        soldCount: dbProduct.soldCount,
        isFeatured: dbProduct.isFeatured,
        isDeal: dbProduct.isDeal,
        stock: dbProduct.variants.reduce((sum, v) => sum + v.stock, 0),
        images: dbProduct.images.map((img) => img.url),
        variants: dbProduct.variants.map((v) => ({
          id: v.id,
          sku: v.sku,
          title: v.title,
          price: v.price,
          comparePrice: v.comparePrice,
          stock: v.stock,
        })),
        attributes: dbProduct.attributes.map((a) => ({ name: a.name, value: a.value })),
      };
    }
  } catch (error) {
    console.warn("DB lookup error, using mock catalog for slug:", slug);
  }

  const found = MOCK_PRODUCTS.find((p) => p.slug === slug);
  return found || null;
}

export async function getCategories() {
  try {
    const dbCategories = await db.category.findMany({
      where: { parentId: null },
      include: {
        children: true,
        _count: { select: { products: true } },
      },
      orderBy: { sortOrder: "asc" },
    });

    if (dbCategories && dbCategories.length > 0) {
      return dbCategories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description || "",
        image: c.image || "https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=600&q=80",
        itemCount: c._count.products,
        children: c.children.map((ch) => ({ name: ch.name, slug: ch.slug })),
      }));
    }
  } catch (error) {
    // fallback
  }

  return MOCK_CATEGORIES;
}
