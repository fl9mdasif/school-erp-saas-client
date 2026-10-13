"use client";

import { ErrorState } from "@/components/common/ErrorState";
import { StatCard } from "@/components/common/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { addDays, formatNumber, todayLocal } from "@/lib/format";
import { useT } from "@/lib/i18n/useT";
import { useGetStudentAttendanceQuery } from "@/redux/api/studentApi";
import { useAppSelector } from "@/redux/hooks";

const DAYS = 90;
const pct = (n: number | null | undefined) => (n === null || n === undefined ? "-" : `${n}%`);

export function StudentAttendanceTab({ studentId }: { studentId: string }) {
  const { t, lang } = useT();
  const banglaDigits = useAppSelector((s) => s.ui.banglaDigits);
  const fmt = { lang, banglaDigits } as const;
  const to = todayLocal();
  const from = addDays(to, -(DAYS - 1));
  const { data, isLoading, error, refetch } = useGetStudentAttendanceQuery({ id: studentId, from, to });

  if (error) return <ErrorState error={error} onRetry={refetch} />;
  if (isLoading || !data) return <Skeleton className="h-48 w-full" />;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{t("stu.att.range", { days: formatNumber(DAYS, fmt) })}</p>
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label={t("stu.att.percent")} value={pct(data.totals.percent)} tone="success" />
        <StatCard label={t("ad.att.present")} value={formatNumber(data.totals.present, fmt)} />
        <StatCard label={t("ad.att.absent")} value={formatNumber(data.totals.absent, fmt)} tone="warning" />
        <StatCard label={t("ad.att.late")} value={formatNumber(data.totals.late, fmt)} />
        <StatCard label={t("ad.att.leave")} value={formatNumber(data.totals.leave, fmt)} />
      </section>

      <Card>
        <CardHeader>
          <CardTitle>{t("stu.att.byMonth")}</CardTitle>
        </CardHeader>
        <CardContent>
          {data.months.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("stu.att.none")}</p>
          ) : (
            <ul className="divide-y divide-border text-sm">
              {data.months.map((m) => (
                <li key={m.month} className="flex flex-wrap items-center justify-between gap-2 py-2">
                  <span className="tabular font-medium">{m.month}</span>
                  <span className="tabular text-muted-foreground">
                    {t("stu.att.line", { p: formatNumber(m.present, fmt), a: formatNumber(m.absent, fmt), l: formatNumber(m.late, fmt) })}
                  </span>
                  <span className="tabular font-semibold text-navy">{pct(m.percent)}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
