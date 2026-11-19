"use server";

import { adjustVariantStock } from "@/server/services/inventory-service";
import { assertPermission } from "@/lib/permissions";
import { revalidatePath } from "next/cache";

export async function restockSku(variantId: string, delta: number, actorName = "Admin Staff") {
  try {
    const perm = await assertPermission("inventory.adjust");
    if (!perm.success) {
      return { success: false, error: perm.error };
    }

    const resolvedActor = perm.user.name || perm.user.email || actorName;

    const result = await adjustVariantStock({
      variantId,
      delta,
      reason: delta > 0 ? "RESTOCK" : "AUDIT",
      actorName: resolvedActor,
    });

    revalidatePath("/admin/inventory");
    revalidatePath("/admin");
    revalidatePath("/");
    return { success: true, newStock: result.variant.stock };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
