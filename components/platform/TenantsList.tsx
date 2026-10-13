"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { DataTable, type TColumn } from "@/components/common/DataTable";
import { PageHeader } from "@/components/common/PageHeader";
import { SearchInput } from "@/components/common/SearchInput";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { formatLocalDate, formatNumber, isoToLocalDate } from "@/lib/format";
import { useT } from "@/lib/i18n/useT";
import { useUrlState } from "@/lib/useUrlState";
import { useGetTenantsQuery } from "@/redux/api/platformApi";
import { useAppSelector } from "@/redux/hooks";
import type { TTenantRow } from "@/types";
import { TenantStatusChip } from "./TenantStatusChip";

const DEFAULTS = { page: "1", q: "", status: "", type: "" };

export function TenantsList() {
  const { t, lang } = useT();
  const router = useRouter();
  const banglaDigits = useAppSelector((s) => s.ui.banglaDigits);
  const fmt = { lang, banglaDigits } as const;
  const url = useUrlState(DEFAULTS);

  const params = { page: Number(url.get("page")), limit: 20, q: url.get("q") || undefined, status: url.get("status") || undefined, type: url.get("type") || undefined };
  const { data, isFetching, isLoading, error, refetch } = useGetTenantsQuery(params);

  const columns = useMemo<TColumn<TTenantRow>[]>(
    () => [
      {
        key: "name",
        header: t("pf.tenants.col.name"),
        cell: (r) => (
          <span className="block min-w-0">
            <span className="block truncate font-semibold text-navy">{r.name}</span>
            <span className="block truncate text-xs text-muted-foreground">{r.slug}</span>
          </span>
        ),
      },
      { key: "type", header: t("pf.tenants.col.type"), cell: (r) => t(`pf.type.${r.institutionType}`) },
      {
        key: "status",
        header: t("pf.tenants.col.status"),
        cell: (r) => <TenantStatusChip status={r.effectiveStatus} />,
      },
      { key: "cap", header: t("pf.tenants.col.cap"), cell: (r) => formatNumber(r.studentCap, fmt), className: "text-right" },
      { key: "trial", header: t("pf.tenants.col.trial"), cell: (r) => formatLocalDate(isoToLocalDate(r.trialEndsAt), fmt), hideOnCard: true },
      { key: "created", header: t("pf.tenants.col.created"), cell: (r) => formatLocalDate(isoToLocalDate(r.createdAt), fmt), hideOnCard: true },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, lang, banglaDigits]
  );

  const filtered = !!(url.get("q") || url.get("status") || url.get("type"));

  return (
    <>
      <PageHeader title={t("pf.tenants.title")} description={t("pf.tenants.desc")} />

      <div className="mb-4 grid gap-3 md:grid-cols-[1fr_12rem_12rem]">
        <SearchInput value={url.get("q")} onChange={(q) => url.set({ q })} placeholder={t("pf.tenants.search")} />
        <Select aria-label={t("pf.tenants.col.status")} value={url.get("status")} onChange={(e) => url.set({ status: e.target.value })}>
          <option value="">{t("pf.tenants.allStatus")}</option>
          {(["trial", "active", "suspended", "cancelled"] as const).map((s) => (
            <option key={s} value={s}>{t(`pf.status.${s}`)}</option>
          ))}
        </Select>
        <Select aria-label={t("pf.tenants.col.type")} value={url.get("type")} onChange={(e) => url.set({ type: e.target.value })}>
          <option value="">{t("pf.tenants.allTypes")}</option>
          {(["school", "madrasa", "coaching"] as const).map((s) => (
            <option key={s} value={s}>{t(`pf.type.${s}`)}</option>
          ))}
        </Select>
      </div>

      <DataTable
        columns={columns}
        rows={data?.rows}
        meta={data?.meta}
        rowKey={(r) => r.id}
        loading={isLoading || (isFetching && !data)}
        error={error}
        onRetry={refetch}
        onPageChange={(page) => url.set({ page: String(page) }, { resetPage: false })}
        onRowClick={(r) => router.push(`/platform/tenants/${r.id}`)}
        emptyTitle={t("pf.tenants.empty")}
        emptyDescription={t("pf.tenants.emptyDesc")}
        emptyAction={
          filtered ? (
            <Button variant="outline" onClick={() => url.set({ q: "", status: "", type: "" })}>
              {t("common.clear")}
            </Button>
          ) : undefined
        }
      />
    </>
  );
}
