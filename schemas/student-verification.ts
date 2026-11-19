import { z } from "zod";

export const studentVerificationSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required").max(120, "Name must be 120 characters or fewer"),
  institution: z.string().trim().min(2, "Institution is required").max(160, "Institution name must be 160 characters or fewer"),
  studentIdNumber: z.string().trim().min(1, "Student ID is required").max(80, "Student ID must be 80 characters or fewer"),
  phone: z.string().trim().min(6, "Phone is required").max(30, "Phone number must be 30 characters or fewer"),
  email: z
    .string()
    .trim()
    .email("Enter a valid email")
    .max(254, "Email address is too long"),
});

export type StudentVerificationInput = z.infer<typeof studentVerificationSchema>;
