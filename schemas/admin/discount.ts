import { z } from "zod";

const discountBaseSchema = z.object({
  name: z.string().trim().min(2),
  type: z.enum(["percentage", "fixed"]),
  value: z.coerce.number().positive(),
  scope: z.enum(["all", "category", "product", "student", "campaign"]),
  minQuantity: z.coerce.number().int().positive().nullable().optional(),
  minOrderTotal: z.coerce.number().positive().nullable().optional(),
  maxDiscountAmount: z.coerce.number().positive().nullable().optional(),
  startsAt: z.string().nullable().optional(),
  endsAt: z.string().nullable().optional(),
  isActive: z.coerce.boolean().optional(),
  productIds: z.array(z.string().uuid()).optional(),
  categoryIds: z.array(z.string().uuid()).optional(),
});

export const discountSchema = discountBaseSchema
  .refine((d) => d.type !== "percentage" || d.value <= 100, {
    message: "Percentage discounts cannot exceed 100%",
    path: ["value"],
  })
  .refine((d) => !d.startsAt || !d.endsAt || new Date(d.endsAt) > new Date(d.startsAt), {
    message: "End date must be after start date",
    path: ["endsAt"],
  });

export const discountUpdateSchema = discountBaseSchema.extend({ id: z.string().uuid() });
