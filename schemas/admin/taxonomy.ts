import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().trim().min(2),
  slug: z.string().trim().min(2).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  parentId: z.string().uuid().nullable().optional(),
  displayOrder: z.coerce.number().int().default(0),
});
export const categoryUpdateSchema = categorySchema.extend({ id: z.string().uuid() });

export const brandSchema = z.object({
  name: z.string().trim().min(2),
  slug: z.string().trim().min(2).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
});
export const brandUpdateSchema = brandSchema.extend({ id: z.string().uuid() });
