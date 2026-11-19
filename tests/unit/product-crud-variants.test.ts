import { describe, it, expect, vi, beforeEach } from "vitest";
import { saveProduct, deleteProduct } from "@/server/actions/product-actions";
import { generateServerOrderNumber, placeOrder } from "@/server/actions/order-actions";

const { mocks } = vi.hoisted(() => {
  return {
    mocks: {
      session: { user: { id: "admin-1", role: "ADMIN", name: "Operations Admin" } } as any,
      products: new Map<string, any>(),
      variants: new Map<string, any>(),
      productImages: new Map<string, any[]>(),
      auditLogs: [] as any[],
    },
  };
});

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(async () => mocks.session),
}));

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: vi.fn(() => ({ success: true, retryAfterSec: 0 })),
}));

// In-memory mock db
vi.mock("@/lib/db", () => {
  const fakeDb: any = {
    product: {
      findUnique: vi.fn(async ({ where, include }: any) => {
        let p = null;
        if (where.id) p = mocks.products.get(where.id);
        if (where.slug) {
          for (const item of mocks.products.values()) {
            if (item.slug === where.slug) { p = item; break; }
          }
        }
        if (!p) return null;
        const res = { ...p };
        if (include?.images) res.images = mocks.productImages.get(p.id) || [];
        if (include?.variants) {
          res.variants = Array.from(mocks.variants.values()).filter((v: any) => v.productId === p.id);
        }
        return res;
      }),
      findFirst: vi.fn(async ({ where }: any) => {
        for (const item of mocks.products.values()) {
          if (where.slug && item.slug === where.slug && (!where.id?.not || item.id !== where.id.not)) {
            return item;
          }
        }
        return null;
      }),
      create: vi.fn(async ({ data }: any) => {
        const id = `prod-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        const { variants, categories, images, ...fields } = data;
        const record = { id, ...fields };
        mocks.products.set(id, record);

        if (variants?.create) {
          const varId = `var-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
          mocks.variants.set(varId, { id: varId, productId: id, ...variants.create });
        }
        if (images?.create) {
          mocks.productImages.set(
            id,
            images.create.map((img: any, idx: number) => ({ id: `img-${idx}`, productId: id, ...img }))
          );
        }
        return record;
      }),
      update: vi.fn(async ({ where, data }: any) => {
        const existing = mocks.products.get(where.id);
        if (!existing) throw new Error("Product not found");
        const updated = { ...existing, ...data };
        mocks.products.set(where.id, updated);
        return updated;
      }),
    },
    productVariant: {
      findFirst: vi.fn(async ({ where }: any) => {
        for (const v of mocks.variants.values()) {
          if (where.productId && v.productId === where.productId) return v;
          if (where.sku && v.sku === where.sku) return v;
        }
        return null;
      }),
      create: vi.fn(async ({ data }: any) => {
        const id = `var-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        const record = { id, ...data };
        mocks.variants.set(id, record);
        return record;
      }),
      update: vi.fn(async ({ where, data }: any) => {
        const existing = mocks.variants.get(where.id);
        if (!existing) throw new Error("Variant not found");
        const updated = { ...existing, ...data };
        mocks.variants.set(where.id, updated);
        return updated;
      }),
    },
    productImage: {
      deleteMany: vi.fn(async ({ where }: any) => {
        mocks.productImages.delete(where.productId);
        return { count: 1 };
      }),
      createMany: vi.fn(async ({ data }: any) => {
        if (!data || !data.length) return { count: 0 };
        const pId = data[0].productId;
        mocks.productImages.set(pId, data.map((d: any, idx: number) => ({ id: `img-${idx}`, ...d })));
        return { count: data.length };
      }),
    },
    category: {
      findUnique: vi.fn(async () => ({ id: "cat-default", name: "Toys", slug: "toys" })),
      findFirst: vi.fn(async () => ({ id: "cat-default", name: "Toys", slug: "toys" })),
      create: vi.fn(async ({ data }: any) => ({ id: "cat-1", ...data })),
    },
    brand: {
      findUnique: vi.fn(async () => ({ id: "brand-1", name: "Khelna Bazar", slug: "khelna-bazar" })),
      findFirst: vi.fn(async () => ({ id: "brand-1", name: "Khelna Bazar", slug: "khelna-bazar" })),
      create: vi.fn(async ({ data }: any) => ({ id: "brand-1", ...data })),
    },
    auditLog: {
      create: vi.fn(async ({ data }: any) => {
        mocks.auditLogs.push(data);
        return { id: `audit-${Date.now()}`, ...data };
      }),
    },
    order: {
      findUnique: vi.fn(async () => null),
    },
    $transaction: vi.fn(async (callback: any) => {
      if (typeof callback === "function") {
        return callback(fakeDb);
      }
      return Promise.all(callback);
    }),
  };
  return { db: fakeDb };
});

describe("Phase 2 Regression Tests: Product CRUD, Images, Variants, and Panel Ordering", () => {
  beforeEach(() => {
    mocks.session = { user: { id: "admin-1", role: "ADMIN", name: "Operations Admin" } };
    mocks.products.clear();
    mocks.variants.clear();
    mocks.productImages.clear();
    mocks.auditLogs = [];
  });

  it("F-21: Rejects comparePrice < basePrice validation error", async () => {
    const res = await saveProduct({
      name: "RC High Speed Car",
      basePrice: 1500,
      comparePrice: 1200, // Invalid: comparePrice < basePrice
      stock: 10,
      categorySlug: "remote-control",
    });

    expect(res.success).toBe(false);
    expect(res.error).toMatch(/Compare price must be greater than or equal to regular price/i);
  });

  it("F-03: Rejects saveProduct if non-privileged role calls it", async () => {
    mocks.session = { user: { id: "cust-1", role: "CUSTOMER", name: "Retail Customer" } };
    const res = await saveProduct({
      name: "Wooden Blocks",
      basePrice: 500,
      stock: 5,
      categorySlug: "montessori",
    });

    expect(res.success).toBe(false);
    expect(res.error).toMatch(/Unauthorized/i);
  });

  it("F-15, F-17: Creates product with stable SKU, persists images and creates audit log", async () => {
    const res = await saveProduct({
      name: "STEM Solar Robot Kit",
      basePrice: 2200,
      comparePrice: 2800,
      stock: 25,
      categorySlug: "stem",
      images: [
        "https://blob.vercel-storage.com/stem-robot-front.webp",
        "https://blob.vercel-storage.com/stem-robot-box.webp",
      ],
      material: "BPA-Free ABS Plastic",
      batteryInfo: "Solar Powered, No Battery Required",
      chokingHazard: false,
    });

    expect(res.success).toBe(true);
    expect(res.productId).toBeDefined();

    const savedProd = mocks.products.get(res.productId!);
    expect(savedProd).toBeDefined();
    expect(savedProd.name).toBe("STEM Solar Robot Kit");
    expect(savedProd.material).toBe("BPA-Free ABS Plastic");
    expect(savedProd.batteryInfo).toBe("Solar Powered, No Battery Required");

    // Check images
    const images = mocks.productImages.get(res.productId!);
    expect(images).toBeDefined();
    expect(images?.length).toBe(2);
    expect(images?.[0].isPrimary).toBe(true);
    expect(images?.[1].isPrimary).toBe(false);

    // Check variant
    const variant = Array.from(mocks.variants.values()).find((v: any) => v.productId === res.productId);
    expect(variant).toBeDefined();
    expect(variant?.sku).toMatch(/^KB-[A-Z0-9]+-1$/);
    expect(variant?.stock).toBe(25);
    expect(variant?.price).toBe(2200);

    // Check audit log
    expect(mocks.auditLogs.length).toBeGreaterThan(0);
    expect(mocks.auditLogs[0].action).toBe("PRODUCT_CREATED");
  });

  it("F-16, F-17: Updating product updates existing variant without duplicating it and updates images/status", async () => {
    // 1. Create product first
    const createRes = await saveProduct({
      name: "Spinning Top Vintage Latim",
      basePrice: 350,
      stock: 50,
      categorySlug: "traditional",
      images: ["https://blob.vercel-storage.com/latim-1.webp"],
    });

    const prodId = createRes.productId!;
    const variantsBefore = Array.from(mocks.variants.values()).filter((v: any) => v.productId === prodId);
    expect(variantsBefore.length).toBe(1);
    const originalVariantId = variantsBefore[0].id;
    const originalSku = variantsBefore[0].sku;

    // 2. Update product
    const updateRes = await saveProduct({
      id: prodId,
      name: "Spinning Top Vintage Latim",
      basePrice: 400,
      comparePrice: 500,
      stock: 75,
      categorySlug: "traditional",
      status: "ACTIVE",
      material: "Handcrafted Solid Teak Wood",
      images: [
        "https://blob.vercel-storage.com/latim-updated-main.webp",
        "https://blob.vercel-storage.com/latim-spinning.webp",
      ],
    });

    expect(updateRes.success).toBe(true);

    // Verify variants NOT duplicated (F-17)
    const variantsAfter = Array.from(mocks.variants.values()).filter((v: any) => v.productId === prodId);
    expect(variantsAfter.length).toBe(1);
    expect(variantsAfter[0].id).toBe(originalVariantId);
    expect(variantsAfter[0].sku).toBe(originalSku);
    expect(variantsAfter[0].price).toBe(400);
    expect(variantsAfter[0].stock).toBe(75);

    // Verify images updated (F-16)
    const imagesAfter = mocks.productImages.get(prodId);
    expect(imagesAfter?.length).toBe(2);
    expect(imagesAfter?.[0].url).toBe("https://blob.vercel-storage.com/latim-updated-main.webp");

    // Verify fields updated
    const updatedProd = mocks.products.get(prodId);
    expect(updatedProd.material).toBe("Handcrafted Solid Teak Wood");
    expect(updatedProd.status).toBe("ACTIVE");
  });

  it("F-20: deleteProduct executes soft delete with deletedAt timestamp and ARCHIVED status", async () => {
    const createRes = await saveProduct({
      name: "Discontinued Board Game",
      basePrice: 950,
      stock: 2,
      categorySlug: "board-games",
    });

    const prodId = createRes.productId!;
    const delRes = await deleteProduct(prodId);
    expect(delRes.success).toBe(true);

    const archivedProd = mocks.products.get(prodId);
    expect(archivedProd.status).toBe("ARCHIVED");
    expect(archivedProd.deletedAt).toBeInstanceOf(Date);
  });

  it("F-22: generateServerOrderNumber creates KB-YYMMDD-XXXX format", async () => {
    const fakeDb = {
      order: {
        findUnique: vi.fn(async () => null),
      },
    };
    const orderNum = await generateServerOrderNumber(fakeDb);
    expect(orderNum).toMatch(/^KB-\d{6}-\d{6}$/);
  });

  it("Strict Panel Isolation: placeOrder rejects order placement if session has ADMIN or STAFF role", async () => {
    mocks.session = { user: { id: "admin-1", role: "ADMIN", name: "Store Admin" } };

    const orderRes = await placeOrder({
      fullName: "Admin Placer",
      phone: "01712039707",
      email: "admin@khelnabazar.com",
      division: "Dhaka",
      cityArea: "Uttara",
      fullAddress: "Sector 3, House 1",
      deliveryZone: "inside_dhaka",
      paymentMethod: "CASH_ON_DELIVERY",
      inspectionAcknowledged: true,
      items: [{ variantId: "var-1", quantity: 1, giftWrap: false }],
    });

    expect(orderRes.success).toBe(false);
    expect(orderRes.error).toMatch(/ADMIN_CANNOT_ORDER/i);
  });
});
