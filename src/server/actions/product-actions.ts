"use server";

import { db } from "@/lib/db";
import { assertPermission } from "@/lib/permissions";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getProducts } from "@/server/services/product-service";
import { ToyProduct } from "@/types/store";
import crypto from "crypto";

const ProductInputSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Product name must be at least 2 characters"),
  slug: z.string().optional(),
  brandName: z.string().default("Khelna Bazar"),
  categorySlug: z.string().default("toys"),
  basePrice: z.number().int().min(1, "Price must be at least ৳1"),
  comparePrice: z.number().int().optional().nullable(),
  stock: z.number().int().min(0, "Stock cannot be negative").default(0),
  shortDesc: z.string().optional(),
  descriptionHtml: z.string().default(""),
  images: z.array(z.string()).default([]),
  minAgeMonths: z.number().int().optional().nullable(),
  maxAgeMonths: z.number().int().optional().nullable(),
  chokingHazard: z.boolean().default(false),
  chokingWarning: z.string().optional().nullable(),
  material: z.string().optional().nullable(),
  batteryInfo: z.string().optional().nullable(),
  certifications: z.array(z.string()).default([]),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).default("DRAFT"),
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
 * Creates or updates a catalog toy product.
 * Enforces products.edit permission, variant stability, and atomic image persistence.
 */
export async function saveProduct(input: ProductInput) {
  try {
    const perm = await assertPermission("products.edit");
    if (!perm.success) {
      return { success: false, error: perm.error };
    }
    const actor = perm.user;

    const data = ProductInputSchema.parse(input);

    // Business Rule Validation
    if (data.status === "ACTIVE" && data.images.length === 0) {
      return {
        success: false,
        error: "Active products must have at least one product photo before publishing.",
      };
    }

    if (
      data.comparePrice !== null &&
      data.comparePrice !== undefined &&
      data.comparePrice < data.basePrice
    ) {
      return {
        success: false,
        error: "Compare price must be greater than or equal to regular price.",
      };
    }

    let slug = data.slug || slugify(data.name);
    if (!slug) slug = `toy-${Date.now()}`;

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
    const brandSlug = slugify(data.brandName) || "khelna-bazar";
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
      // -------------------------------------------------------------
      // UPDATE BRANCH (Fix F-16 & F-17)
      // -------------------------------------------------------------
      const existingProduct = await db.product.findUnique({
        where: { id: data.id },
        include: { variants: true },
      });

      if (!existingProduct) {
        return { success: false, error: "Product not found." };
      }

      const updated = await db.$transaction(async (tx) => {
        // 1. Update product root record with all fields
        const prod = await tx.product.update({
          where: { id: data.id },
          data: {
            name: data.name,
            slug,
            status: data.status as any,
            basePrice: data.basePrice,
            comparePrice: data.comparePrice,
            shortDesc: data.shortDesc || "",
            descriptionHtml: data.descriptionHtml || `<p>${data.name}</p>`,
            minAgeMonths: data.minAgeMonths ?? 36,
            maxAgeMonths: data.maxAgeMonths ?? 144,
            chokingHazard: data.chokingHazard,
            chokingWarning: data.chokingWarning || null,
            material: data.material || null,
            batteryInfo: data.batteryInfo || null,
            certifications: data.certifications,
            brandId: brand.id,
            categories: {
              set: [{ id: category.id }],
            },
          },
        });

        // 2. Stable variant update (never create a duplicate variant on edit)
        const primaryVariant = existingProduct.variants[0];
        if (primaryVariant) {
          await tx.productVariant.update({
            where: { id: primaryVariant.id },
            data: {
              title: data.name,
              price: data.basePrice,
              comparePrice: data.comparePrice,
              stock: data.stock,
            },
          });
        } else {
          await tx.productVariant.create({
            data: {
              productId: prod.id,
              sku: `KB-${prod.id.slice(-6).toUpperCase()}-1`,
              title: "Standard Edition",
              price: data.basePrice,
              comparePrice: data.comparePrice,
              stock: data.stock,
            },
          });
        }

        // 3. Atomically persist images in database
        await tx.productImage.deleteMany({
          where: { productId: data.id },
        });

        if (data.images.length > 0) {
          await tx.productImage.createMany({
            data: data.images.map((url, i) => ({
              productId: prod.id,
              url,
              sortOrder: i,
              isPrimary: i === 0,
              alt: `${data.name} - Photo ${i + 1}`,
            })),
          });
        }

        // 4. Audit Log entry
        await tx.auditLog.create({
          data: {
            actorId: actor.id,
            actorEmail: actor.email,
            action: "PRODUCT_UPDATED",
            entityType: "Product",
            entityId: prod.id,
            before: {
              name: existingProduct.name,
              basePrice: existingProduct.basePrice,
              status: existingProduct.status,
            },
            after: {
              name: prod.name,
              basePrice: prod.basePrice,
              status: prod.status,
            },
          },
        });

        return prod;
      });

      revalidatePath("/admin/products");
      revalidatePath("/admin/inventory");
      revalidatePath("/");
      revalidatePath(`/p/${slug}`);
      revalidatePath(`/c/${data.categorySlug}`);
      return { success: true, productId: updated.id };
    } else {
      // -------------------------------------------------------------
      // CREATE BRANCH
      // -------------------------------------------------------------
      // Ensure slug uniqueness
      const existingSlug = await db.product.findUnique({ where: { slug } });
      if (existingSlug) {
        slug = `${slug}-${crypto.randomBytes(3).toString("hex")}`;
      }

      const stableSku = `KB-${crypto.randomBytes(4).toString("hex").toUpperCase()}-1`;

      const created = await db.$transaction(async (tx) => {
        const prod = await tx.product.create({
          data: {
            name: data.name,
            slug,
            status: data.status as any,
            basePrice: data.basePrice,
            comparePrice: data.comparePrice,
            shortDesc: data.shortDesc || "",
            descriptionHtml: data.descriptionHtml || `<p>${data.name}</p>`,
            minAgeMonths: data.minAgeMonths ?? 36,
            maxAgeMonths: data.maxAgeMonths ?? 144,
            chokingHazard: data.chokingHazard,
            chokingWarning: data.chokingWarning || null,
            material: data.material || null,
            batteryInfo: data.batteryInfo || null,
            certifications: data.certifications,
            brandId: brand.id,
            categories: {
              connect: [{ id: category.id }],
            },
            variants: {
              create: {
                sku: stableSku,
                title: data.name,
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
                alt: `${data.name} - Photo ${i + 1}`,
              })),
            },
          },
        });

        // Audit Log
        await tx.auditLog.create({
          data: {
            actorId: actor.id,
            actorEmail: actor.email,
            action: "PRODUCT_CREATED",
            entityType: "Product",
            entityId: prod.id,
            after: { name: prod.name, basePrice: prod.basePrice, status: prod.status },
          },
        });

        return prod;
      });

      revalidatePath("/admin/products");
      revalidatePath("/admin/inventory");
      revalidatePath("/");
      revalidatePath(`/c/${data.categorySlug}`);
      return { success: true, productId: created.id };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Soft deletes/archives a product.
 * Preserves historical orders and reviews without foreign key errors.
 */
