import { db } from "@/lib/db";
import { ToyProduct, StoreCategory } from "@/types/store";

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
      deletedAt: null,
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
        material: p.material || undefined,
        batteryInfo: p.batteryInfo || undefined,
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

    return { products: [], total: 0 };
  } catch (error) {
    console.error("Database lookup error in getProducts:", (error as Error).message);
    return { products: [], total: 0 };
  }
}

export async function getProductBySlug(slug: string): Promise<ToyProduct | null> {
  try {
    const dbProduct = await db.product.findFirst({
      where: { slug, deletedAt: null },
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
        material: dbProduct.material || undefined,
        batteryInfo: dbProduct.batteryInfo || undefined,
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
    return null;
  } catch (error) {
    console.error("DB lookup error for slug:", slug, (error as Error).message);
    return null;
  }
}

export async function getCategories(): Promise<StoreCategory[]> {
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
        image: c.image || null,
        itemCount: c._count.products,
        children: c.children.map((ch) => ({ name: ch.name, slug: ch.slug })),
      }));
    }
    return [];
  } catch (error) {
    console.error("DB lookup error in getCategories:", (error as Error).message);
    return [];
  }
}
