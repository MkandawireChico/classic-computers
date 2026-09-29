import { z } from "zod";

export const repairBookingSchema = z.object({
  deviceType: z.string().trim().min(2, "Device type is required"),
  brand: z.string().trim().max(100).optional(),
  model: z.string().trim().max(100).optional(),
  serialNumber: z.string().trim().max(100).optional(),
  problemDescription: z.string().trim().min(10, "Please describe the problem (at least 10 characters)"),
  accessoriesReceived: z.string().trim().max(300).optional(),
  // Guest fields — required when the submitter isn't signed in (checked
  // in the service layer, which knows whether a session exists)
  guestName: z.string().trim().min(2).optional(),
  guestPhone: z.string().trim().min(6).optional(),
  guestEmail: z.string().trim().email().optional().or(z.literal("")),
});

export type RepairBookingInput = z.infer<typeof repairBookingSchema>;

export const repairTrackingSchema = z.object({
  ticketNumber: z.string().trim().min(1, "Ticket number is required"),
  trackingToken: z.string().trim().min(1, "Tracking code is required"),
});
