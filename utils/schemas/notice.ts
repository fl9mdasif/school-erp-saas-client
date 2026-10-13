import { z } from "zod";

// Form schema for notices. Messages are dictionary keys (see lib/i18n).
export const noticeSchema = z
  .object({
    title: z.string().trim().min(2, "val.required").max(200),
    body: z.string().refine((v) => v.replace(/<[^>]*>/g, "").trim().length > 0, "val.required"),
    audienceType: z.enum(["all", "staff", "students_guardians", "class", "section"]),
    classIds: z.array(z.string()),
    sectionIds: z.array(z.string()),
    isPublic: z.boolean(),
    status: z.enum(["draft", "published"]),
    publishAt: z.string(),
    expiresAt: z.string(),
    attachments: z.array(z.object({ url: z.string(), name: z.string() })).max(5),
  })
  .refine((v) => v.audienceType !== "class" || v.classIds.length > 0, { path: ["classIds"], message: "val.pickOne" })
  .refine((v) => v.audienceType !== "section" || v.sectionIds.length > 0, { path: ["sectionIds"], message: "val.pickOne" })
  .refine((v) => !v.expiresAt || !v.publishAt || v.expiresAt > v.publishAt, { path: ["expiresAt"], message: "val.dateOrder" });

export type TNoticeForm = z.infer<typeof noticeSchema>;
