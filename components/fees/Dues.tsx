"use client";

import { Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import toast from "react-hot-toast";
import { DataTable, type TColumn } from "@/components/common/DataTable";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { downloadFile } from "@/lib/download";
import { getApiErrorMessage } from "@/lib/errors";
import { formatMoney } from "@/lib/format";
import { useT } from "@/lib/i18n/useT";
import { useUrlState } from "@/lib/useUrlState";
import { useGetClassesQuery } from "@/redux/api/academicApi";
import { useGetDuesQuery } from "@/redux/api/feeReportApi";
import type { TDueRow } from "@/types";

const DEFAULTS = { page: "1", classId: "", minAmount: "", overdueOnly: "" };

export function Dues() {
  const { t, lang, banglaDigits, term } = useT();
  const fmt = { lang, banglaDigits } as const;
  const router = useRouter();
  const url = useUrlState(DEFAULTS);
  const classes = useGetClassesQuery();

  const params = {
    page: Number(url.get("page")),
    limit: 20,
    classId: url.get("classId") || undefined,
    minAmount: url.get("minAmount") || undefined,
    overdueOnly: url.get("overdueOnly") || undefined,
  };
  const { data, isLoading, isFetching, error, refetch } = useGetDuesQuery(params);

  const exportCsv = async () => {
    try {
      await downloadFile("/fees/dues", "dues.csv", { ...params, format: "csv" });
    } catch (err) {
      toast.error(getApiErrorMessage(err, t));
    }
  };

  const columns = useMemo<TColumn<TDueRow>[]>(
    () => [
      {
        key: "name",
        header: t("stu.col.name", { student: term("student") }),
        cell: (r) => (
          <span className="block min-w-0">
            <span className="block truncate font-semibold text-navy">{r.name}</span>
            <span className="tabular block text-xs text-muted-foreground">{r.studentCode}</span>
          </span>
        ),
      },
      { key: "class", header: term("class"), cell: (r) => `${r.className ?? "-"}${r.section ? ` · ${r.section}` : ""}` },
      { key: "due", header: t("fee.inv.due"), cell: (r) => <span className="tabular font-semibold text-destructive">{formatMoney(r.due, fmt)}</span> },
      { key: "open", header: t("fee.dues.openInvoices"), cell: (r) => r.openInvoices },
      { key: "oldest", header: t("fee.dues.oldestDue"), cell: (r) => r.oldestDueDate },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, term, lang, banglaDigits]
  );

  return (
    <>
      <PageHeader
        title={t("fee.dues.title")}
        description={t("fee.dues.desc")}
        action={
          <Button variant="outline" onClick={exportCsv}>
            <Download aria-hidden="true" />
            {t("stu.export")}
          </Button>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-3 md:max-w-2xl">
        <Select aria-label={term("class")} value={url.get("classId")} onChange={(e) => url.set({ classId: e.target.value })}>
          <option value="">{t("fee.gen.allClasses")}</option>
          {(classes.data?.rows ?? []).map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </Select>
        <Input
          type="number"
          min={0}
          placeholder={t("fee.dues.minAmount")}
          aria-label={t("fee.dues.minAmount")}
          value={url.get("minAmount")}
          onChange={(e) => url.set({ minAmount: e.target.value })}
        />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="size-4" checked={url.get("overdueOnly") === "true"} onChange={(e) => url.set({ overdueOnly: e.target.checked ? "true" : "" })} />
          {t("fee.dues.overdueOnly")}
        </label>
      </div>

      <p className="tabular mb-3 text-lg font-bold text-navy">{t("fee.dues.totalDue")}: {formatMoney(data?.totalDue ?? 0, fmt)}</p>

      <DataTable
        columns={columns}
        rows={data?.rows}
        meta={data?.meta}
        rowKey={(r) => r.studentId}
        loading={isLoading || (isFetching && !data)}
        error={error}
        onRetry={refetch}
        onRowClick={(r) => router.push(`/dashboard/students/${r.studentId}`)}
        onPageChange={(p) => url.set({ page: String(p) }, { resetPage: false })}
        emptyTitle={t("fee.dues.empty")}
      />
    </>
  );
}
