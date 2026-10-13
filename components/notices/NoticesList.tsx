"use client";

import { Globe, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { DataTable, type TColumn } from "@/components/common/DataTable";
import { PageHeader } from "@/components/common/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { getApiErrorMessage } from "@/lib/errors";
import { formatLocalDate, isoToLocalDate } from "@/lib/format";
import { useT } from "@/lib/i18n/useT";
import { useUrlState } from "@/lib/useUrlState";
import { useGetClassesQuery, useGetSectionsQuery } from "@/redux/api/academicApi";
import { useDeleteNoticeMutation, useGetNoticesQuery } from "@/redux/api/communicationApi";
import { useAppSelector } from "@/redux/hooks";
import type { TNotice } from "@/types";

const DEFAULTS = { page: "1", status: "" };

export function NoticesList() {
  const { t, term, lang } = useT();
  const banglaDigits = useAppSelector((s) => s.ui.banglaDigits);
  const fmt = { lang, banglaDigits } as const;
  const url = useUrlState(DEFAULTS);
  const classes = useGetClassesQuery();
  const sections = useGetSectionsQuery();
  const [remove, removing] = useDeleteNoticeMutation();
  const [deleting, setDeleting] = useState<TNotice | null>(null);

  const { data, isLoading, isFetching, error, refetch } = useGetNoticesQuery({
    page: Number(url.get("page")),
    limit: 20,
    status: url.get("status") || undefined,
  });

  const className = useMemo(() => new Map((classes.data?.rows ?? []).map((c) => [c._id, c.name])), [classes.data]);
  const sectionName = useMemo(() => new Map((sections.data?.rows ?? []).map((s) => [s._id, s.name])), [sections.data]);

  const audienceLabel = (n: TNotice) => {
    const a = n.audience;
    if (a.type === "class") return a.classIds.map((id) => className.get(id) ?? "-").join(", ");
    if (a.type === "section") return a.sectionIds.map((id) => sectionName.get(id) ?? "-").join(", ");
    return t(`not.aud.${a.type}`);
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await remove(deleting._id).unwrap();
      toast.success(t("not.deleted"));
    } catch (err) {
      toast.error(getApiErrorMessage(err, t));
    }
    setDeleting(null);
  };

  const columns = useMemo<TColumn<TNotice>[]>(
    () => [
      {
        key: "title",
        header: t("not.col.title"),
        cell: (n) => (
          <span className="block min-w-0">
            <span className="block truncate font-semibold text-navy">{n.title}</span>
            <span className="mt-1 flex flex-wrap items-center gap-1">
              <Badge variant="info">{audienceLabel(n)}</Badge>
              {n.isPublic ? (
                <Badge variant="success">
                  <Globe className="size-3" aria-hidden="true" />
                  {t("not.public")}
                </Badge>
              ) : null}
            </span>
          </span>
        ),
      },
      { key: "status", header: t("not.col.status"), cell: (n) => <Badge variant={n.status === "draft" ? "warning" : "default"}>{t(`not.status.${n.status}`)}</Badge> },
      { key: "date", header: t("not.col.date"), cell: (n) => <span className="tabular">{formatLocalDate(isoToLocalDate(n.publishAt), fmt)}</span>, hideOnCard: true },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, term, lang, banglaDigits, className, sectionName]
  );

  return (
    <>
      <PageHeader
        title={t("not.title")}
        description={t("not.desc")}
        action={
          <Button asChild>
            <Link href="/dashboard/notices/new">
              <Plus aria-hidden="true" />
              {t("not.add")}
            </Link>
          </Button>
        }
      />

      <div className="mb-4 max-w-xs">
        <Select aria-label={t("not.col.status")} value={url.get("status")} onChange={(e) => url.set({ status: e.target.value })}>
          <option value="">{t("not.allStatus")}</option>
          <option value="published">{t("not.status.published")}</option>
          <option value="draft">{t("not.status.draft")}</option>
        </Select>
      </div>

      <DataTable
        columns={columns}
        rows={data?.rows}
        meta={data?.meta}
        rowKey={(n) => n._id}
        loading={isLoading || (isFetching && !data)}
        error={error}
        onRetry={refetch}
        onPageChange={(page) => url.set({ page: String(page) }, { resetPage: false })}
        emptyTitle={t("not.empty")}
        emptyDescription={t("not.emptyDesc")}
        rowActions={(n) => (
          <>
            <Button variant="ghost" size="icon" asChild aria-label={t("common.edit")}>
              <Link href={`/dashboard/notices/${n._id}/edit`}>
                <Pencil aria-hidden="true" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setDeleting(n)} aria-label={t("common.delete")}>
              <Trash2 aria-hidden="true" />
            </Button>
          </>
        )}
      />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={t("not.deleteTitle", { name: deleting?.title ?? "" })}
        description={t("not.deleteBody")}
        confirmLabel={t("common.delete")}
        destructive
        loading={removing.isLoading}
        onConfirm={confirmDelete}
      />
    </>
  );
}
