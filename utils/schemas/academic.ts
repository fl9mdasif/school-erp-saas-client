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

export const classSchema = z.object({
  name: z.string().trim().min(1, "val.required").max(60),
  nameBn: z.string().trim().max(60).optional(),
  order: z.number({ message: "val.required" }).int().min(0, "val.positive").max(100),
  group: z.enum(["", "science", "commerce", "arts"]),
});

export const sectionSchema = z.object({
  name: z.string().trim().min(1, "val.required").max(40),
  capacity: z.string().trim().refine((v) => v === "" || /^\d+$/.test(v), "val.positive"),
});

export type TClassForm = z.infer<typeof classSchema>;
export type TSectionForm = z.infer<typeof sectionSchema>;

const componentSchema = z
  .object({
    key: z.string().trim().min(1, "val.required").max(20),
    label: z.string().trim().min(1, "val.required").max(40),
    fullMarks: z.number({ message: "val.required" }).min(0).max(1000),
    passMarks: z.number({ message: "val.required" }).min(0).max(1000),
  })
  .refine((c) => c.passMarks <= c.fullMarks, { path: ["passMarks"], message: "val.passOver" });

export const subjectSchema = z.object({
  name: z.string().trim().min(1, "val.required").max(80),
  nameBn: z.string().trim().max(80).optional(),
  code: z.string().trim().max(20).optional(),
  components: z
    .array(componentSchema)
    .max(8)
    .refine((cs) => new Set(cs.map((c) => c.key)).size === cs.length, "val.keysUnique"),
});

export type TSubjectForm = z.infer<typeof subjectSchema>;
