import { z } from "zod";

export const PRODUCT_TYPES = [
  "laptop",
  "desktop",
  "macbook",
  "phone",
  "tablet",
  "monitor",
  "printer",
  "accessory",
  "networking",
  "other",
] as const;

const productBaseSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  slug: z
    .string()
    .trim()
    .min(2, "Slug is required")
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug must be lowercase, hyphen-separated"),
  sku: z.string().trim().min(1, "SKU is required"),
  brandId: z.string().uuid().nullable().optional(),
  categoryId: z.string().uuid("Category is required"),
  productType: z.enum(PRODUCT_TYPES),
  condition: z.enum(["new", "refurbished", "used"]),
  description: z.string().max(5000).nullable().optional(),
  basePrice: z.coerce.number().min(0, "Price must be 0 or more"),
  salePrice: z.coerce.number().min(0).nullable().optional(),
  warrantyText: z.string().max(500).nullable().optional(),
  status: z.enum(["draft", "published", "archived"]),
  isFeatured: z.coerce.boolean().optional(),
  seoTitle: z.string().max(200).nullable().optional(),
  seoDescription: z.string().max(300).nullable().optional(),
});

export const productSchema = productBaseSchema.refine(
  (data) => !data.salePrice || data.salePrice < data.basePrice,
  {
    message: "Sale price must be less than base price",
    path: ["salePrice"],
  },
);

export const productUpdateSchema = productBaseSchema.extend({ id: z.string().uuid() });

const variantBaseSchema = z.object({
  productId: z.string().uuid(),
  sku: z.string().trim().min(1, "SKU is required"),
  name: z.string().trim().min(1, "Name is required"),
  price: z.coerce.number().min(0),
  salePrice: z.coerce.number().min(0).nullable().optional(),
  isDefault: z.coerce.boolean().optional(),
  status: z.enum(["active", "discontinued"]),
  initialQuantity: z.coerce.number().int().min(0).optional(),
});

export const variantSchema = variantBaseSchema.refine(
  (data) => !data.salePrice || data.salePrice < data.price,
  {
    message: "Sale price must be less than price",
    path: ["salePrice"],
  },
);

export const variantUpdateSchema = variantBaseSchema
  .omit({ initialQuantity: true })
  .extend({ id: z.string().uuid() });

export const specificationValueSchema = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid().nullable().optional(),
  specDefinitionId: z.string().uuid(),
  value: z.string().trim().min(1, "Value is required"),
});

const specificationBatchEntrySchema = specificationValueSchema.strict();
const specificationBatchClearSchema = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid().nullable().optional(),
  specDefinitionId: z.string().uuid(),
});

export const batchSpecificationValuesSchema = z.object({
  productId: z.string().uuid(),
  values: z.array(specificationBatchEntrySchema).default([]),
  cleared: z.array(specificationBatchClearSchema).default([]),
});

export const specDefinitionSchema = z.object({
  productType: z.enum(PRODUCT_TYPES),
  key: z
    .string()
    .trim()
    .min(1)
    .regex(/^[a-z0-9_]+$/, "Key must be lowercase letters, numbers, underscores"),
  label: z.string().trim().min(1),
  dataType: z.enum(["text", "number", "boolean", "enum"]),
  unit: z.string().max(20).optional(),
  displayOrder: z.coerce.number().int().default(0),
});

export const imageMetaUpdateSchema = z.object({
  id: z.string().uuid(),
  altText: z.string().max(200).optional(),
  isPrimary: z.coerce.boolean().optional(),
  displayOrder: z.coerce.number().int().optional(),
});
