"use server";

import { updateStoreSettings, getStoreSettings, getPublicStoreSettings } from "@/server/services/settings-service";
import { assertPermission } from "@/lib/permissions";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const UpdateSettingsSchema = z.object({
  storeName: z.string().min(2, "Store name must be at least 2 characters").optional(),
  legalName: z.string().min(2, "Legal name must be at least 2 characters").optional(),
  hotline: z.string().optional(),
  supportEmail: z.string().email("Invalid email address").optional().or(z.literal("")),
  address: z.string().optional(),
  tradeLicense: z.string().optional(),
  binNumber: z.string().optional(),
  tinNumber: z.string().optional(),
  insideDhakaRate: z.number().nonnegative("Inside Dhaka rate must be non-negative").nullable().optional(),
  outsideDhakaRate: z.number().nonnegative("Outside Dhaka rate must be non-negative").nullable().optional(),
  expressDhakaRate: z.number().nonnegative("Express Dhaka rate must be non-negative").nullable().optional(),
  freeShippingThreshold: z.number().nonnegative("Free shipping threshold must be non-negative").nullable().optional(),
  giftWrapFee: z.number().nonnegative("Gift wrap fee must be non-negative").nullable().optional(),
  shippingConfigured: z.boolean().optional(),
  announcementText: z.string().optional(),
  announcementActive: z.boolean().optional(),
  enableCod: z.boolean().optional(),
  enableBkash: z.boolean().optional(),
  enableNagad: z.boolean().optional(),
  bkashMerchantNumber: z.string().optional(),
  nagadMerchantNumber: z.string().optional(),
  maintenanceMode: z.boolean().optional(),
  facebookUrl: z.string().optional(),
  instagramUrl: z.string().optional(),
  youtubeUrl: z.string().optional(),
  tiktokUrl: z.string().optional(),
});

/**
 * Restricted: Retrieves full store settings including internal/admin configuration.
 * Requires ADMIN or SUPER_ADMIN authorization.
 */
export async function getSettingsAction() {
  try {
    const perm = await assertPermission("settings.manage");
    if (!perm.success) {
      return {
        success: false,
        error: perm.error,
      };
    }

    const settings = await getStoreSettings();
    return { success: true, settings };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Public: Retrieves safe storefront settings subset (delivery rates, public contact).
 * Safe for anonymous customer storefront components.
 */
export async function getPublicSettingsAction() {
  try {
    const settings = await getPublicStoreSettings();
    return { success: true, settings };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Restricted: Updates store settings with strict Zod validation, authorization guard,
 * and immutable audit logging.
 * Requires ADMIN or SUPER_ADMIN authorization.
 */
export async function saveSettings(updates: unknown) {
  try {
    const perm = await assertPermission("settings.manage");
    if (!perm.success) {
      return {
        success: false,
        error: perm.error,
      };
    }

    const actor = perm.user;
    const parsed = UpdateSettingsSchema.safeParse(updates);
    if (!parsed.success) {
      const errMessage = parsed.error.issues.map((i) => i.message).join(", ");
      return { success: false, error: `Validation error: ${errMessage}` };
    }

    const currentSettings = await getStoreSettings();
    const updated = await updateStoreSettings(parsed.data);

    // Write immutable audit log entry
    await db.auditLog.create({
      data: {
        actorId: actor.id,
        actorEmail: actor.email,
        action: "STORE_SETTINGS_UPDATED",
        entityType: "Setting",
        entityId: "store_general_settings",
        before: currentSettings as any,
        after: updated as any,
      },
    });

    revalidatePath("/admin/settings");
    revalidatePath("/admin");
    revalidatePath("/");
    return { success: true, settings: updated };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
