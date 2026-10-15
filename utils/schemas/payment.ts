import { z } from "zod";

const DIGITAL = ["bkash_manual", "nagad_manual", "rocket_manual"] as const;

export const collectFeeSchema = z
  .object({
    method: z.enum(["cash", "bank", "cheque", "bkash_manual", "nagad_manual", "rocket_manual"]),
    amount: z.number({ message: "val.required" }).int().min(1),
    providerRef: z.string().trim().max(60),
    note: z.string().trim().max(300),
  })
  .refine((v) => !DIGITAL.includes(v.method as (typeof DIGITAL)[number]) || v.providerRef.length > 0, {
    message: "val.refRequired",
    path: ["providerRef"],
  });

export type TCollectFeeForm = z.infer<typeof collectFeeSchema>;
