import { db } from "@/lib/db";
import { StoreSettings } from "@/types/store";

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  storeName: "Khelna Bazar",
  legalName: "Khelna Bazar",
  hotline: process.env.STORE_HOTLINE || "",
  supportEmail: process.env.STORE_EMAIL || "",
  address: process.env.STORE_ADDRESS || "",
  tradeLicense: process.env.STORE_TRADE_LICENSE || "",
  binNumber: process.env.STORE_BIN || "",
  tinNumber: process.env.STORE_TIN || "",
  insideDhakaRate: 60,
  outsideDhakaRate: 120,
  expressDhakaRate: 150,
  freeShippingThreshold: 1500,
  giftWrapFee: 50,
  announcementText: "Free delivery across Bangladesh on orders over ৳1,500 | 100% Authentic Child-Safe Toys",
  announcementActive: true,
  enableCod: true,
  enableBkash: true,
  enableNagad: true,
  bkashMerchantNumber: process.env.BKASH_MERCHANT_NUMBER || "",
  nagadMerchantNumber: process.env.NAGAD_MERCHANT_NUMBER || "",
  maintenanceMode: false,
  facebookUrl: "",
  instagramUrl: "",
  youtubeUrl: "",
  tiktokUrl: "",
};

const SETTINGS_KEY = "store_general_settings";

/**
 * Retrieves store settings from the database.
 * Falls back to DEFAULT_STORE_SETTINGS if settings have not been initialized yet.
 */
export async function getStoreSettings(): Promise<StoreSettings> {
  try {
    const settingRecord = await db.setting.findUnique({
      where: { key: SETTINGS_KEY },
    });

    if (settingRecord && settingRecord.value && typeof settingRecord.value === "object") {
      return {
        ...DEFAULT_STORE_SETTINGS,
        ...(settingRecord.value as unknown as Partial<StoreSettings>),
      };
    }
  } catch (error) {
    console.error("Failed to read settings from database:", (error as Error).message);
  }

  return DEFAULT_STORE_SETTINGS;
}

/**
 * Updates store settings in the database.
 */
export async function updateStoreSettings(updates: Partial<StoreSettings>): Promise<StoreSettings> {
  const current = await getStoreSettings();
  const merged: StoreSettings = { ...current, ...updates };

  await db.setting.upsert({
    where: { key: SETTINGS_KEY },
    update: {
      value: merged as unknown as object,
    },
    create: {
      key: SETTINGS_KEY,
      value: merged as unknown as object,
    },
  });

  return merged;
}
