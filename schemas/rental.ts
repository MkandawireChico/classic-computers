import { z } from "zod";

export const rentalBookingSchema = z
  .object({
    rentalProductId: z.string().uuid(),
    quantity: z.coerce.number().int().positive().max(10),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    notes: z.string().trim().max(500).optional(),
    guestName: z.string().trim().min(2).optional(),
    guestPhone: z.string().trim().min(6).optional(),
    guestEmail: z.string().trim().email().optional().or(z.literal("")),
  })
  .refine((d) => new Date(d.endDate) >= new Date(d.startDate), {
    message: "End date must be on or after the start date",
    path: ["endDate"],
  })
  .refine((d) => new Date(d.startDate) >= new Date(new Date().toDateString()), {
    message: "Start date cannot be in the past",
    path: ["startDate"],
  });

export const rentalTrackingSchema = z.object({
  trackingToken: z.string().trim().min(1, "Tracking code is required"),
});