export async function deleteProduct(productId: string) {
  try {
    const perm = await assertPermission("products.delete");
    if (!perm.success) {
      return { success: false, error: perm.error };
    }
    const actor = perm.user;

    const updated = await db.product.update({
      where: { id: productId },
      data: {
        deletedAt: new Date(),
        status: "ARCHIVED",
      },
    });

    await db.auditLog.create({
      data: {
        actorId: actor.id,
        actorEmail: actor.email,
        action: "PRODUCT_ARCHIVED",
        entityType: "Product",
        entityId: productId,
      },
    });

    revalidatePath("/admin/products");
    revalidatePath("/admin/inventory");
    revalidatePath("/");
    return { success: true, productId: updated.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Fetches all products for admin console management (excluding soft-deleted).
 */
export async function getAdminProducts(): Promise<{ products: ToyProduct[]; error?: string }> {
  try {
    const perm = await assertPermission("products.view");
    if (!perm.success) {
      return { products: [], error: perm.error };
    }
    const { products } = await getProducts({ limit: 100 });
    return { products };
  } catch (error: any) {
    return { products: [], error: error.message };
  }
}

/**
 * Fetches recommended toys for gift finder quiz.
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
    const perm = await assertPermission("inventory.adjust");
    if (!perm.success) {
      return { success: false, error: perm.error };
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
