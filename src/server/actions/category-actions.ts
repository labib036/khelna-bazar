"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { isStaffRole, isAdminRole } from "@/lib/authorization-guards";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const CategoryInputSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Name must be at least 2 characters"),
  nameBn: z.string().optional().nullable(),
  slug: z.string().min(2, "Slug must be at least 2 characters"),
  description: z.string().optional().nullable(),
  descriptionBn: z.string().optional().nullable(),
  sortOrder: z.number().int().default(0),
  isFeatured: z.boolean().default(false),
  imageUrl: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
});

export type CategoryInput = z.infer<typeof CategoryInputSchema>;

export async function getCategoriesAction() {
  try {
    const session = await auth();
    if (!session?.user || !isStaffRole(session.user.role)) {
      return { success: false, error: "Unauthorized", categories: [] };
    }

    const categories = await db.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });

    return {
      success: true,
      categories: categories.map((c) => ({
        id: c.id,
        name: c.name,
        nameBn: c.nameBn,
        slug: c.slug,
        description: c.description,
        descriptionBn: c.descriptionBn,
        sortOrder: c.sortOrder,
        isFeatured: c.isFeatured,
        image: c.image,
        productCount: c._count.products,
      })),
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to load categories", categories: [] };
  }
}

export async function saveCategoryAction(input: CategoryInput) {
  try {
    const session = await auth();
    if (!session?.user || !isAdminRole(session.user.role)) {
      return { success: false, error: "Unauthorized: Admin privileges required." };
    }

    const data = CategoryInputSchema.parse(input);
    const cleanSlug = data.slug.toLowerCase().trim().replace(/[^a-z0-9-]+/g, "-");
    const image = data.image || data.imageUrl || null;

    if (data.id) {
      await db.category.update({
        where: { id: data.id },
        data: {
          name: data.name,
          nameBn: data.nameBn,
          slug: cleanSlug,
          description: data.description,
          descriptionBn: data.descriptionBn,
          sortOrder: data.sortOrder,
          isFeatured: data.isFeatured,
          image,
        },
      });
    } else {
      await db.category.create({
        data: {
          name: data.name,
          nameBn: data.nameBn,
          slug: cleanSlug,
          description: data.description,
          descriptionBn: data.descriptionBn,
          sortOrder: data.sortOrder,
          isFeatured: data.isFeatured,
          image,
        },
      });
    }

    revalidatePath("/admin/categories");
    revalidatePath("/");
    revalidatePath("/c/all");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to save category" };
  }
}

export async function deleteCategoryAction(categoryId: string) {
  try {
    const session = await auth();
    if (!session?.user || !isAdminRole(session.user.role)) {
      return { success: false, error: "Unauthorized: Admin privileges required." };
    }

    const category = await db.category.findUnique({
      where: { id: categoryId },
      include: { _count: { select: { products: true } } },
    });

    if (!category) {
      return { success: false, error: "Category not found." };
    }

    if (category._count.products > 0) {
      return {
        success: false,
        error: `Cannot delete category "${category.name}" because it contains ${category._count.products} products. Reassign or remove these products first.`,
      };
    }

    await db.category.delete({
      where: { id: categoryId },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete category" };
  }
}
