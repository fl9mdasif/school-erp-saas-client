"use client";

import { Banknote, Bell, CalendarCheck, GraduationCap, Inbox, UserPlus, Users } from "lucide-react";
import Link from "next/link";
import { ErrorState } from "@/components/common/ErrorState";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber } from "@/lib/format";
import { useT } from "@/lib/i18n/useT";
import { useGetDashboardSummaryQuery } from "@/redux/api/dashboardApi";
import { useAppSelector } from "@/redux/hooks";

const QUICK = [
  { href: "/dashboard/students/new", label: "ad.quick.addStudent", icon: UserPlus },
  { href: "/dashboard/attendance/take", label: "ad.quick.takeAttendance", icon: CalendarCheck },
  { href: "/dashboard/notices/new", label: "ad.quick.newNotice", icon: Bell },
  { href: "/dashboard/fees/collect", label: "ad.quick.collectFee", icon: Banknote },
] as const;

const ATT = [
  { key: "present", label: "ad.att.present", dot: "bg-success" },
  { key: "absent", label: "ad.att.absent", dot: "bg-destructive" },
  { key: "late", label: "ad.att.late", dot: "bg-warning" },
  { key: "leave", label: "ad.att.leave", dot: "bg-highlight" },
] as const;

export function AdminHome() {
  const { t, term, lang } = useT();
  const banglaDigits = useAppSelector((s) => s.ui.banglaDigits);
  const fmt = { lang, banglaDigits } as const;
  const { data, isLoading, error, refetch } = useGetDashboardSummaryQuery();

  if (error) return <ErrorState error={error} onRetry={refetch} />;
  const att = data?.attendanceToday;

  return (
    <>
      <PageHeader title={t("ad.home.title")} description={t("ad.home.desc")} />

      <section aria-label={t("ad.home.title")} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={GraduationCap} label={t("ad.stat.students", { students: term("student") })} value={formatNumber(data?.students ?? 0, fmt)} loading={isLoading} />
        <StatCard icon={Users} label={t("ad.stat.staff")} value={formatNumber(data?.staff ?? 0, fmt)} loading={isLoading} />
        <StatCard icon={Inbox} tone="warning" label={t("ad.stat.inquiries")} value={formatNumber(data?.newInquiries ?? 0, fmt)} loading={isLoading} />
        <StatCard icon={Bell} label={t("ad.stat.notices")} value={formatNumber(data?.notices ?? 0, fmt)} loading={isLoading} />
      </section>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("ad.att.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : !att || att.sheets === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">{t("ad.att.none")}</p>
            ) : (
              <>
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {ATT.map((a) => (
                    <li key={a.key} className="rounded-lg border border-border p-3">
                      <p className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className={`size-2 rounded-full ${a.dot}`} aria-hidden="true" />
                        {t(a.label)}
                      </p>
                      <p className="tabular mt-1 text-xl font-semibold text-navy">{formatNumber(att[a.key], fmt)}</p>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs text-muted-foreground">{t("ad.att.sheets", { count: formatNumber(att.sheets, fmt) })}</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("ad.quick.title")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2">
            {QUICK.map((q) => (
              <Link
                key={q.href}
                href={q.href}
                className="flex min-h-11 items-center gap-3 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-accent"
              >
                <q.icon className="size-5 text-primary" aria-hidden="true" />
                {t(q.label)}
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
