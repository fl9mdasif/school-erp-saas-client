import type { TInstitutionType, TTenantStatus, TTerminology } from "./auth";

export type TSchoolProfile = {
  id: string;
  name: string;
  nameBn?: string;
  slug: string;
  institutionType: TInstitutionType;
  status: TTenantStatus;
  contact?: { phone?: string; email?: string; address?: string; district?: string; upazila?: string };
  eiin?: string;
  logoUrl?: string;
  settings: TSchoolSettings;
};
export type TSchoolProfileInput = {
  name?: string;
  nameBn?: string;
  logoUrl?: string;
  eiin?: string;
  contact?: { phone?: string; email?: string; address?: string; district?: string; upazila?: string };
};

export type TSchoolSettings = {
  locale: "bn" | "en";
  weekendDays: number[];
  defaultFeeCycle: "monthly" | "term" | "yearly" | "one_time";
  attendanceEditWindowHours?: number;
  resultLookupMode?: "roll_dob" | "roll_only" | "student_id_dob";
  terminology?: TTerminology;
};
export type TSchoolSettingsInput = Partial<Omit<TSchoolSettings, "terminology">>;

export type TSchoolUsage = {
  students: number;
  studentCap: number;
  staff: number;
  plan: { slug: string; name: string } | null;
  status: TTenantStatus;
  trialEndsAt?: string;
};
