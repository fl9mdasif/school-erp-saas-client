"use client";

import { useState } from "react";
import { DatePicker } from "@/components/common/DatePicker";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { FormField } from "@/components/common/FormField";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { addDays, formatNumber, todayLocal } from "@/lib/format";
import { useT } from "@/lib/i18n/useT";
import { cn } from "@/lib/utils";
import { useGetSectionReportQuery, useGetTakeableSectionsQuery } from "@/redux/api/attendanceApi";
import { useAppSelector } from "@/redux/hooks";
import type { TAttendanceStatus } from "@/types";

const MARK: Record<TAttendanceStatus, { letter: string; cls: string }> = {
  present: { letter: "P", cls: "text-success-deep" },
  absent: { letter: "A", cls: "bg-destructive-tint text-destructive-deep font-bold" },
  late: { letter: "L", cls: "bg-warning-tint text-warning-deep font-bold" },
  leave: { letter: "V", cls: "text-info-deep font-bold" },
};

export function AttendanceReports() {
  const { t, term, lang } = useT();
  const banglaDigits = useAppSelector((s) => s.ui.banglaDigits);
  const fmt = { lang, banglaDigits } as const;
  const sections = useGetTakeableSectionsQuery();
  const today = todayLocal();
  const [sectionId, setSectionId] = useState("");
  const [from, setFrom] = useState(addDays(today, -29));
  const [to, setTo] = useState(today);
  const active = sectionId || sections.data?.[0]?.sectionId || "";
  const valid = !!active && !!from && !!to && from <= to;
  const report = useGetSectionReportQuery({ sectionId: active, from, to }, { skip: !valid });

  return (
    <>
      <PageHeader title={t("att.rep.title")} description={t("att.rep.desc")} />

      <div className="mb-4 grid gap-3 sm:grid-cols-3 lg:max-w-3xl">
        <FormField label={`${term("class")} / ${term("section")}`}>
          {(c) => (
            <Select {...c} value={active} onChange={(e) => setSectionId(e.target.value)}>
              {(sections.data ?? []).map((s) => (
                <option key={s.sectionId} value={s.sectionId}>
                  {s.className}
                  {s.name ? ` · ${s.name}` : ""}
                </option>
              ))}
            </Select>
          )}
        </FormField>
        <FormField label={t("att.rep.from")}>
          {(c) => <DatePicker {...c} max={to} value={from} onChange={(d) => d && setFrom(d)} />}
        </FormField>
        <FormField label={t("att.rep.to")} error={from > to ? t("val.dateOrder") : undefined}>
          {(c) => <DatePicker {...c} min={from} max={today} value={to} onChange={(d) => d && setTo(d)} />}
        </FormField>
      </div>

      <p className="mb-2 text-xs text-muted-foreground">{t("att.rep.legend")}</p>

      {report.error ? (
        <ErrorState error={report.error} onRetry={report.refetch} />
      ) : sections.isLoading || report.isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : !report.data || report.data.rows.length === 0 ? (
        <EmptyState title={t("att.rep.empty")} description={t("att.rep.emptyDesc")} />
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-max border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-muted text-left">
                <th scope="col" className="sticky left-0 z-10 bg-muted px-3 py-2 font-semibold">{t("stu.col.name", { student: term("student") })}</th>
                {report.data.days.map((d) => (
                  <th key={d} scope="col" className="tabular px-1.5 py-2 text-center text-xs font-medium text-muted-foreground">
                    {formatNumber(Number(d.slice(8)), fmt)}
                  </th>
                ))}
                <th scope="col" className="px-3 py-2 text-right font-semibold">%</th>
              </tr>
            </thead>
            <tbody>
              {report.data.rows.map((r) => (
                <tr key={r.studentId} className="border-b border-border last:border-0">
                  <th scope="row" className="sticky left-0 bg-card px-3 py-1.5 text-left font-medium">
                    <span className="block max-w-48 truncate">{r.name}</span>
                  </th>
                  {report.data!.days.map((d) => {
                    const st = r.byDate[d];
                    return (
                      <td key={d} className={cn("px-1.5 py-1.5 text-center text-xs", st && MARK[st].cls)}>
                        {st ? MARK[st].letter : "·"}
                        {st ? <span className="sr-only">{t(`att.status.${st}`)}</span> : null}
                      </td>
                    );
                  })}
                  <td className="tabular px-3 py-1.5 text-right font-semibold text-navy">
                    {r.percent === null ? "-" : `${formatNumber(r.percent, fmt)}%`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}
