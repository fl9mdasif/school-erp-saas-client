export type TSession = {
  _id: string;
  name: string;
  /** YYYY-MM-DD */
  startDate: string;
  endDate: string;
  isCurrent: boolean;
};
export type TSessionInput = { name: string; startDate: string; endDate: string; isCurrent?: boolean };

export type TClassGroup = "science" | "commerce" | "arts" | null;

export type TClass = {
  _id: string;
  name: string;
  nameBn?: string;
  order: number;
  group?: TClassGroup;
  isActive: boolean;
};
export type TClassInput = { name: string; nameBn?: string; order: number; group?: TClassGroup; isActive?: boolean };

export type TSection = {
  _id: string;
  classId: string;
  name: string;
  capacity?: number;
  classTeacherId?: string;
};
export type TSectionInput = { classId?: string; name: string; capacity?: number; classTeacherId?: string };

export type TMarkComponent = { key: string; label: string; fullMarks: number; passMarks: number };

export type TSubject = {
  _id: string;
  name: string;
  nameBn?: string;
  code?: string;
  components: TMarkComponent[];
};
export type TSubjectInput = { name: string; nameBn?: string; code?: string; components: TMarkComponent[] };

export type TSubjectKind = "compulsory" | "optional" | "fourth";

export type TClassSubject = {
  _id: string;
  sessionId: string;
  classId: string;
  sectionId?: string;
  subjectId: string;
  teacherId?: string;
  kind: TSubjectKind;
  fullMarks: number;
  passMarks: number;
  components: TMarkComponent[];
  order?: number;
};
export type TClassSubjectInput = {
  sessionId?: string;
  classId?: string;
  sectionId?: string;
  subjectId?: string;
  teacherId?: string;
  kind?: TSubjectKind;
  fullMarks?: number;
  passMarks?: number;
  components?: TMarkComponent[];
  order?: number;
};
