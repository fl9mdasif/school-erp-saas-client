import { z } from "zod";

// Auth schemas mirror the server validation. Messages are dictionary keys (val.*): forms translate
// them with t(), so the same schema serves Bangla and English.
const phone = z.string().trim().regex(/^(?:\+?88)?01[3-9]\d{8}$/, "val.phone");
const password = z.string().min(8, "val.min8").max(128);

export const loginSchema = z.object({
  tenantSlug: z.string().trim().min(1, "val.required"),
  identifier: z.string().trim().min(1, "val.required"),
  password: z.string().min(1, "val.required"),
});

export const platformLoginSchema = z.object({
  email: z.string().trim().email("val.email"),
  password: z.string().min(1, "val.required"),
});

export const signupSchema = z.object({
  institutionName: z.string().trim().min(2, "val.required").max(120),
  institutionNameBn: z.string().trim().max(120).optional(),
  institutionType: z.enum(["school", "madrasa", "coaching"], { message: "val.chooseType" }),
  district: z.string().trim().max(60).optional(),
  phone,
  slug: z.string().trim().min(3, "val.slugMin").max(60),
  adminName: z.string().trim().min(2, "val.required").max(100),
  adminEmail: z.string().trim().email("val.email"),
  password,
  terms: z.literal(true, { message: "val.terms" }),
});

/** Which fields belong to each step, so a step is validated on its own before moving on. */
export const SIGNUP_STEP_FIELDS = [
  ["institutionName", "institutionType", "phone"],
  ["slug"],
  ["adminName", "adminEmail", "password", "terms"],
] as const satisfies readonly (readonly (keyof z.infer<typeof signupSchema>)[])[];

export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, "val.required"),
    newPassword: password,
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, { path: ["confirmPassword"], message: "val.passwordsMatch" })
  .refine((v) => v.newPassword !== v.oldPassword, { path: ["newPassword"], message: "val.passwordDiffer" });

export const forgotPasswordSchema = z.object({
  tenantSlug: z.string().trim().min(1, "val.required"),
  email: z.string().trim().email("val.email"),
});

export const resetPasswordSchema = z
  .object({ newPassword: password, confirmPassword: z.string() })
  .refine((v) => v.newPassword === v.confirmPassword, { path: ["confirmPassword"], message: "val.passwordsMatch" });

export type TLoginForm = z.infer<typeof loginSchema>;
export type TPlatformLoginForm = z.infer<typeof platformLoginSchema>;
export type TSignupForm = z.infer<typeof signupSchema>;
export type TChangePasswordForm = z.infer<typeof changePasswordSchema>;
export type TForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;
export type TResetPasswordForm = z.infer<typeof resetPasswordSchema>;
