"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { DataTable, type TColumn } from "@/components/common/DataTable";
import { PageHeader } from "@/components/common/PageHeader";
import { SearchInput } from "@/components/common/SearchInput";
import { StatusChip } from "@/components/common/StatusChip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StaffActions } from "./StaffActions";
import { Select } from "@/components/ui/select";
import { formatLocalDate, isoToLocalDate } from "@/lib/format";
import { useT } from "@/lib/i18n/useT";
import { useUrlState } from "@/lib/useUrlState";
import { useGetStaffQuery } from "@/redux/api/staffApi";
import { useAppSelector } from "@/redux/hooks";
import type { TStaff } from "@/types";

const DEFAULTS = { page: "1", q: "", role: "", status: "" };

export function StaffList() {
  const { t, term, lang } = useT();
  const banglaDigits = useAppSelector((s) => s.ui.banglaDigits);
  const fmt = { lang, banglaDigits } as const;
  const me = useAppSelector((s) => s.auth.user?.id);
  const url = useUrlState(DEFAULTS);

  const params = { page: Number(url.get("page")), limit: 20, q: url.get("q") || undefined, role: url.get("role") || undefined, status: url.get("status") || undefined };
  const { data, isLoading, isFetching, error, refetch } = useGetStaffQuery(params);

  const columns = useMemo<TColumn<TStaff>[]>(
    () => [
      {
        key: "name",
        header: t("st.col.name"),
        cell: (u) => (
          <span className="block min-w-0">
            <span className="block truncate font-semibold text-navy">
              {u.name}
              {u._id === me ? <Badge className="ml-2">{t("st.you")}</Badge> : null}
            </span>
            <span className="block truncate text-xs text-muted-foreground">{u.email ?? u.phone}</span>
          </span>
        ),
      },
      { key: "role", header: t("st.col.role"), cell: (u) => t(`st.role.${u.role}`, { teacher: term("teacher") }) },
      {
        key: "status",
        header: t("st.col.status"),
        cell: (u) => <StatusChip tone={u.status === "active" ? "success" : "muted"}>{t(`st.status.${u.status}`)}</StatusChip>,
      },
      {
        key: "last",
        header: t("st.col.lastLogin"),
        cell: (u) => (u.lastLoginAt ? formatLocalDate(isoToLocalDate(u.lastLoginAt), fmt) : <span className="text-muted-foreground">{t("st.never")}</span>),
        hideOnCard: true,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, term, lang, banglaDigits, me]
  );

  const filtered = !!(url.get("q") || url.get("role") || url.get("status"));

  return (
    <>
      <PageHeader
        title={t("st.title")}
        description={t("st.desc")}
        action={
          <Button asChild>
            <Link href="/dashboard/staff/new">
              <Plus aria-hidden="true" />
              {t("st.add")}
            </Link>
          </Button>
        }
      />

      <div className="mb-4 grid gap-3 md:grid-cols-[1fr_12rem_12rem]">
        <SearchInput value={url.get("q")} onChange={(q) => url.set({ q })} placeholder={t("st.search")} />
        <Select aria-label={t("st.col.role")} value={url.get("role")} onChange={(e) => url.set({ role: e.target.value })}>
          <option value="">{t("st.allRoles")}</option>
          {(["admin", "teacher", "accountant"] as const).map((r) => (
            <option key={r} value={r}>{t(`st.role.${r}`, { teacher: term("teacher") })}</option>
          ))}
        </Select>
        <Select aria-label={t("st.col.status")} value={url.get("status")} onChange={(e) => url.set({ status: e.target.value })}>
          <option value="">{t("st.allStatus")}</option>
          <option value="active">{t("st.status.active")}</option>
          <option value="inactive">{t("st.status.inactive")}</option>
        </Select>
      </div>

      <DataTable
        columns={columns}
        rows={data?.rows}
        meta={data?.meta}
        rowKey={(u) => u._id}
        loading={isLoading || (isFetching && !data)}
        error={error}
        onRetry={refetch}
        onPageChange={(page) => url.set({ page: String(page) }, { resetPage: false })}
        rowActions={(u) => <StaffActions user={u} isSelf={u._id === me} />}
        emptyTitle={t("st.empty")}
        emptyDescription={t("st.emptyDesc")}
        emptyAction={
          filtered ? (
            <Button variant="outline" onClick={() => url.set({ q: "", role: "", status: "" })}>
              {t("common.clear")}
            </Button>
          ) : undefined
        }
      />
    </>
  );
}
