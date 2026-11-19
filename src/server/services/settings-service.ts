import { db } from "@/lib/db";
import { StoreSettings, PublicStoreSettings } from "@/types/store";

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  storeName: "Khelna Bazar",
  legalName: "Khelna Bazar",
  hotline: process.env.STORE_HOTLINE || "01712-039707",
  supportEmail: process.env.STORE_EMAIL || "",
  address: process.env.STORE_ADDRESS || "",
  tradeLicense: process.env.STORE_TRADE_LICENSE || "",
  binNumber: process.env.STORE_BIN || "",
  tinNumber: process.env.STORE_TIN || "",
  insideDhakaRate: null,
  outsideDhakaRate: null,
  expressDhakaRate: null,
  freeShippingThreshold: null,
  giftWrapFee: null,
  shippingConfigured: false,
  announcementText: "Welcome to Khelna Bazar — Quality toys for play, learning, and thoughtful gifting.",
  announcementActive: false,
  enableCod: true,
  enableBkash: true,
  enableNagad: true,
  bkashMerchantNumber: "01712039707",
  nagadMerchantNumber: "01712039707",
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
      const dbValues = settingRecord.value as Record<string, unknown>;
      return {
        ...DEFAULT_STORE_SETTINGS,
        ...dbValues,
        insideDhakaRate: typeof dbValues.insideDhakaRate === "number" ? dbValues.insideDhakaRate : null,
        outsideDhakaRate: typeof dbValues.outsideDhakaRate === "number" ? dbValues.outsideDhakaRate : null,
        expressDhakaRate: typeof dbValues.expressDhakaRate === "number" ? dbValues.expressDhakaRate : null,
        freeShippingThreshold: typeof dbValues.freeShippingThreshold === "number" ? dbValues.freeShippingThreshold : null,
        giftWrapFee: typeof dbValues.giftWrapFee === "number" ? dbValues.giftWrapFee : null,
        shippingConfigured: typeof dbValues.shippingConfigured === "boolean" 
          ? dbValues.shippingConfigured 
          : (typeof dbValues.insideDhakaRate === "number" && typeof dbValues.outsideDhakaRate === "number"),
      } as StoreSettings;
    }
  } catch (error) {
    console.error("Failed to read settings from database:", (error as Error).message);
  }

  return DEFAULT_STORE_SETTINGS;
}

/**
 * Retrieves public safe subset of store settings for customer storefront.
 * Excludes sensitive fields and internal configurations.
 */
export async function getPublicStoreSettings(): Promise<PublicStoreSettings> {
  const full = await getStoreSettings();
  return {
    storeName: full.storeName,
    legalName: full.legalName,
    hotline: full.hotline,
    insideDhakaRate: full.insideDhakaRate,
    outsideDhakaRate: full.outsideDhakaRate,
    expressDhakaRate: full.expressDhakaRate,
    freeShippingThreshold: full.freeShippingThreshold,
    giftWrapFee: full.giftWrapFee,
    shippingConfigured: full.shippingConfigured,
    announcementText: full.announcementText,
    announcementActive: full.announcementActive,
    enableCod: full.enableCod,
    enableBkash: full.enableBkash,
    enableNagad: full.enableNagad,
    bkashMerchantNumber: full.bkashMerchantNumber,
    nagadMerchantNumber: full.nagadMerchantNumber,
    maintenanceMode: full.maintenanceMode,
  };
}

/**
 * Updates store settings in the database.
 */
export async function updateStoreSettings(updates: Partial<StoreSettings>): Promise<StoreSettings> {
  const current = await getStoreSettings();
  
  // Calculate if shipping is configured based on inside & outside rates
  const newInside = updates.insideDhakaRate !== undefined ? updates.insideDhakaRate : current.insideDhakaRate;
  const newOutside = updates.outsideDhakaRate !== undefined ? updates.outsideDhakaRate : current.outsideDhakaRate;
  const shippingConfigured = newInside !== null && newOutside !== null;

  const merged: StoreSettings = {
    ...current,
    ...updates,
    shippingConfigured,
  };

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
