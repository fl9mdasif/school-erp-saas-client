"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { DataTable, type TColumn } from "@/components/common/DataTable";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusChip, type TTone } from "@/components/common/StatusChip";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { formatLocalDate, formatMoney, isoToLocalDate } from "@/lib/format";
import { useT } from "@/lib/i18n/useT";
import { useUrlState } from "@/lib/useUrlState";
import { useGetClassesQuery } from "@/redux/api/academicApi";
import { useGetInvoicesQuery } from "@/redux/api/feesApi";
import { useAppSelector } from "@/redux/hooks";
import type { TInvoice } from "@/types";

const DEFAULTS = { page: "1", classId: "", status: "" };
const STATUSES: TInvoice["status"][] = ["unpaid", "partial", "paid", "voided"];
const TONE: Record<TInvoice["status"], TTone> = { unpaid: "warning", partial: "info", paid: "success", voided: "muted" };

export function InvoicesList() {
  const { t, lang, term } = useT();
  const banglaDigits = useAppSelector((s) => s.ui.banglaDigits);
  const fmt = { lang, banglaDigits } as const;
  const router = useRouter();
  const url = useUrlState(DEFAULTS);
  const classes = useGetClassesQuery();
  const sessionId = useAppSelector((s) => s.ui.selectedSessionId);

  const params = {
    page: Number(url.get("page")),
    limit: 20,
    classId: url.get("classId") || undefined,
    status: url.get("status") || undefined,
    sessionId: sessionId || undefined,
  };
  const { data, isLoading, isFetching, error, refetch } = useGetInvoicesQuery(params);

  const columns = useMemo<TColumn<TInvoice>[]>(
    () => [
      {
        key: "invoiceNo",
        header: t("fee.inv.no"),
        cell: (i) => (
          <span className="block min-w-0">
            <span className="tabular block font-semibold text-navy">{i.invoiceNo}</span>
            <span className="block truncate text-xs text-muted-foreground">
              {typeof i.studentId === "object" ? `${i.studentId.name} · ${i.studentId.studentId}` : i.studentId}
            </span>
          </span>
        ),
      },
      { key: "period", header: t("fee.inv.period"), cell: (i) => i.periodLabel },
      { key: "total", header: t("fee.inv.total"), cell: (i) => <span className="tabular">{formatMoney(i.total, fmt)}</span> },
      { key: "due", header: t("fee.inv.due"), cell: (i) => <span className="tabular">{formatMoney(i.dueAmount, fmt)}</span> },
      { key: "dueDate", header: t("fee.gen.dueDate"), cell: (i) => formatLocalDate(isoToLocalDate(i.dueDate), fmt) },
      { key: "status", header: t("stu.col.status"), cell: (i) => <StatusChip tone={TONE[i.status]}>{t(`fee.inv.status.${i.status}`)}</StatusChip> },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, lang, banglaDigits]
  );

  return (
    <>
      <PageHeader
        title={t("fee.inv.title")}
        description={t("fee.inv.desc")}
        action={
          <Button asChild>
            <Link href="/dashboard/fees/invoices/generate">
              <Plus aria-hidden="true" />
              {t("fee.gen.title")}
            </Link>
          </Button>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 md:max-w-md">
        <Select aria-label={term("class")} value={url.get("classId")} onChange={(e) => url.set({ classId: e.target.value })}>
          <option value="">{t("fee.gen.allClasses")}</option>
          {(classes.data?.rows ?? []).map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </Select>
        <Select aria-label={t("stu.col.status")} value={url.get("status")} onChange={(e) => url.set({ status: e.target.value })}>
          <option value="">{t("stu.allStatus")}</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{t(`fee.inv.status.${s}`)}</option>
          ))}
        </Select>
      </div>

      <DataTable
        columns={columns}
        rows={data?.rows}
        meta={data?.meta}
        rowKey={(i) => i._id}
        loading={isLoading || (isFetching && !data)}
        error={error}
        onRetry={refetch}
        onRowClick={(i) => router.push(`/dashboard/fees/invoices/${i._id}`)}
        emptyTitle={t("fee.inv.empty")}
        emptyDescription={t("fee.inv.emptyDesc")}
        onPageChange={(p) => url.set({ page: String(p) }, { resetPage: false })}
      />
    </>
  );
}
