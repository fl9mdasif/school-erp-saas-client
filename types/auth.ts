import type { TRole } from "@/contains/role";

export type TInstitutionType = "school" | "madrasa" | "coaching";
export type TTenantStatus = "trial" | "active" | "suspended" | "cancelled";

export type TAuthUser = {
  id: string;
  name: string;
  role: TRole;
  email?: string;
  phone?: string;
  mustChangePassword?: boolean;
};

export type TTerminology = Record<string, { en: string; bn: string }>;

export type TTenantSummary = {
  id: string;
  name: string;
  slug: string;
  institutionType: TInstitutionType;
  status: TTenantStatus;
  trialEndsAt: string;
  terminology: TTerminology;
  settings: {
    locale: "bn" | "en";
    weekendDays: number[];
    defaultFeeCycle: "monthly" | "term" | "yearly" | "one_time";
  };
  plan: {
    slug: string;
    name: string;
    features: string[];
    notIncluded: string[];
  } | null;
};

/** Response of GET /auth/me. Platform owners have no tenant. */
export type TMe = { user: TAuthUser; tenant?: TTenantSummary };

export type TLoginInput = { tenantSlug: string; identifier: string; password: string };
export type TPlatformLoginInput = { email: string; password: string };

export type TRegisterInput = {
  institutionName: string;
  institutionNameBn?: string;
  institutionType: TInstitutionType;
  slug: string;
  phone: string;
  district?: string;
  adminName: string;
  adminEmail: string;
  password: string;
};

export type TSlugCheck = {
  normalized: string;
  available: boolean;
  reason?: "SLUG_INVALID" | "SLUG_RESERVED" | "SLUG_TAKEN";
};
