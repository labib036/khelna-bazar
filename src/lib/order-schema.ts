import { z } from "zod";

export const PlaceOrderSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  phone: z
    .string()
    .regex(/^(\+?88)?01[3-9]\d{8}$/, "Must be a valid Bangladeshi mobile number (01[3-9]XXXXXXXX)"),
  email: z.string().email().optional().or(z.literal("")),
  division: z.string().min(2, "Please select your district / division"),
  cityArea: z.string().min(2, "Please enter your area or thana"),
  fullAddress: z.string().min(5, "Please enter your complete street address"),
  deliveryNotes: z.string().optional(),
  deliveryZone: z.enum(["inside_dhaka", "outside_dhaka", "express_dhaka"]),
  paymentMethod: z.enum(["CASH_ON_DELIVERY", "BKASH", "NAGAD"]).default("CASH_ON_DELIVERY"),
  senderNumber: z.string().optional(),
  trxId: z.string().optional(),
  inspectionAcknowledged: z.boolean().refine((val) => val === true, {
    message: "You must acknowledge that products must be inspected in front of the delivery person upon delivery.",
  }),
  items: z
    .array(
      z.object({
        variantId: z.string().min(1, "Variant ID required"),
        quantity: z.number().int().min(1, "Quantity must be at least 1"),
        giftWrap: z.boolean().default(false),
      })
    )
    .min(1, "Your cart cannot be empty"),
  couponCode: z.string().optional(),
  idempotencyKey: z.string().optional(),
  userId: z.string().optional(), // Ignored server-side; bound strictly to session.user.id
  expectedShippingFee: z.number().nonnegative().optional(),
  expectedTotal: z.number().nonnegative().optional(),
});

export type PlaceOrderInput = z.infer<typeof PlaceOrderSchema>;
