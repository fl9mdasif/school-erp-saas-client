import { z } from "zod";

// Form schemas for fees. Messages are dictionary keys (see lib/i18n).
export const feeHeadSchema = z.object({
  name: z.string().trim().min(2, "val.required").max(80),
  nameBn: z.string().trim().max(80),
  code: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9_]{2,20}$/, "val.feeCode"),
  kind: z.enum(["recurring", "one_time"]),
});

export type TFeeHeadForm = z.infer<typeof feeHeadSchema>;

const structureItem = z.object({
  feeHeadId: z.string().min(1, "val.required"),
  amount: z.number({ message: "val.required" }).int().min(0),
  cycle: z.enum(["monthly", "term", "yearly", "one_time"]),
  dueDay: z.string().trim().refine((v) => v === "" || (/^\d{1,2}$/.test(v) && Number(v) >= 1 && Number(v) <= 28), "val.dueDay"),
});

export const structureSchema = z.object({
  items: z
    .array(structureItem)
    .min(1, "val.needItem")
    .max(30)
    .refine((items) => new Set(items.map((i) => i.feeHeadId)).size === items.length, "val.headOnce"),
});

export type TStructureForm = z.infer<typeof structureSchema>;

export const adjustmentSchema = z
  .object({
    feeHeadId: z.string(),
    type: z.enum(["percent", "fixed"]),
    value: z.number({ message: "val.required" }).min(0),
    reason: z.string().trim().min(3, "val.tooShort").max(300),
    validFrom: z.string().trim(),
    validTo: z.string().trim(),
  })
  .refine((v) => v.type !== "percent" || v.value <= 100, { message: "val.percentRange", path: ["value"] });

export type TAdjustmentForm = z.infer<typeof adjustmentSchema>;
