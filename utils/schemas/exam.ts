import { z } from "zod";

const band = z.object({
  minPercent: z.number().min(0).max(100),
  maxPercent: z.number().min(0).max(100),
  letter: z.string().trim().min(1, "val.required").max(30),
  point: z.number().min(0).max(10).optional(),
  remark: z.string().trim().max(60).optional(),
});

export const gradingScaleSchema = z.object({
  name: z.string().trim().min(2, "val.required").max(60),
  kind: z.enum(["gpa", "division", "percentage"]),
  passPercent: z.number().min(0).max(100),
  bands: z.array(band).min(2, "val.needItem").max(20),
  failIfAnyCompulsoryFails: z.boolean(),
  fourthSubjectBonus: z.boolean(),
  graceMarksPerSubject: z.number().min(0).max(20),
  meritTieBreak: z.enum(["total_then_roll", "total_then_name"]),
  isDefault: z.boolean().optional(),
});
export type TGradingScaleForm = z.infer<typeof gradingScaleSchema>;

export const examSchema = z
  .object({
    name: z.string().trim().min(2, "val.required").max(100),
    kind: z.enum(["term", "class_test", "model_test", "monthly", "custom"]),
    sessionId: z.string().min(1, "val.required"),
    classIds: z.array(z.string()).min(1, "val.needItem"),
    gradingScaleId: z.string(),
    startDate: z.string(),
    endDate: z.string(),
  })
  .refine((v) => !v.startDate || !v.endDate || v.endDate >= v.startDate, { message: "val.dateOrder", path: ["endDate"] });
export type TExamForm = z.infer<typeof examSchema>;

export const correctResultSchema = z.object({
  reason: z.string().trim().min(5, "val.tooShort").max(500),
});
export type TCorrectResultForm = z.infer<typeof correctResultSchema>;
