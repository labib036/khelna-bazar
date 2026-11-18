"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { isStaffRole, isAdminRole } from "@/lib/authorization-guards";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getProducts } from "@/server/services/product-service";
import { ToyProduct } from "@/types/store";

const ProductInputSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Product name must be at least 2 characters"),
  slug: z.string().optional(),
  brandName: z.string().default("Khelna Bazar"),
  categorySlug: z.string().default("toys"),
  basePrice: z.number().int().min(1, "Price must be at least ৳1"),
  comparePrice: z.number().int().optional().nullable(),
  stock: z.number().int().min(0).default(10),
  shortDesc: z.string().optional(),
  descriptionHtml: z.string().default("<p>Authentic child-safe toy.</p>"),
  images: z.array(z.string()).default([]),
  minAgeMonths: z.number().int().default(36),
  maxAgeMonths: z.number().int().default(144),
  chokingHazard: z.boolean().default(false),
  certifications: z.array(z.string()).default([]),
});

export type ProductInput = z.input<typeof ProductInputSchema>;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Creates or updates a product in the database.
 * Enforces ADMIN or STAFF authorization.
 */
export async function saveProduct(input: ProductInput) {
  try {
    const session = await auth();
    if (!session?.user || !isStaffRole(session.user.role)) {
      return { success: false, error: "Unauthorized: Admin or Staff privileges required to save catalog products." };
    }

    const data = ProductInputSchema.parse(input);
    const slug = data.slug || slugify(data.name);

    // Find or create category
    let category = await db.category.findUnique({
      where: { slug: data.categorySlug },
    });

    if (!category) {
      category = await db.category.create({
        data: {
          name: data.categorySlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
          slug: data.categorySlug,
          description: "Toy category",
        },
      });
    }

    // Find or create brand
    const brandSlug = slugify(data.brandName);
    let brand = await db.brand.findUnique({
      where: { slug: brandSlug },
    });

    if (!brand) {
      brand = await db.brand.create({
        data: {
          name: data.brandName,
          slug: brandSlug,
        },
      });
    }

    if (data.id) {
      // Update existing
      const updated = await db.product.update({
        where: { id: data.id },
        data: {
          name: data.name,
          slug,
          basePrice: data.basePrice,
          comparePrice: data.comparePrice,
          shortDesc: data.shortDesc,
          descriptionHtml: data.descriptionHtml,
          minAgeMonths: data.minAgeMonths,
          maxAgeMonths: data.maxAgeMonths,
          chokingHazard: data.chokingHazard,
          certifications: data.certifications,
          brandId: brand.id,
          categories: {
            set: [{ id: category.id }],
          },
        },
      });

      // Update default variant
      await db.productVariant.upsert({
        where: { sku: `KB-${slug.slice(0, 8).toUpperCase()}-STD` },
        update: {
          price: data.basePrice,
          comparePrice: data.comparePrice,
          stock: data.stock,
        },
        create: {
          productId: updated.id,
          sku: `KB-${slug.slice(0, 8).toUpperCase()}-STD`,
          title: "Standard Edition",
          price: data.basePrice,
          comparePrice: data.comparePrice,
          stock: data.stock,
        },
      });

      revalidatePath("/admin/products");
      revalidatePath("/admin/inventory");
      revalidatePath("/");
      return { success: true, productId: updated.id };
    } else {
      // Create new
      const created = await db.product.create({
        data: {
          name: data.name,
          slug,
          basePrice: data.basePrice,
          comparePrice: data.comparePrice,
          shortDesc: data.shortDesc || data.name,
          descriptionHtml: data.descriptionHtml,
          minAgeMonths: data.minAgeMonths,
          maxAgeMonths: data.maxAgeMonths,
          chokingHazard: data.chokingHazard,
          certifications: data.certifications,
          brandId: brand.id,
          categories: {
            connect: [{ id: category.id }],
          },
          variants: {
            create: {
              sku: `KB-${slug.slice(0, 8).toUpperCase()}-STD`,
              title: "Standard Edition",
              price: data.basePrice,
              comparePrice: data.comparePrice,
              stock: data.stock,
            },
          },
          images: {
            create: data.images.map((url, i) => ({
              url,
              sortOrder: i,
              isPrimary: i === 0,
            })),
          },
        },
      });

      revalidatePath("/admin/products");
      revalidatePath("/admin/inventory");
      revalidatePath("/");
      return { success: true, productId: created.id };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Deletes a product by ID.
 * Enforces ADMIN-only authorization.
 */
export async function deleteProduct(productId: string) {
  try {
    const session = await auth();
    if (!session?.user || !isAdminRole(session.user.role)) {
      return { success: false, error: "Unauthorized: Admin privileges required to delete catalog products." };
    }

    await db.product.delete({
      where: { id: productId },
    });

    revalidatePath("/admin/products");
    revalidatePath("/admin/inventory");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Fetches all products for admin console management.
 */
export async function getAdminProducts(): Promise<{ products: ToyProduct[]; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user || !isStaffRole(session.user.role)) {
      return { products: [], error: "Unauthorized: Admin or Staff privileges required." };
    }
    const { products } = await getProducts({ limit: 100 });
    return { products };
  } catch (error: any) {
    return { products: [], error: error.message };
  }
}

/**
 * Fetches real recommended toys for gift finder quiz.
 */
export async function getGiftRecommendations(params: {
  ageRange?: string;
  maxBudget?: number;
}): Promise<ToyProduct[]> {
  try {
    const { products } = await getProducts({
      ageRange: params.ageRange,
      maxPrice: params.maxBudget ? Math.round(params.maxBudget * 1.2) : undefined,
      limit: 12,
    });
    return products;
  } catch (error) {
    console.error("Gift finder query error:", error);
    return [];
  }
}

/**
 * Adjusts inventory stock count for a variant.
 */
export async function updateVariantStock(variantId: string, delta: number) {
  try {
    const session = await auth();
    if (!session?.user || !isStaffRole(session.user.role)) {
      return { success: false, error: "Unauthorized: Admin or Staff privileges required." };
    }
    const variant = await db.productVariant.findUnique({ where: { id: variantId } });
    if (!variant) return { success: false, error: "Variant not found" };
    const newStock = Math.max(0, variant.stock + delta);
    await db.productVariant.update({
      where: { id: variantId },
      data: { stock: newStock },
    });
    revalidatePath("/admin/inventory");
    return { success: true, stock: newStock };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
