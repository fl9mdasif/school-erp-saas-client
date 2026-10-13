import { z } from "zod";

// Form schemas for the platform console. Messages are dictionary keys (see lib/i18n).
const optionalWholeNumber = z
  .string()
  .trim()
  .refine((v) => v === "" || /^\d+$/.test(v), "val.positive");

export const planChangeSchema = z.object({
  planId: z.string().optional(),
  studentCap: optionalWholeNumber,
  extendTrialDays: optionalWholeNumber,
});

export const slugChangeSchema = z.object({
  slug: z.string().trim().min(3, "val.slugMin").max(60),
  reason: z.string().trim().min(3, "val.required").max(300),
});

export const subscriptionPaymentSchema = z
  .object({
    planId: z.string().min(1, "val.required"),
    amount: z.number({ message: "val.required" }).int().min(1, "val.positive"),
    method: z.enum(["bkash_manual", "nagad_manual", "bank", "cash"]),
    reference: z.string().trim().min(1, "val.required").max(100),
    periodStart: z.string().min(1, "val.required"),
    periodEnd: z.string().min(1, "val.required"),
  })
  .refine((v) => v.periodEnd > v.periodStart, { path: ["periodEnd"], message: "val.dateOrder" });

export const planSchema = z.object({
  code: z.string().trim().toLowerCase().min(2, "val.required").max(30).regex(/^[a-z0-9_-]+$/, "val.slug"),
  name: z.string().trim().min(2, "val.required").max(60),
  priceMonthly: z.number({ message: "val.required" }).int().min(0, "val.positive"),
  studentCap: z.number({ message: "val.required" }).int().min(1, "val.positive"),
  csvImport: z.boolean(),
  marksheetPdf: z.boolean(),
  customDomain: z.boolean(),
  isActive: z.boolean(),
});

export type TPlanChangeForm = z.infer<typeof planChangeSchema>;
export type TSlugChangeForm = z.infer<typeof slugChangeSchema>;
export type TSubscriptionPaymentForm = z.infer<typeof subscriptionPaymentSchema>;
export type TPlanForm = z.infer<typeof planSchema>;
