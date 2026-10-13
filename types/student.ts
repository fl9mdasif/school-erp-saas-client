import type { TClassGroup } from "./academic";

export type TStudentStatus = "active" | "transferred" | "passed_out" | "dropped" | "inactive";
export type TGender = "male" | "female" | "other";
export type TRelation = "father" | "mother" | "other";

/** The enrolment fields the list needs; the server populates them on the student. */
export type TEnrolmentBrief = { _id: string; classId: string; sectionId?: string; roll: number; sessionId: string };

export type TStudent = {
  _id: string;
  /** Printed ID such as 26-0001. Never edited. */
  studentId: string;
  admissionNo?: string;
  name: string;
  nameBn?: string;
  gender: TGender;
  /** YYYY-MM-DD */
  dob: string;
  photoUrl?: string;
  religion?: string;
  address?: string;
  admittedOn: string;
  status: TStudentStatus;
  guardianIds: string[];
  currentEnrolmentId?: TEnrolmentBrief | string | null;
};

export type TEnrolment = {
  _id: string;
  studentId: string;
  sessionId: string;
  classId: string;
  sectionId?: string;
  roll: number;
  group?: TClassGroup;
  optionalSubjectIds: string[];
  fourthSubjectId?: string;
  status: "active" | "promoted" | "repeated" | "left";
};

export type TGuardianBrief = { _id: string; name: string; phone: string; relation: TRelation };

export type TStudentDetail = TStudent & { enrolments: TEnrolment[]; guardians: TGuardianBrief[] };

export type TGuardianInput = {
  name: string;
  phone: string;
  relation: TRelation;
  occupation?: string;
  address?: string;
};

export type TEnrolmentInput = {
  sessionId?: string;
  classId: string;
  sectionId?: string;
  roll?: number;
  group?: TClassGroup;
  optionalSubjectIds?: string[];
  fourthSubjectId?: string;
};

export type TStudentProfileInput = {
  admissionNo?: string;
  name: string;
  nameBn?: string;
  gender: TGender;
  dob: string;
  photoUrl?: string;
  religion?: string;
  address?: string;
  birthRegistrationNo?: string;
  admittedOn?: string;
};

export type TStudentCreateInput = TStudentProfileInput & { enrolment: TEnrolmentInput; guardians: TGuardianInput[] };

export type TLoginsResult = {
  student?: { loginId: string; temporaryPassword: string };
  guardians: { guardianId: string; phone: string; temporaryPassword: string }[];
};

export type TAttendanceTotals = { present: number; absent: number; late: number; leave: number; percent: number | null };

export type TStudentAttendance = {
  studentId: string;
  name: string;
  from: string;
  to: string;
  totals: TAttendanceTotals;
  months: ({ month: string } & TAttendanceTotals)[];
  days: { date: string; status: "present" | "absent" | "late" | "leave" }[];
};

export type TLedgerEntry = {
  id: string;
  date: string;
  type: string;
  direction: "debit" | "credit";
  /** Integer poisha. */
  amount: number;
  invoiceId?: string;
  paymentId?: string;
  note?: string;
  /** Running balance in poisha after this entry. */
  balance: number;
};

export type TStudentLedger = { studentId: string; balance: number; entries: TLedgerEntry[] };

export type TResultSubject = { subjectId: string; name: string; kind: string; total: number; fullMarks: number; letter: string; point: number; passed: boolean };

export type TStudentResult = {
  _id: string;
  examId: string;
  examName?: string;
  subjects: TResultSubject[];
  totalMarks: number;
  fullMarks: number;
  percent: number;
  gpa?: number;
  letter?: string;
  division?: string;
  passed: boolean;
  positionInClass?: number;
  status: "draft" | "published";
};

export type TImportRowError = { row: number; field: string; message: string };

export type TImportDryRun = {
  jobId: string;
  status: string;
  fileName: string;
  totalRows: number;
  validRows: number;
  errorCount: number;
  errors: TImportRowError[];
};

export type TImportCommit = { jobId: string; status: "committed"; created: number; guardiansReused: number };
