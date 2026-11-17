"use server";

import { db } from "@/lib/db";
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
