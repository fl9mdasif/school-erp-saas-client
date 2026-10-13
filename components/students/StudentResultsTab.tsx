"use client";

import { ErrorState } from "@/components/common/ErrorState";
import { StatusChip } from "@/components/common/StatusChip";
import { EmptyState } from "@/components/common/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber } from "@/lib/format";
import { useT } from "@/lib/i18n/useT";
import { useGetStudentResultsQuery } from "@/redux/api/studentApi";
import { useAppSelector } from "@/redux/hooks";

export function StudentResultsTab({ studentId }: { studentId: string }) {
  const { t, lang } = useT();
  const banglaDigits = useAppSelector((s) => s.ui.banglaDigits);
  const fmt = { lang, banglaDigits } as const;
  const { data, isLoading, error, refetch } = useGetStudentResultsQuery(studentId);

  if (error) return <ErrorState error={error} onRetry={refetch} />;
  if (isLoading || !data) return <Skeleton className="h-48 w-full" />;
  if (data.length === 0) return <EmptyState title={t("stu.res.empty")} />;

  return (
    <div className="space-y-4">
      {data.map((r) => (
        <Card key={r._id}>
          <CardHeader className="flex-row flex-wrap items-start justify-between gap-2">
            <CardTitle>{r.examName ?? "-"}</CardTitle>
            <span className="flex items-center gap-2">
              {r.status === "draft" ? <Badge>{t("stu.res.draft")}</Badge> : null}
              <StatusChip tone={r.passed ? "success" : "destructive"}>{r.passed ? t("stu.res.passed") : t("stu.res.failed")}</StatusChip>
            </span>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="tabular flex flex-wrap gap-x-6 gap-y-1 text-sm">
              <span>{t("stu.res.total")}: <b>{formatNumber(r.totalMarks, fmt)} / {formatNumber(r.fullMarks, fmt)}</b></span>
              <span>{t("stu.res.percent")}: <b>{formatNumber(r.percent, fmt)}%</b></span>
              {r.gpa !== undefined && r.gpa !== null ? <span>GPA: <b>{formatNumber(r.gpa, fmt)}</b> {r.letter ? `(${r.letter})` : ""}</span> : null}
              {r.division ? <span>{r.division}</span> : null}
              {r.positionInClass ? <span>{t("stu.res.position")}: <b>{formatNumber(r.positionInClass, fmt)}</b></span> : null}
            </p>
            <ul className="grid gap-1 text-sm sm:grid-cols-2">
              {r.subjects.map((s) => (
                <li key={s.subjectId} className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2">
                  <span className="min-w-0 truncate">{s.name}</span>
                  <span className="tabular shrink-0 font-medium">
                    {formatNumber(s.total, fmt)}/{formatNumber(s.fullMarks, fmt)} <span className={s.passed ? "text-success-deep" : "text-destructive"}>{s.letter}</span>
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
