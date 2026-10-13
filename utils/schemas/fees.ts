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
