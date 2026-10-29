import { z } from "zod";

const bankProviderSchema = z.enum([
  "national_bank",
  "fdh_bank",
  "standard_bank",
  "first_capital_bank",
]);
const mobileMoneyProviderSchema = z.enum(["airtel_money", "tnm_mpamba"]);

export const checkoutSchema = z
  .object({
    fulfillmentType: z.enum(["pickup", "delivery"]),
    paymentMethod: z.enum(["pay_at_shop", "bank_transfer", "mobile_money", "cash_on_delivery"]),
    paymentProvider: z.union([bankProviderSchema, mobileMoneyProviderSchema]).optional(),
    paymentReference: z.string().trim().max(120).regex(/^[^\r\n]*$/, "Payment reference must be a single line.").optional(),
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
  .superRefine((data, context) => {
    if (
      data.fulfillmentType === "delivery" &&
      !data.deliveryAddressId &&
      !(data.guestDeliveryLine1 && data.guestDeliveryCity)
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "An address is required for delivery.",
        path: ["deliveryAddressId"],
      });
    }

    const bankProvider =
      data.paymentProvider &&
      bankProviderSchema.safeParse(data.paymentProvider).success;
    const mobileMoneyProvider =
      data.paymentProvider &&
      mobileMoneyProviderSchema.safeParse(data.paymentProvider).success;

    if (data.paymentMethod === "bank_transfer" && !bankProvider) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Choose a bank for your bank transfer.",
        path: ["paymentProvider"],
      });
    } else if (data.paymentMethod === "mobile_money" && !mobileMoneyProvider) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Choose a mobile-money provider.",
        path: ["paymentProvider"],
      });
    } else if (
      data.paymentMethod !== "bank_transfer" &&
      data.paymentMethod !== "mobile_money" &&
      data.paymentProvider
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "A payment provider is not valid for this payment method.",
        path: ["paymentProvider"],
      });
    }
  });

export type CheckoutInput = z.infer<typeof checkoutSchema>;
