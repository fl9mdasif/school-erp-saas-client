"use client";

import { CalendarCheck, Check } from "lucide-react";
import Link from "next/link";
import { ErrorState } from "@/components/common/ErrorState";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber } from "@/lib/format";
import { useT } from "@/lib/i18n/useT";
import { useGetDashboardSummaryQuery } from "@/redux/api/dashboardApi";
import { useAppSelector } from "@/redux/hooks";
import type { TTeacherSummary } from "@/types";

export function TeacherHome() {
  const { t, lang, term } = useT();
  const banglaDigits = useAppSelector((s) => s.ui.banglaDigits);
  const fmt = { lang, banglaDigits } as const;
  const { data: raw, isLoading, error, refetch } = useGetDashboardSummaryQuery();
  const data = raw?.role === "teacher" ? (raw as TTeacherSummary) : undefined;

  if (error) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <>
      <PageHeader title={t("tc.home.title")} description={t("tc.home.desc")} />

      <section aria-label={t("tc.home.title")} className="mb-4 grid gap-3 sm:grid-cols-2">
        <StatCard icon={CalendarCheck} tone={data && data.pendingAttendance > 0 ? "warning" : "success"} label={t("tc.stat.pending")} value={formatNumber(data?.pendingAttendance ?? 0, fmt)} loading={isLoading} />
      </section>

      <Card>
        <CardHeader>
          <CardTitle>{t("tc.myClasses")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : !data || data.myClasses.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">{t("tc.noClasses")}</p>
          ) : (
            data.myClasses.map((c) => (
              <div key={c.sectionId} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
                <div>
                  <p className="font-medium text-navy">{c.name ?? term("section")}</p>
                  <p className="text-xs text-muted-foreground">{formatNumber(c.students, fmt)} {term("student")}</p>
                </div>
                {c.attendanceTakenToday ? (
                  <span className="flex items-center gap-1 text-sm text-success-deep">
                    <Check className="size-4" aria-hidden="true" />
                    {t("tc.taken")}
                  </span>
                ) : (
                  <Button size="sm" asChild>
                    <Link href="/dashboard/attendance/take">{t("tc.takeNow")}</Link>
                  </Button>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </>
  );
}
