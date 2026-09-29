import { z } from "zod";

export const studentVerificationSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required"),
  institution: z.string().trim().min(2, "Institution is required"),
  studentIdNumber: z.string().trim().min(1, "Student ID is required"),
  phone: z.string().trim().min(6, "Phone is required"),
  email: z
    .string()
    .trim()
    .email("Enter a valid email")
    .refine((email) => {
      const domainLabels = email.split("@")[1]?.toLowerCase().split(".") ?? [];
      return ["mubas", "must", "cu", "unima", "luanar"].some((institution) =>
        domainLabels.includes(institution),
      );
    }, "Use an email address from your institution (MUBAS, MUST, CU, UNIMA, or LUANAR)."),
});

export type StudentVerificationInput = z.infer<typeof studentVerificationSchema>;
