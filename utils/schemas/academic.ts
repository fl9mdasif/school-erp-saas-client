import { z } from "zod";

// Form schemas for the Academic module. Messages are dictionary keys (see lib/i18n).
export const sessionSchema = z
  .object({
    name: z.string().trim().min(1, "val.required").max(40),
    startDate: z.string().min(1, "val.required"),
    endDate: z.string().min(1, "val.required"),
    isCurrent: z.boolean(),
  })
  .refine((v) => v.endDate > v.startDate, { path: ["endDate"], message: "val.dateOrder" });

export type TSessionForm = z.infer<typeof sessionSchema>;
