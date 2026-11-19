import { z } from "zod";

export const generalEnquirySchema = z
  .object({
    name: z.string().trim().min(2, "Name is required").max(120, "Name is too long"),
    phone: z.string().trim().max(30).optional(),
    email: z.string().trim().email("Enter a valid email").optional().or(z.literal("")),
    topic: z.enum([
      "product",
      "stock",
      "pricing",
      "rental",
      "repair",
      "corporate",
      "order_assistance",
      "other",
    ]),
    message: z.string().trim().min(5, "Message is required").max(2000, "Message must be 2,000 characters or fewer"),
  })
  .refine((data) => Boolean(data.phone || data.email), {
    message: "Enter a phone number or email address so we can reply.",
    path: ["phone"],
  });

export const corporateEnquirySchema = z.object({
  organisationName: z.string().trim().min(2, "Organisation name is required").max(160, "Organisation name must be 160 characters or fewer"),
  contactPerson: z.string().trim().min(2, "Contact person is required").max(120, "Contact name must be 120 characters or fewer"),
  phone: z.string().trim().min(6, "Phone is required").max(30, "Phone number must be 30 characters or fewer"),
  email: z.string().trim().email("Enter a valid email").max(254, "Email address is too long"),
  productsRequired: z.string().trim().max(1000, "Product requirements must be 1,000 characters or fewer").optional(),
  quantity: z.coerce.number().int().positive().max(1000000, "Quantity is too large").optional(),
  budget: z.coerce.number().finite().positive().max(1000000000000, "Budget is too large").optional(),
  deliveryLocation: z.string().trim().max(200, "Delivery location must be 200 characters or fewer").optional(),
  additionalRequirements: z.string().trim().max(1000, "Additional requirements must be 1,000 characters or fewer").optional(),
});
