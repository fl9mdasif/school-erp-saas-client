export type TAudienceType = "all" | "staff" | "students_guardians" | "class" | "section";

export type TNoticeAudience = { type: TAudienceType; classIds: string[]; sectionIds: string[] };
export type TAttachment = { url: string; name: string };

export type TNotice = {
  _id: string;
  title: string;
  /** Sanitized HTML. */
  body: string;
  audience: TNoticeAudience;
  isPublic: boolean;
  attachments: TAttachment[];
  status: "draft" | "published";
  publishAt: string;
  expiresAt?: string;
  postedBy: string;
  createdAt: string;
};

export type TNoticeInput = {
  title: string;
  body: string;
  audience: TNoticeAudience;
  isPublic: boolean;
  attachments: TAttachment[];
  status: "draft" | "published";
  publishAt?: string;
  expiresAt?: string;
};

export type TInquiryStatus = "new" | "contacted" | "closed";

export type TInquiry = {
  _id: string;
  name: string;
  phone: string;
  message?: string;
  classInterest?: string;
  status: TInquiryStatus;
  createdAt: string;
};
