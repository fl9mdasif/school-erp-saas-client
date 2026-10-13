import type { TInstitutionType, TTenantStatus } from "./auth";

export type TPlatformStats = {
  tenantsByStatus: Partial<Record<TTenantStatus, number>>;
  signupsPerWeek: { weekStart: string; count: number }[];
  users: number;
  students?: number;
};

export type TTenantRow = {
  id: string;
  name: string;
  slug: string;
  institutionType: TInstitutionType;
  status: TTenantStatus;
  /** Status after the 7 day trial grace is applied. */
  effectiveStatus: TTenantStatus;
  trialEndsAt: string;
  planId: string;
  studentCap: number;
  contact: { phone: string; email?: string; district?: string };
  createdAt: string;
};

export type TPlan = {
  _id: string;
  code: string;
  name: string;
  priceMonthly: number;
  studentCap: number;
  features: { customDomain: boolean; csvImport: boolean; marksheetPdf: boolean };
  isActive: boolean;
};

export type TSubscriptionPayment = {
  _id: string;
  planId: string;
  amount: number;
  method: "bkash_manual" | "nagad_manual" | "bank" | "cash";
  reference: string;
  periodStart: string;
  periodEnd: string;
  createdAt: string;
};

export type TTenantDetail = TTenantRow & {
  nameBn?: string;
  eiin?: string;
  plan?: TPlan | null;
  usage: { staff: number; students?: number } & Record<string, number>;
  subscriptionPayments: TSubscriptionPayment[];
};

export type TTenantStatusInput = { status: "active" | "suspended" | "cancelled"; reason: string };
export type TTenantPlanInput = { planId?: string; studentCap?: number; extendTrialDays?: number };
export type TTenantSlugInput = { slug: string; reason: string };
export type TSubscriptionPaymentInput = {
  planId: string;
  amount: number;
  method: TSubscriptionPayment["method"];
  reference: string;
  periodStart: string;
  periodEnd: string;
};
export type TPlanInput = Omit<TPlan, "_id" | "isActive"> & { isActive?: boolean };
