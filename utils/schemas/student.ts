import { z } from "zod";
import { normalizeBdPhone, todayLocal } from "@/lib/format";

// Form schemas for students. Messages are dictionary keys (see lib/i18n).
const guardian = z.object({
  name: z.string().trim().min(2, "val.required").max(100),
  phone: z.string().trim().refine((v) => normalizeBdPhone(v) !== null, "val.phone"),
  relation: z.enum(["father", "mother", "other"]),
});

export const studentProfileSchema = z.object({
  name: z.string().trim().min(2, "val.required").max(120),
  nameBn: z.string().trim().max(120),
  gender: z.enum(["male", "female", "other"]),
  dob: z.string().min(1, "val.required").refine((d) => d < todayLocal(), "val.dobPast"),
  admissionNo: z.string().trim().max(40),
  religion: z.string().trim().max(40),
  address: z.string().trim().max(300),
  admittedOn: z.string(),
  photoUrl: z.string(),
});

export const studentCreateSchema = studentProfileSchema.extend({
  classId: z.string().min(1, "val.required"),
  sectionId: z.string(),
  roll: z.string().trim().refine((v) => v === "" || /^\d{1,4}$/.test(v), "val.positive"),
  guardians: z.array(guardian).max(4),
});

export type TStudentProfileForm = z.infer<typeof studentProfileSchema>;
export type TStudentCreateForm = z.infer<typeof studentCreateSchema>;
