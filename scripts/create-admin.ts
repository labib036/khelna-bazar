import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const prisma = new PrismaClient();

function generateSecurePassword(): string {
  return crypto.randomBytes(12).toString("base64url").slice(0, 16) + "!A1";
}

async function main() {
  console.log("=======================================================");
  console.log("🛡️  Khelna Bazar: First Administrator Account Creation");
  console.log("=======================================================\n");

  const email = process.env.ADMIN_EMAIL || process.argv[2];
  const rawPhone = process.env.ADMIN_PHONE || process.argv[3] || "01712039707";
  const name = process.env.ADMIN_NAME || process.argv[4] || "Store Administrator";
  const providedPassword = process.env.ADMIN_PASSWORD || process.argv[5];

  if (!email) {
    console.error("❌ Error: ADMIN_EMAIL is required via environment variable or CLI argument.");
    console.log("Usage: npx tsx scripts/create-admin.ts <admin-email> [admin-phone] [admin-name]");
    process.exit(1);
  }

  // Validate phone format
  const phone = rawPhone.replace(/[\s\-()]/g, "");
  if (!/^(\+?88)?01[3-9]\d{8}$/.test(phone)) {
    console.error("❌ Error: Invalid Bangladeshi mobile number format. Expected: 01[3-9]XXXXXXXX");
    process.exit(1);
  }

  const password = providedPassword || generateSecurePassword();
  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name,
      phone,
      passwordHash,
      role: Role.ADMIN,
      emailVerified: new Date(),
    },
    create: {
      email,
      name,
      phone,
      passwordHash,
      role: Role.ADMIN,
      emailVerified: new Date(),
      loyaltyPoints: 1000,
      tier: "GOLD",
    },
  });

  console.log("✅ Administrator account successfully provisioned!");
  console.log("-------------------------------------------------------");
  console.log(`👤 Name:     ${user.name}`);
  console.log(`📧 Email:    ${user.email}`);
  console.log(`📱 Phone:    ${user.phone}`);
  console.log(`🔑 Role:     ${user.role}`);
  console.log(`🔒 One-Time Password: ${password}`);
  console.log("-------------------------------------------------------");
  console.log("⚠️  IMPORTANT SECURITY NOTICE:");
  console.log("1. Record this temporary password immediately.");
  console.log("2. Sign in at /login and change your password in the admin settings.");
  console.log("3. Never commit this password or share it with unauthorized staff.\n");
}

main()
  .catch((e) => {
    console.error("❌ Failed to create administrator account:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
