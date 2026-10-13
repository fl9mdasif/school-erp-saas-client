"use client";

import { Building2, CheckCircle2, Clock, GraduationCap, PauseCircle, Users, XCircle } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ErrorState } from "@/components/common/ErrorState";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { daysUntil, formatLocalDate, formatNumber, isoToLocalDate } from "@/lib/format";
import { useT } from "@/lib/i18n/useT";
import { useGetPlatformStatsQuery, useGetTenantsQuery } from "@/redux/api/platformApi";
import { useAppSelector } from "@/redux/hooks";

// Recharts is only needed on this page, so it is loaded on demand and keeps the dashboard shell small
const SignupsChart = dynamic(() => import("./SignupsChart"), {
  ssr: false,
  loading: () => <Skeleton className="h-56 w-full" />,
});

export function PlatformOverview() {
  const { t, lang } = useT();
  const banglaDigits = useAppSelector((s) => s.ui.banglaDigits);
  const fmt = { lang, banglaDigits } as const;
  const stats = useGetPlatformStatsQuery();
  const trials = useGetTenantsQuery({ status: "trial", limit: 100 });

  if (stats.isError) return <ErrorState error={stats.error} onRetry={stats.refetch} />;

  const by = stats.data?.tenantsByStatus ?? {};
  const total = Object.values(by).reduce((a, b) => a + (b ?? 0), 0);
  const endingSoon = (trials.data?.rows ?? [])
    .map((r) => ({ ...r, left: daysUntil(isoToLocalDate(r.trialEndsAt)) }))
    .filter((r) => r.left >= 0 && r.left <= 7)
    .sort((a, b) => a.left - b.left);

  return (
    <>
      <PageHeader title={t("pf.overview.title")} description={t("pf.overview.desc")} />

      <section aria-label={t("pf.overview.title")} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Building2} label={t("pf.kpi.total")} value={formatNumber(total, fmt)} loading={stats.isLoading} />
        <StatCard icon={Clock} label={t("pf.kpi.trial")} value={formatNumber(by.trial ?? 0, fmt)} loading={stats.isLoading} />
        <StatCard icon={CheckCircle2} tone="success" label={t("pf.kpi.active")} value={formatNumber(by.active ?? 0, fmt)} loading={stats.isLoading} />
        <StatCard icon={PauseCircle} tone="warning" label={t("pf.kpi.suspended")} value={formatNumber(by.suspended ?? 0, fmt)} loading={stats.isLoading} />
        <StatCard icon={XCircle} label={t("pf.kpi.cancelled")} value={formatNumber(by.cancelled ?? 0, fmt)} loading={stats.isLoading} />
        <StatCard icon={Users} label={t("pf.kpi.users")} value={formatNumber(stats.data?.users ?? 0, fmt)} loading={stats.isLoading} />
        <StatCard icon={GraduationCap} label={t("pf.kpi.students")} value={formatNumber(stats.data?.students ?? 0, fmt)} loading={stats.isLoading} />
      </section>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("pf.signups.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.isLoading ? (
              <Skeleton className="h-56 w-full" />
            ) : stats.data && stats.data.signupsPerWeek.length > 0 ? (
              <SignupsChart data={stats.data.signupsPerWeek} />
            ) : (
              <p className="py-10 text-center text-sm text-muted-foreground">{t("pf.signups.empty")}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("pf.trialsEnding.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            {trials.isLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : endingSoon.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">{t("pf.trialsEnding.empty")}</p>
            ) : (
              <ul className="divide-y divide-border">
                {endingSoon.map((r) => (
                  <li key={r.id}>
                    <Link href={`/platform/tenants/${r.id}`} className="flex min-h-12 items-center justify-between gap-3 py-2 hover:text-primary">
                      <span className="min-w-0 truncate font-medium">{r.name}</span>
                      <span className="tabular shrink-0 text-sm text-muted-foreground">
                        {t("pf.trialsEnding.on", { date: formatLocalDate(isoToLocalDate(r.trialEndsAt), fmt) })}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
