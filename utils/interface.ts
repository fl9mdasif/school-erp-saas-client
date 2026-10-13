import { z } from "zod";

// Auth schemas mirror the server validation. Messages are plain keys-as-text here; screens
// translate them through the dictionary.
const phone = z
  .string()
  .trim()
  .regex(/^(?:\+?88)?01[3-9]\d{8}$/, "Enter a valid Bangladesh mobile number");

export const loginSchema = z.object({
  tenantSlug: z.string().trim().min(1, "School is required"),
  identifier: z.string().trim().min(1, "Email, mobile number or Student ID is required"),
  password: z.string().min(1, "Password is required"),
});

export const platformLoginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address!"),
  password: z.string().min(1, "Password is required"),
});

export const signupInstitutionSchema = z.object({
  institutionName: z.string().trim().min(2, "Institution name is required").max(120),
  institutionNameBn: z.string().trim().max(120).optional(),
  institutionType: z.enum(["school", "madrasa", "coaching"], {
    message: "Choose a type",
  }),
  district: z.string().trim().max(60).optional(),
  phone,
});

export const signupSlugSchema = z.object({
  slug: z.string().trim().min(3, "At least 3 characters").max(60),
});

export const signupAdminSchema = z.object({
  adminName: z.string().trim().min(2, "Your name is required").max(100),
  adminEmail: z.string().trim().email("Please enter a valid email address!"),
  password: z.string().min(8, "Must be at least 8 characters").max(128),
  terms: z.literal(true, { message: "Please accept the terms" }),
});

export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Must be at least 8 characters").max(128),
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  })
  .refine((v) => v.newPassword !== v.oldPassword, {
    path: ["newPassword"],
    message: "New password must differ from the current one",
  });

export const forgotPasswordSchema = z.object({
  tenantSlug: z.string().trim().min(1, "School is required"),
  email: z.string().trim().email("Please enter a valid email address!"),
});

export const resetPasswordSchema = z.object({
  newPassword: z.string().min(8, "Must be at least 8 characters").max(128),
});

export type TLoginForm = z.infer<typeof loginSchema>;
export type TPlatformLoginForm = z.infer<typeof platformLoginSchema>;
