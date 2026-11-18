import { PrismaClient, Role, OrderFulfillmentStatus, CodCollectionStatus, PaymentMethod } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function seedQaFixtures() {
  console.log("🛠️ Seeding QA synthetic personas and test fixtures...");

  const hashPassword = async (pwd: string) => bcrypt.hash(pwd, 12);

  const customerPass = await hashPassword("QACustomer2026!");
  const staffPass = await hashPassword("QAStaff2026!");
  const adminPass = await hashPassword("QAAdmin2026!");
  const superAdminPass = await hashPassword("QASuperAdmin2026!");

  // 1. Customer A
  const custA = await prisma.user.upsert({
    where: { email: "qa.customer.a@example.test" },
    update: { passwordHash: customerPass, role: Role.CUSTOMER },
    create: {
      email: "qa.customer.a@example.test",
      name: "QA Customer A",
      phone: "01711111111",
      passwordHash: customerPass,
      role: Role.CUSTOMER,
      emailVerified: new Date(),
    },
  });

  // Customer A Address
  await prisma.address.deleteMany({ where: { userId: custA.id } });
  const addrA = await prisma.address.create({
    data: {
      userId: custA.id,
      label: "Home",
      fullName: "QA Customer A",
      phone: "01711111111",
      state: "Dhaka",
      city: "Dhanmondi",
      line1: "House 12, Road 4, Dhanmondi R/A",
      isDefaultShipping: true,
      isDefaultBilling: true,
    },
  });

  // 2. Customer B
  const custB = await prisma.user.upsert({
    where: { email: "qa.customer.b@example.test" },
    update: { passwordHash: customerPass, role: Role.CUSTOMER },
    create: {
      email: "qa.customer.b@example.test",
      name: "QA Customer B",
      phone: "01722222222",
      passwordHash: customerPass,
      role: Role.CUSTOMER,
      emailVerified: new Date(),
    },
  });

  // Customer B Address
  await prisma.address.deleteMany({ where: { userId: custB.id } });
  await prisma.address.create({
    data: {
      userId: custB.id,
      label: "Office",
      fullName: "QA Customer B",
      phone: "01722222222",
      state: "Chittagong",
      city: "GEC Circle",
      line1: "Tower B, Level 4",
      isDefaultShipping: true,
      isDefaultBilling: true,
    },
  });

  // 3. Staff User
  await prisma.user.upsert({
    where: { email: "qa.staff@example.test" },
    update: { passwordHash: staffPass, role: Role.STAFF },
    create: {
      email: "qa.staff@example.test",
      name: "QA Fulfillment Staff",
      phone: "01733333333",
      passwordHash: staffPass,
      role: Role.STAFF,
      emailVerified: new Date(),
    },
  });

  // 4. Admin User
  await prisma.user.upsert({
    where: { email: "qa.admin@example.test" },
    update: { passwordHash: adminPass, role: Role.ADMIN },
    create: {
      email: "qa.admin@example.test",
      name: "QA Operations Admin",
      phone: "01744444444",
      passwordHash: adminPass,
      role: Role.ADMIN,
      emailVerified: new Date(),
    },
  });

  // 5. Super Admin User
  await prisma.user.upsert({
    where: { email: "qa.superadmin@example.test" },
    update: { passwordHash: superAdminPass, role: Role.SUPER_ADMIN },
    create: {
      email: "qa.superadmin@example.test",
      name: "QA Root Super Admin",
      phone: "01755555555",
      passwordHash: superAdminPass,
      role: Role.SUPER_ADMIN,
      emailVerified: new Date(),
    },
  });

  // Find sample product for orders
  const product = await prisma.product.findFirst({
    include: { variants: true },
  });

  if (product && product.variants.length > 0) {
    const variant = product.variants[0];

    // Clean prior test orders
    await prisma.orderItem.deleteMany({
      where: { order: { userId: { in: [custA.id, custB.id] } } },
    });
    await prisma.order.deleteMany({ where: { userId: { in: [custA.id, custB.id] } } });

    // Create Order for Customer A
    const orderA = await prisma.order.create({
      data: {
        orderNumber: "KB-QA-A1001",
        userId: custA.id,
        customerName: custA.name || "Customer A",
        customerEmail: custA.email,
        customerPhone: custA.phone!,
        status: OrderFulfillmentStatus.CONFIRMED,
        codStatus: CodCollectionStatus.UNCOLLECTED,
        paymentMethod: PaymentMethod.CASH_ON_DELIVERY,
        subtotal: variant.price,
        shippingFee: 60,
        total: variant.price + 60,
        shippingAddress: {
          fullName: addrA.fullName,
          phone: addrA.phone,
          state: addrA.state,
          city: addrA.city,
          line1: addrA.line1,
        },
        items: {
          create: {
            productId: product.id,
            variantId: variant.id,
            nameSnapshot: product.name,
            skuSnapshot: variant.sku,
            unitPrice: variant.price,
            quantity: 1,
            lineTotal: variant.price,
          },
        },
      },
    });

    console.log(`✓ Order A created for Customer A: ${orderA.orderNumber} (ID: ${orderA.id})`);

    // Create Order for Customer B
    const orderB = await prisma.order.create({
      data: {
        orderNumber: "KB-QA-B2001",
        userId: custB.id,
        customerName: custB.name || "Customer B",
        customerEmail: custB.email,
        customerPhone: custB.phone!,
        status: OrderFulfillmentStatus.SHIPPED,
        codStatus: CodCollectionStatus.UNCOLLECTED,
        paymentMethod: PaymentMethod.CASH_ON_DELIVERY,
        subtotal: variant.price,
        shippingFee: 120,
        total: variant.price + 120,
        trackingNumber: "STEADFAST-QA-999",
        carrier: "Steadfast Courier",
        shippingAddress: {
          fullName: "QA Customer B",
          phone: "01722222222",
          state: "Chittagong",
          city: "GEC Circle",
          line1: "Tower B, Level 4",
        },
        items: {
          create: {
            productId: product.id,
            variantId: variant.id,
            nameSnapshot: product.name,
            skuSnapshot: variant.sku,
            unitPrice: variant.price,
            quantity: 1,
            lineTotal: variant.price,
          },
        },
      },
    });

    console.log(`✓ Order B created for Customer B: ${orderB.orderNumber} (ID: ${orderB.id})`);
  }

  console.log("✅ Synthetic QA personas and test fixtures seeded successfully!");
}

if (require.main === module) {
  seedQaFixtures()
    .catch(console.error)
    .finally(async () => {
      await prisma.$disconnect();
    });
}
