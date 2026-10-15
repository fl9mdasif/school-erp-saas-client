export type TDueRow = {
  studentId: string;
  studentCode?: string;
  name?: string;
  className?: string;
  section?: string;
  roll?: number;
  due: number;
  openInvoices: number;
  oldestDueDate: string;
};

export type TDuesResult = { totalDue: number; rows: TDueRow[] };

export type TCollectionGroupBy = "day" | "method" | "class" | "feeHead";
export type TCollectionRow = { key: string; label?: string; collected: number; payments: number };
export type TCollectionReport = { from: string; to: string; groupBy: TCollectionGroupBy; total: number; rows: TCollectionRow[] };
