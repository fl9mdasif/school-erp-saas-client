import type { TClassGroup } from "./academic";

/** All amounts in this file are integer poisha. */
export type TFeeCycle = "monthly" | "term" | "yearly" | "one_time";

export type TFeeHead = {
  _id: string;
  name: string;
  nameBn?: string;
  code: string;
  kind: "recurring" | "one_time";
  isActive: boolean;
};
export type TFeeHeadInput = { name: string; nameBn?: string; code?: string; kind: "recurring" | "one_time"; isActive?: boolean };

export type TFeeItem = { feeHeadId: string; amount: number; cycle: TFeeCycle; dueDay?: number };

export type TFeeStructure = {
  _id: string;
  sessionId: string;
  classId: string;
  group: TClassGroup;
  items: TFeeItem[];
};
export type TFeeStructureInput = { sessionId: string; classId: string; group: TClassGroup; items: TFeeItem[] };

export type TAdjustment = {
  _id: string;
  studentId: string;
  sessionId: string;
  feeHeadId?: string;
  type: "percent" | "fixed";
  value: number;
  reason: string;
  validFrom?: string;
  validTo?: string;
  createdAt: string;
};
export type TAdjustmentInput = Omit<TAdjustment, "_id" | "createdAt">;

export type TInvoiceStatus = "unpaid" | "partial" | "paid" | "voided";

export type TInvoiceLine = { feeHeadId: string; label: string; amount: number; discount: number };

export type TInvoice = {
  _id: string;
  invoiceNo: string;
  /** The list populates the student; the detail returns the id. */
  studentId: string | { _id: string; name: string; studentId: string };
  sessionId: string;
  periodLabel: string;
  lines: TInvoiceLine[];
  total: number;
  paidTotal: number;
  dueAmount: number;
  dueDate: string;
  issuedAt: string;
  status: TInvoiceStatus;
  voidReason?: string;
};

export type TInvoiceDetail = TInvoice & {
  ledger: { _id: string; type: string; direction: "debit" | "credit"; amount: number; occurredAt: string; note?: string }[];
};

export type TGenerateInput = {
  sessionId: string;
  classId?: string;
  sectionId?: string;
  periodLabel: string;
  cycle: TFeeCycle;
  feeHeadIds?: string[];
  dueDate: string;
};

export type TGeneratePreview = {
  dryRun: true;
  toCreate: number;
  totalAmount: number;
  skipped: number;
  skippedDetails: { studentId: string; name: string; reason: string }[];
};

export type TGenerateResult = {
  dryRun: false;
  batchId: string;
  created: number;
  totalAmount: number;
  skipped: number;
  skippedDetails: { studentId: string; name: string; reason: string }[];
  replayed?: boolean;
};
