import { z } from "zod";

export const repairBookingSchema = z.object({
  deviceType: z.string().trim().min(2, "Device type is required").max(80, "Device type must be 80 characters or fewer"),
  brand: z.string().trim().max(100, "Brand must be 100 characters or fewer").optional(),
  model: z.string().trim().max(100, "Model must be 100 characters or fewer").optional(),
  serialNumber: z.string().trim().max(100, "Serial number must be 100 characters or fewer").optional(),
  problemDescription: z.string().trim().min(10, "Please describe the problem (at least 10 characters)").max(2000, "Please keep the problem description under 2,000 characters"),
  accessoriesReceived: z.string().trim().max(300, "Accessories details must be 300 characters or fewer").optional(),
  // Guest fields — required when the submitter isn't signed in (checked
  // in the service layer, which knows whether a session exists)
  guestName: z.string().trim().min(2).max(120, "Name must be 120 characters or fewer").optional(),
  guestPhone: z.string().trim().min(6).max(30, "Phone number must be 30 characters or fewer").optional(),
  guestEmail: z.string().trim().email().max(254).optional().or(z.literal("")),
});

export type RepairBookingInput = z.infer<typeof repairBookingSchema>;

export const repairTrackingSchema = z.object({
  ticketNumber: z.string().trim().min(1, "Ticket number is required").max(40),
  trackingToken: z.string().trim().min(1, "Tracking code is required").max(200),
});
