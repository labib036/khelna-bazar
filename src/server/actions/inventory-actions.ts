"use server";

import { adjustVariantStock } from "@/server/services/inventory-service";
import { auth } from "@/lib/auth";
import { isStaffRole } from "@/lib/authorization-guards";
import { revalidatePath } from "next/cache";

export async function restockSku(variantId: string, delta: number, actorName = "Admin Staff") {
  try {
    const session = await auth();
    if (!session?.user || !isStaffRole(session.user.role)) {
      return { success: false, error: "Unauthorized: Admin or Staff privileges required to adjust warehouse inventory." };
    }

    const resolvedActor = session.user.name || session.user.email || actorName;

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
