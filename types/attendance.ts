export type TAttendanceStatus = "present" | "absent" | "late" | "leave";

export type TTakeableSection = {
  sectionId: string;
  classId: string;
  className: string;
  /** Missing for a class that has no named sections. */
  name?: string;
  students: number;
  takenToday: boolean;
};

export type TSheetRecord = {
  studentId: string;
  name: string;
  studentCode: string;
  roll: number;
  status: TAttendanceStatus;
  note?: string;
};

export type TSheet = {
  exists: boolean;
  sheetId?: string;
  date: string;
  sectionId: string;
  takenAt?: string;
  records: TSheetRecord[];
};

export type TSubmitSheetInput = {
  sectionId: string;
  date: string;
  /** Only exceptions are needed: everyone not listed is present. */
  records: { studentId: string; status: TAttendanceStatus; note?: string }[];
  allowWeekend?: boolean;
};

export type TSectionReportRow = {
  studentId: string;
  name?: string;
  studentCode?: string;
  present: number;
  absent: number;
  late: number;
  leave: number;
  percent: number | null;
  byDate: Record<string, TAttendanceStatus>;
};

export type TSectionReport = { sectionId: string; from: string; to: string; days: string[]; rows: TSectionReportRow[] };
