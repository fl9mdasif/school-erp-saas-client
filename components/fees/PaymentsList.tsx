"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { DataTable, type TColumn } from "@/components/common/DataTable";
import { DatePicker } from "@/components/common/DatePicker";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusChip } from "@/components/common/StatusChip";
import { Select } from "@/components/ui/select";
import { formatLocalDate, formatMoney, isoToLocalDate } from "@/lib/format";
import { useT } from "@/lib/i18n/useT";
import { useUrlState } from "@/lib/useUrlState";
import { useGetPaymentsQuery } from "@/redux/api/paymentApi";
import { useAppSelector } from "@/redux/hooks";
import type { TPayment, TPaymentMethod } from "@/types";

const DEFAULTS = { page: "1", method: "", from: "", to: "" };
const METHODS: TPaymentMethod[] = ["cash", "bank", "cheque", "bkash_manual", "nagad_manual", "rocket_manual"];

export function PaymentsList() {
  const { t, lang } = useT();
  const banglaDigits = useAppSelector((s) => s.ui.banglaDigits);
  const fmt = { lang, banglaDigits } as const;
  const router = useRouter();
  const url = useUrlState(DEFAULTS);

  const params = {
    page: Number(url.get("page")),
    limit: 20,
    method: url.get("method") || undefined,
    from: url.get("from") || undefined,
    to: url.get("to") || undefined,
  };
  const { data, isLoading, isFetching, error, refetch } = useGetPaymentsQuery(params);

  const columns = useMemo<TColumn<TPayment>[]>(
    () => [
      {
        key: "receiptNo",
        header: t("fee.pay.receiptNo"),
        cell: (p) => (
          <span className="block min-w-0">
            <span className="tabular block font-semibold text-navy">{p.receiptNo}</span>
            <span className="block truncate text-xs text-muted-foreground">
              {typeof p.studentId === "object" ? `${p.studentId.name} · ${p.studentId.studentId}` : p.studentId}
            </span>
          </span>
        ),
      },
      { key: "amount", header: t("fee.str.amount"), cell: (p) => <span className="tabular">{formatMoney(p.amount, fmt)}</span> },
      { key: "method", header: t("fee.collect.method"), cell: (p) => t(`fee.collect.method.${p.method}`) },
      { key: "receivedAt", header: t("fee.pay.receivedAt"), cell: (p) => formatLocalDate(isoToLocalDate(p.receivedAt), fmt) },
      {
        key: "status",
        header: t("stu.col.status"),
        cell: (p) => <StatusChip tone={p.status === "reversed" ? "muted" : "success"}>{t(`fee.pay.status.${p.status}`)}</StatusChip>,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, lang, banglaDigits]
  );

  return (
    <>
      <PageHeader title={t("fee.pay.title")} description={t("fee.pay.desc")} />

      <div className="mb-4 grid gap-3 sm:grid-cols-3 md:max-w-xl">
        <Select aria-label={t("fee.collect.method")} value={url.get("method")} onChange={(e) => url.set({ method: e.target.value })}>
          <option value="">{t("fee.gen.allHeads")}</option>
          {METHODS.map((m) => (
            <option key={m} value={m}>{t(`fee.collect.method.${m}`)}</option>
          ))}
        </Select>
        <DatePicker aria-label={t("fee.pay.from")} value={url.get("from")} onChange={(v) => url.set({ from: v })} />
        <DatePicker aria-label={t("fee.pay.to")} value={url.get("to")} onChange={(v) => url.set({ to: v })} />
      </div>

      <DataTable
        columns={columns}
        rows={data?.rows}
        meta={data?.meta}
        rowKey={(p) => p._id}
        loading={isLoading || (isFetching && !data)}
        error={error}
        onRetry={refetch}
        onRowClick={(p) => router.push(`/dashboard/fees/payments/${p._id}`)}
        onPageChange={(p) => url.set({ page: String(p) }, { resetPage: false })}
        emptyTitle={t("fee.pay.empty")}
        emptyDescription={t("fee.pay.emptyDesc")}
      />
    </>
  );
}
