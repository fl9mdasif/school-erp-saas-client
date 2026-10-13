import { z } from "zod";
import { normalizeBdPhone } from "@/lib/format";

// Form schemas for staff accounts. Messages are dictionary keys (see lib/i18n).
const base = {
  role: z.enum(["admin", "teacher", "accountant"]),
  name: z.string().trim().min(2, "val.required").max(100),
  email: z.string().trim().refine((v) => v === "" || z.email().safeParse(v).success, "val.email"),
  phone: z.string().trim().refine((v) => v === "" || normalizeBdPhone(v) !== null, "val.phone"),
};

const needsContact = { path: ["email"], message: "val.emailOrPhone" } as const;

export const staffCreateSchema = z
  .object({
    ...base,
    password: z.string().refine((v) => v === "" || v.length >= 8, "val.min8"),
  })
  .refine((v) => v.email !== "" || v.phone !== "", needsContact);

export const staffEditSchema = z.object(base).refine((v) => v.email !== "" || v.phone !== "", needsContact);

export type TStaffCreateForm = z.infer<typeof staffCreateSchema>;
export type TStaffEditForm = z.infer<typeof staffEditSchema>;
