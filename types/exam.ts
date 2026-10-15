export type TGradingKind = "gpa" | "division" | "percentage";
export type TGradingBand = { minPercent: number; maxPercent: number; letter: string; point?: number; remark?: string };
export type TGradingRules = {
  failIfAnyCompulsoryFails: boolean;
  fourthSubjectBonus: boolean;
  graceMarksPerSubject: number;
  meritTieBreak: "total_then_roll" | "total_then_name";
};
export type TGradingScale = {
  _id: string;
  name: string;
  kind: TGradingKind;
  bands: TGradingBand[];
  passPercent: number;
  rules: TGradingRules;
  isDefault?: boolean;
};
export type TGradingScaleInput = Omit<TGradingScale, "_id">;

export type TExamKind = "term" | "class_test" | "model_test" | "monthly" | "custom";
export type TExamStatus = "draft" | "marks_open" | "marks_closed" | "published";

export type TExam = {
  _id: string;
  name: string;
  kind: TExamKind;
  sessionId: string;
  classIds: string[];
  gradingScaleId: string;
  startDate?: string;
  endDate?: string;
  status: TExamStatus;
  publishedAt?: string;
  resultVersion: number;
};
export type TExamInput = {
  name: string;
  kind: TExamKind;
  sessionId: string;
  classIds: string[];
  gradingScaleId?: string;
  startDate?: string;
  endDate?: string;
};

export type TMarkComponent = { key: string; label?: string; obtained: number | null; absent: boolean; fullMarks?: number; passMarks?: number };
export type TMarksSheetRow = { studentId: string; studentCode: string; name: string; roll: number; status: "empty" | "draft" | "submitted" | "locked"; components: TMarkComponent[]; total?: number };
export type TMarksSheet = {
  exam: { id: string; name: string; status: TExamStatus };
  subject: { id: string; name: string; kind: string; fullMarks: number; components: { key: string; label: string; fullMarks: number; passMarks: number }[] };
  rows: TMarksSheetRow[];
};
export type TMarksSaveInput = { classId: string; sectionId?: string; subjectId: string; marks: { studentId: string; components: { key: string; obtained: number | null; absent: boolean }[] }[] };

export type TProgressRow = { classId: string; sectionId?: string; subjectId: string; subject: string; teacherId?: string; students: number; entered: number; submitted: number; complete: boolean };
export type TExamProgress = { examId: string; status: TExamStatus; rows: TProgressRow[]; complete: boolean };

export type TResultSubject = { subjectId: string; name: string; kind: string; total: number; fullMarks: number; letter?: string; point?: number; passed: boolean };
export type TResult = {
  _id: string;
  examId: string;
  studentId: string;
  classId: string;
  sectionId?: string;
  roll: number;
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
  version: number;
  name?: string;
  studentCode?: string;
  examName?: string;
};
export type TResultsResponse = {
  exam: { id: string; name: string; status: TExamStatus; resultVersion: number };
  summary: { students: number; passed: number; failed: number; passRate: number | null; distribution: Record<string, number> };
  results: TResult[];
};
export type TMeritRow = { position?: number; roll: number; name?: string; studentCode?: string; total: number; percent: number; gpa?: number; letter?: string; passed: boolean };

export type TCorrectInput = { reason: string; changes: { subjectId: string; components: { key: string; obtained: number | null; absent: boolean }[] }[] };
