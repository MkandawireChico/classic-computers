import { z } from "zod";

export const generalEnquirySchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  phone: z.string().trim().max(30).optional(),
  email: z.string().trim().email("Enter a valid email").optional().or(z.literal("")),
  topic: z.enum(["product", "stock", "pricing", "rental", "repair", "corporate", "other"]),
  message: z.string().trim().min(5, "Message is required"),
}).refine((data) => Boolean(data.phone || data.email), {
  message: "Enter a phone number or email address so we can reply.",
  path: ["phone"],
});

export const corporateEnquirySchema = z.object({
  organisationName: z.string().trim().min(2, "Organisation name is required"),
  contactPerson: z.string().trim().min(2, "Contact person is required"),
  phone: z.string().trim().min(6, "Phone is required"),
  email: z.string().trim().email("Enter a valid email"),
  productsRequired: z.string().trim().max(1000).optional(),
  quantity: z.coerce.number().int().positive().optional(),
  budget: z.coerce.number().positive().optional(),
  deliveryLocation: z.string().trim().max(200).optional(),
  additionalRequirements: z.string().trim().max(1000).optional(),
});
