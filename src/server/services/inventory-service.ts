import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

export interface StockAdjustmentInput {
  variantId: string;
  delta: number;
  reason: "RESTOCK" | "ORDER_FULFILLMENT" | "DAMAGE" | "RETURN_RESTOCK" | "AUDIT";
  actorName?: string;
  orderId?: string | null;
}

/**
 * Updates stock for a product variant and records an immutable StockMovement entry.
 */
export async function adjustVariantStock(
  input: StockAdjustmentInput,
  tx?: Prisma.TransactionClient
) {
  const client = tx || db;

  // Retrieve current variant to prevent negative stock
  const variant = await client.productVariant.findUnique({
    where: { id: input.variantId },
    select: { id: true, stock: true, sku: true, title: true },
  });

  if (!variant) {
    throw new Error(`Product variant with ID "${input.variantId}" not found.`);
  }

  const newStock = variant.stock + input.delta;
  if (newStock < 0) {
    throw new Error(`Insufficient stock for "${variant.title}" (${variant.sku}). Available: ${variant.stock}, Requested: ${Math.abs(input.delta)}.`);
  }

  const [updatedVariant, movement] = await Promise.all([
    client.productVariant.update({
      where: { id: input.variantId },
      data: { stock: newStock },
    }),
    client.stockMovement.create({
      data: {
        variantId: input.variantId,
        delta: input.delta,
        reason: input.reason,
        actorName: input.actorName || "System",
        orderId: input.orderId || null,
      },
    }),
  ]);

  return { variant: updatedVariant, movement };
}

/**
 * Retrieves inventory listing for the admin operations console.
 */
export async function getInventoryList() {
  try {
    const variants = await db.productVariant.findMany({
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            status: true,
          },
        },
      },
      orderBy: {
        stock: "asc",
      },
    });

    return variants.map((v) => ({
      id: v.id,
      sku: v.sku,
      title: v.title,
      toyName: v.product.name,
      toySlug: v.product.slug,
      price: v.price,
      stock: v.stock,
      lowStockThreshold: v.lowStockThreshold,
      status: v.stock === 0 ? "OUT_OF_STOCK" : v.stock <= v.lowStockThreshold ? "LOW_STOCK" : "HEALTHY",
    }));
  } catch (error) {
    console.error("Failed to query inventory list:", (error as Error).message);
    return [];
  }
}
