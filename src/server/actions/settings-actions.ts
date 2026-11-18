"use server";

import { updateStoreSettings, getStoreSettings } from "@/server/services/settings-service";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/authorization-guards";
import { StoreSettings } from "@/types/store";
import { revalidatePath } from "next/cache";

export async function getSettingsAction() {
  try {
    const settings = await getStoreSettings();
    return { success: true, settings };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function saveSettings(updates: Partial<StoreSettings>) {
  try {
    const session = await auth();
    if (!session?.user || !isAdminRole(session.user.role)) {
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
