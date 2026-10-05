import { z } from "zod";

const nullableMoney = z.preprocess(
  (value) => (value === "" || value === undefined ? null : typeof value === "string" ? Number(value) : value),
  z.number().finite().min(0, "Rental amounts must be zero or more").nullable(),
);

export const rentalConfigurationSchema = z
  .object({
    productId: z.string().uuid(),
    variantId: z.string().uuid().nullable(),
    isAvailable: z.boolean(),
    dailyRate: nullableMoney,
    weeklyRate: nullableMoney,
    monthlyRate: nullableMoney,
    depositAmount: nullableMoney,
  })
  .strict();