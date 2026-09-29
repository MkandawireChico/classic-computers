import { z } from "zod";

export const checkoutSchema = z
  .object({
    fulfillmentType: z.enum(["pickup", "delivery"]),
    paymentMethod: z.enum(["pay_at_shop", "bank_transfer", "mobile_money", "cash_on_delivery"]),
    notes: z.string().max(1000).optional(),
    // Authenticated customer flow
    deliveryAddressId: z.string().uuid().optional(),
    // Guest flow
    guestName: z.string().trim().min(2).optional(),
    guestPhone: z.string().trim().min(6).optional(),
    guestEmail: z.string().trim().email().optional().or(z.literal("")),
    // Guests have no saved-address system (see PHASE_4_REPORT.md) — the
    // Phase 4 correction pass replaced the earlier free-text workaround
    // with structured fields that map directly onto orders
    // .delivery_snapshot (migration 0033).
    guestDeliveryLine1: z.string().trim().max(200).optional(),
    guestDeliveryLine2: z.string().trim().max(200).optional(),
    guestDeliveryCity: z.string().trim().max(100).optional(),
    guestDeliveryDistrict: z.string().trim().max(100).optional(),
  })
  .refine(
    (data) =>
      data.fulfillmentType !== "delivery" ||
      data.deliveryAddressId ||
      (data.guestDeliveryLine1 && data.guestDeliveryCity),
    {
      message: "An address is required for delivery.",
      path: ["deliveryAddressId"],
    },
  );

export type CheckoutInput = z.infer<typeof checkoutSchema>;
