"use client";

import { useMemo } from "react";
import { DataTable, type TColumn } from "@/components/common/DataTable";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusChip } from "@/components/common/StatusChip";
import { Select } from "@/components/ui/select";
import { formatLocalDate, isoToLocalDate } from "@/lib/format";
import { useT } from "@/lib/i18n/useT";
import { useUrlState } from "@/lib/useUrlState";
import { useGetInquiriesQuery, useSetInquiryStatusMutation } from "@/redux/api/communicationApi";
import type { TInquiry, TInquiryStatus } from "@/types";

const DEFAULTS = { page: "1", status: "" };
const STATUSES: TInquiryStatus[] = ["new", "contacted", "closed"];

export function InquiriesInbox() {
  const { t, lang, banglaDigits } = useT();
  const fmt = { lang, banglaDigits } as const;
  const url = useUrlState(DEFAULTS);
  const [setStatus] = useSetInquiryStatusMutation();

  const params = { page: Number(url.get("page")), limit: 20, status: url.get("status") || undefined };
  const { data, isLoading, isFetching, error, refetch } = useGetInquiriesQuery(params);
  const newCount = useMemo(() => (data?.rows ?? []).filter((i) => i.status === "new").length, [data]);

  const columns: TColumn<TInquiry>[] = [
    {
      key: "name",
      header: t("web.inq.name"),
      cell: (i) => (
        <span className="block min-w-0">
          <span className="block truncate font-semibold text-navy">{i.name}</span>
          <span className="tabular block text-xs text-muted-foreground">{i.phone}</span>
        </span>
      ),
    },
    { key: "message", header: t("web.inq.message"), cell: (i) => <span className="line-clamp-2 max-w-sm">{i.message || "-"}</span> },
    { key: "date", header: t("fee.pay.receivedAt"), cell: (i) => formatLocalDate(isoToLocalDate(i.createdAt), fmt) },
    {
      key: "status",
      header: t("stu.col.status"),
      cell: (i) => (
        <Select
          value={i.status}
          onChange={(e) => setStatus({ id: i._id, status: e.target.value as TInquiryStatus })}
          aria-label={t("stu.col.status")}
          className="h-9 w-36"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{t(`web.inq.status.${s}`)}</option>
          ))}
        </Select>
      ),
    },
  ];

  return (
    <>
      <PageHeader title={t("web.inq.title")} description={t("web.inq.desc")} />
      {newCount > 0 ? (
        <div className="mb-4">
          <StatusChip tone="info">{t("web.inq.newCount", { count: newCount })}</StatusChip>
        </div>
      ) : null}
      <div className="mb-4 max-w-xs">
        <Select aria-label={t("stu.col.status")} value={url.get("status")} onChange={(e) => url.set({ status: e.target.value })}>
          <option value="">{t("stu.allStatus")}</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{t(`web.inq.status.${s}`)}</option>
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
        onPageChange={(p) => url.set({ page: String(p) }, { resetPage: false })}
        emptyTitle={t("web.inq.empty")}
      />
    </>
  );
}
