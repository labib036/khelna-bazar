"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const AddressInputSchema = z.object({
  id: z.string().optional(),
  label: z.enum(["Home", "Office", "Other"]).default("Home"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  phone: z
    .string()
    .regex(/^(\+?88)?01[3-9]\d{8}$/, "Must be a valid Bangladeshi mobile number (01[3-9]XXXXXXXX)"),
  division: z.string().min(2, "Division / District is required"),
  city: z.string().min(2, "City or area is required"),
  line1: z.string().min(5, "Complete street address is required"),
  isDefault: z.boolean().default(false),
});

export type AddressInput = z.input<typeof AddressInputSchema>;

export interface CustomerAddress {
  id: string;
  label: "Home" | "Office" | "Other";
  fullName: string;
  phone: string;
  division: string;
  city: string;
  line1: string;
  isDefault: boolean;
  createdAt: Date;
}

/**
 * Normalizes BD phone number
 */
function normalizePhone(raw: string): string {
  let cleaned = raw.replace(/[\s\-()]/g, "");
  if (cleaned.startsWith("+8801")) cleaned = cleaned.slice(3);
  else if (cleaned.startsWith("8801")) cleaned = cleaned.slice(2);
  return cleaned;
}

/**
 * Fetches all saved addresses for the authenticated user.
 */
export async function getUserAddresses(): Promise<CustomerAddress[]> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return [];
    }

    const addresses = await db.address.findMany({
      where: { userId: session.user.id },
      orderBy: [{ isDefaultShipping: "desc" }, { createdAt: "desc" }],
    });

    return addresses.map((a) => ({
      id: a.id,
      label: (a.label as "Home" | "Office" | "Other") || "Home",
      fullName: a.fullName,
      phone: a.phone,
      division: a.state,
      city: a.city,
      line1: a.line1,
      isDefault: a.isDefaultShipping,
      createdAt: a.createdAt,
    }));
  } catch (error) {
    console.error("getUserAddresses error:", error);
    return [];
  }
}

/**
 * Saves (creates or updates) an address for the authenticated user.
 * Enforces ownership and a maximum limit of 10 addresses.
 */
export async function saveAddress(input: AddressInput) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized: Please sign in to save an address." };
    }

    const validated = AddressInputSchema.parse(input);
    const normalizedPhone = normalizePhone(validated.phone);

    if (validated.id) {
      // Update existing address - verify ownership
      const existing = await db.address.findUnique({
        where: { id: validated.id },
      });

      if (!existing || existing.userId !== session.user.id) {
        return { success: false, error: "Unauthorized: Address not found or access denied." };
      }

      await db.$transaction(async (tx) => {
        if (validated.isDefault) {
          // Unset other defaults for this user
          await tx.address.updateMany({
            where: { userId: session.user.id, isDefaultShipping: true },
            data: { isDefaultShipping: false },
          });
        }

        await tx.address.update({
          where: { id: validated.id },
          data: {
            label: validated.label,
            fullName: validated.fullName.trim(),
            phone: normalizedPhone,
            state: validated.division,
            city: validated.city.trim(),
            line1: validated.line1.trim(),
            isDefaultShipping: validated.isDefault,
          },
        });
      });
    } else {
      // Create new address - enforce maximum limit of 10
      const currentCount = await db.address.count({
        where: { userId: session.user.id },
      });

      if (currentCount >= 10) {
        return {
          success: false,
          error: "Address limit reached. You can save up to 10 delivery addresses.",
        };
      }

      const isFirst = currentCount === 0;
      const shouldBeDefault = validated.isDefault || isFirst;

      await db.$transaction(async (tx) => {
        if (shouldBeDefault && !isFirst) {
          await tx.address.updateMany({
            where: { userId: session.user.id, isDefaultShipping: true },
            data: { isDefaultShipping: false },
          });
        }

        await tx.address.create({
          data: {
            userId: session.user.id,
            label: validated.label,
            fullName: validated.fullName.trim(),
            phone: normalizedPhone,
            state: validated.division,
            city: validated.city.trim(),
            line1: validated.line1.trim(),
            isDefaultShipping: shouldBeDefault,
            country: "Bangladesh",
          },
        });
      });
    }

    revalidatePath("/account/addresses");
    revalidatePath("/checkout");
    return { success: true };
  } catch (error: any) {
    const errorMsg = error?.issues?.[0]?.message || error?.message || "Failed to save address.";
    return { success: false, error: errorMsg };
  }
}

/**
 * Deletes an address. If deleting the default address, automatically elects
 * another existing address as the new default.
 */
export async function deleteAddress(addressId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized: Please sign in." };
    }

    const existing = await db.address.findUnique({
      where: { id: addressId },
    });

    if (!existing || existing.userId !== session.user.id) {
      return { success: false, error: "Unauthorized: Address not found or access denied." };
    }

    await db.$transaction(async (tx) => {
      await tx.address.delete({
        where: { id: addressId },
      });

      // If the deleted address was default, elect the latest remaining address as default
      if (existing.isDefaultShipping) {
        const next = await tx.address.findFirst({
          where: { userId: session.user.id },
          orderBy: { createdAt: "desc" },
        });

        if (next) {
          await tx.address.update({
            where: { id: next.id },
            data: { isDefaultShipping: true },
          });
        }
      }
    });

    revalidatePath("/account/addresses");
    revalidatePath("/checkout");
    return { success: true };
  } catch (error: any) {
    console.error("deleteAddress error:", error);
    return { success: false, error: error.message || "Failed to delete address." };
  }
}

/**
 * Sets an address as default shipping address.
 */
export async function setDefaultAddress(addressId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized: Please sign in." };
    }

    const existing = await db.address.findUnique({
      where: { id: addressId },
    });

    if (!existing || existing.userId !== session.user.id) {
      return { success: false, error: "Unauthorized: Address not found or access denied." };
    }

    await db.$transaction([
      db.address.updateMany({
        where: { userId: session.user.id, isDefaultShipping: true },
        data: { isDefaultShipping: false },
      }),
      db.address.update({
        where: { id: addressId },
        data: { isDefaultShipping: true },
      }),
    ]);

    revalidatePath("/account/addresses");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to set default address." };
  }
}
