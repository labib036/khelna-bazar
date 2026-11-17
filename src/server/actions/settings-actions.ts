"use server";

import { updateStoreSettings } from "@/server/services/settings-service";
import { auth } from "@/lib/auth";
import { StoreSettings } from "@/types/store";
import { revalidatePath } from "next/cache";

export async function saveSettings(updates: Partial<StoreSettings>) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized: Admin privileges required to update store settings." };
    }

    const updated = await updateStoreSettings(updates);
    revalidatePath("/admin/settings");
    revalidatePath("/admin");
    revalidatePath("/");
    return { success: true, settings: updated };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
