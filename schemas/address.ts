import { z } from "zod";

export const addressSchema = z.object({
  label: z.string().trim().max(50).optional(),
  line1: z.string().trim().min(3, "Address is required"),
  line2: z.string().trim().max(200).optional(),
  city: z.string().trim().min(2, "City is required"),
  isDefault: z.boolean().optional(),
});

export const addressUpdateSchema = addressSchema.extend({ id: z.string().uuid() });

export type AddressInput = z.infer<typeof addressSchema>;
