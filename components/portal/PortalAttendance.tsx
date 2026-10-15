"use client";

import { useGetStudentAttendanceQuery } from "@/redux/api/studentApi";
import { ChildPicker } from "./ChildPicker";
import { ErrorState } from "@/components/common/ErrorState";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber, todayLocal } from "@/lib/format";
import { useT } from "@/lib/i18n/useT";
import { useAppSelector } from "@/redux/hooks";

const DOT: Record<string, string> = { present: "bg-success", absent: "bg-destructive", late: "bg-warning", leave: "bg-highlight" };

function monthRange() {
  const now = new Date();
  const from = todayLocal(new Date(now.getFullYear(), now.getMonth(), 1));
  const to = todayLocal(now);
  return { from, to };
}

export function PortalAttendance() {
  const { t, lang } = useT();
  const banglaDigits = useAppSelector((s) => s.ui.banglaDigits);
  const fmt = { lang, banglaDigits } as const;
  const { from, to } = monthRange();

  return (
    <>
      <PageHeader title={t("pt.att.title")} />
      <ChildPicker>{(activeId) => <MonthCalendar id={activeId} from={from} to={to} fmt={fmt} />}</ChildPicker>
    </>
  );
}

function MonthCalendar({ id, from, to, fmt }: { id: string; from: string; to: string; fmt: { lang: "bn" | "en"; banglaDigits: boolean } }) {
  const { t } = useT();
  const { data, isLoading, error, refetch } = useGetStudentAttendanceQuery({ id, from, to });

  if (isLoading) return <Skeleton className="h-64 w-full max-w-md" />;
  if (error || !data) return <ErrorState error={error} onRetry={refetch} />;

  const byDate = new Map(data.days.map((d) => [d.date, d.status]));
  const [y, m] = from.split("-").map(Number);
  const daysInMonth = new Date(y, m, 0).getDate();
  const firstWeekday = new Date(y, m - 1, 1).getDay();
  const blanks: null[] = Array.from({ length: firstWeekday }, () => null);
  const days: number[] = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const cells: (number | null)[] = [...blanks, ...days];

  return (
    <>
      <div className="mb-4 grid grid-cols-2 gap-3 sm:max-w-xs">
        <StatCard label={t("pt.att.percent")} value={data.totals.percent !== null ? `${data.totals.percent}%` : "-"} />
        <StatCard label={t("pt.att.present")} value={formatNumber(data.totals.present, fmt)} tone="success" />
      </div>
      <div className="grid max-w-md grid-cols-7 gap-1 text-center text-xs">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i} className="font-medium text-muted-foreground">{d}</div>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <div key={i} />;
          const date = `${from.slice(0, 8)}${String(day).padStart(2, "0")}`;
          const status = byDate.get(date);
          return (
            <div key={i} className={`flex aspect-square items-center justify-center rounded-md text-white ${status ? DOT[status] : "bg-muted text-foreground"}`}>
              {day}
            </div>
          );
        })}
      </div>
    </>
  );
}
