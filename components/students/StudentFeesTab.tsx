"use client";

import { DataTable, type TColumn } from "@/components/common/DataTable";
import { StatCard } from "@/components/common/StatCard";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { formatLocalDate, formatMoney, isoToLocalDate } from "@/lib/format";
import { useT } from "@/lib/i18n/useT";
import { useGetStudentLedgerQuery } from "@/redux/api/studentApi";
import { useAppSelector } from "@/redux/hooks";
import type { TLedgerEntry } from "@/types";

export function StudentFeesTab({ studentId }: { studentId: string }) {
  const { t, lang } = useT();
  const banglaDigits = useAppSelector((s) => s.ui.banglaDigits);
  const fmt = { lang, banglaDigits } as const;
  const { data, isLoading, error, refetch } = useGetStudentLedgerQuery(studentId);

  if (error) return <ErrorState error={error} onRetry={refetch} />;
  if (isLoading || !data) return <Skeleton className="h-48 w-full" />;

  const columns: TColumn<TLedgerEntry>[] = [
    { key: "date", header: t("stu.fee.date"), cell: (e) => <span className="tabular">{formatLocalDate(isoToLocalDate(e.date), fmt)}</span> },
    {
      key: "type",
      header: t("stu.fee.type"),
      cell: (e) => (
        <span className="block min-w-0">
          <Badge variant={e.direction === "debit" ? "warning" : "success"}>{t(`stu.fee.dir.${e.direction}`)}</Badge>
          <span className="ml-2 text-sm">{e.type.replaceAll("_", " ")}</span>
          {e.note ? <span className="block truncate text-xs text-muted-foreground">{e.note}</span> : null}
        </span>
      ),
    },
    { key: "amount", header: t("stu.fee.amount"), className: "text-right", cell: (e) => <span className="tabular">{formatMoney(e.amount, fmt)}</span> },
    { key: "balance", header: t("stu.fee.balance"), className: "text-right", cell: (e) => <span className="tabular font-semibold">{formatMoney(e.balance, fmt)}</span> },
  ];

  return (
    <div className="space-y-4">
      <StatCard
        className="max-w-sm"
        label={t("stu.fee.due")}
        value={formatMoney(data.balance, fmt)}
        tone={data.balance > 0 ? "warning" : "success"}
        hint={data.balance > 0 ? t("stu.fee.owes") : t("stu.fee.clear")}
      />
      <DataTable columns={columns} rows={data.entries} rowKey={(e) => e.id} emptyTitle={t("stu.fee.empty")} />
    </div>
  );
}
