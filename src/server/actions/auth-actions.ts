"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { normalizeIdentifier, isValidBDPhone, isValidEmail } from "@/lib/auth-utils";
import { checkRateLimit } from "@/lib/rate-limit";
import bcrypt from "bcryptjs";
import { z } from "zod";

const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().refine((val) => isValidBDPhone(val), {
    message: "Must be a valid Bangladeshi mobile number (01[3-9]XXXXXXXX)",
  }),
  email: z.string().optional().or(z.literal("")),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  isAdult: z.boolean().refine((val) => val === true, {
    message: "You must confirm you are 18 years or older",
  }),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;

export async function registerUser(input: RegisterInput) {
  try {
    const validated = RegisterSchema.parse(input);
    const normalizedPhone = normalizeIdentifier(validated.phone);

    // Rate-limiting: Max 5 registration attempts per 15 minutes per phone
    const rateCheck = checkRateLimit(`register:${normalizedPhone}`, { limit: 5, windowMs: 15 * 60 * 1000 });
    if (!rateCheck.success) {
      return {
        success: false,
        error: `Too many registration attempts. Please wait ${rateCheck.retryAfterSec} seconds before trying again.`,
      };
    }

    let email = validated.email ? validated.email.trim().toLowerCase() : "";
    if (email && !isValidEmail(email)) {
      return { success: false, error: "Please enter a valid email address." };
    }

    if (!email) {
      email = `${normalizedPhone}@khelnabazar.user`;
    }

    // Check for duplicate phone
    const existingPhone = await db.user.findFirst({
      where: { phone: normalizedPhone },
    });

    if (existingPhone) {
      return {
        success: false,
        error: "An account with this mobile number already exists. Please sign in instead.",
      };
    }

    // Check for duplicate email
    const existingEmail = await db.user.findUnique({
      where: { email },
    });

    if (existingEmail) {
      return {
        success: false,
        error: "An account with this email address already exists. Please sign in instead.",
      };
    }

    // Hash password with bcrypt cost 12
    const passwordHash = await bcrypt.hash(validated.password, 12);

    // Create user with 100 welcome loyalty points
    const user = await db.user.create({
      data: {
        name: validated.name.trim(),
        phone: normalizedPhone,
        email,
        passwordHash,
        role: "CUSTOMER",
        loyaltyPoints: 100,
        tier: "BRONZE",
        loyaltyHistory: {
          create: {
            points: 100,
            reason: "Welcome Sign Up Bonus (PlayPoints)",
          },
        },
      },
    });

    return {
      success: true,
      userId: user.id,
      email: user.email,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to create account. Please try again.",
    };
  }
}

export async function updateUserProfile(input: { name: string; phone: string; email?: string }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized: You must be logged in to update your profile." };
    }

    if (!input.name || input.name.trim().length < 2) {
      return { success: false, error: "Name must be at least 2 characters." };
    }

    const cleanPhone = normalizeIdentifier(input.phone);
    if (!isValidBDPhone(cleanPhone)) {
      return { success: false, error: "Must be a valid Bangladeshi mobile number (01[3-9]XXXXXXXX)." };
    }

    const phoneOwner = await db.user.findFirst({
      where: { phone: cleanPhone, id: { not: session.user.id } },
    });
    if (phoneOwner) {
      return { success: false, error: "This mobile phone number is already registered to another account." };
    }

    const cleanEmail = input.email ? input.email.trim().toLowerCase() : undefined;
    if (cleanEmail && !isValidEmail(cleanEmail)) {
      return { success: false, error: "Invalid email address format." };
    }

    if (cleanEmail) {
      const emailOwner = await db.user.findFirst({
        where: { email: cleanEmail, id: { not: session.user.id } },
      });
      if (emailOwner) {
        return { success: false, error: "This email address is already in use by another account." };
      }
    }

    await db.user.update({
      where: { id: session.user.id },
      data: {
        name: input.name.trim(),
        phone: cleanPhone,
        ...(cleanEmail ? { email: cleanEmail } : {}),
      },
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update profile." };
  }
}

export async function updateUserPassword(input: { currentPassword?: string; newPassword: string }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized: You must be logged in." };
    }

    if (!input.newPassword || input.newPassword.length < 8) {
      return { success: false, error: "New password must be at least 8 characters long." };
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { passwordHash: true },
    });

    if (!user) {
      return { success: false, error: "User not found." };
    }

    if (user.passwordHash) {
      if (!input.currentPassword) {
        return { success: false, error: "Current password is required." };
      }
      const valid = await bcrypt.compare(input.currentPassword, user.passwordHash);
      if (!valid) {
        return { success: false, error: "Current password is incorrect." };
      }
    }

    const newHash = await bcrypt.hash(input.newPassword, 12);
    await db.user.update({
      where: { id: session.user.id },
      data: { passwordHash: newHash },
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update password." };
  }
}
