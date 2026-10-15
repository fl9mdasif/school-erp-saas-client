"use client";

import { Download, Plus, Upload } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { RoleGate } from "@/components/auth/RoleGate";
import { DataTable, type TColumn } from "@/components/common/DataTable";
import { PageHeader } from "@/components/common/PageHeader";
import { SearchInput } from "@/components/common/SearchInput";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import toast from "react-hot-toast";
import { downloadFile } from "@/lib/download";
import { getApiErrorMessage } from "@/lib/errors";
import { formatNumber } from "@/lib/format";
import { useT } from "@/lib/i18n/useT";
import { useUrlState } from "@/lib/useUrlState";
import { useGetClassesQuery, useGetSectionsQuery } from "@/redux/api/academicApi";
import { useGetStudentsQuery } from "@/redux/api/studentApi";
import { useAppSelector } from "@/redux/hooks";
import type { TEnrolmentBrief, TStudent } from "@/types";
import { StudentStatusChip } from "./StudentStatusChip";

const DEFAULTS = { page: "1", q: "", classId: "", sectionId: "", status: "" };
const STATUSES = ["active", "transferred", "passed_out", "dropped", "inactive"] as const;

const enrolmentOf = (s: TStudent): TEnrolmentBrief | null =>
  s.currentEnrolmentId && typeof s.currentEnrolmentId === "object" ? s.currentEnrolmentId : null;

export function StudentsList() {
  const { t, term, lang } = useT();
  const router = useRouter();
  const banglaDigits = useAppSelector((s) => s.ui.banglaDigits);
  const sessionId = useAppSelector((s) => s.ui.selectedSessionId);
  const fmt = { lang, banglaDigits } as const;
  const url = useUrlState(DEFAULTS);
  const classes = useGetClassesQuery();
  const sections = useGetSectionsQuery();

  const classId = url.get("classId");
  const params = {
    page: Number(url.get("page")),
    limit: 20,
    q: url.get("q") || undefined,
    classId: classId || undefined,
    sectionId: url.get("sectionId") || undefined,
    status: url.get("status") || undefined,
    sessionId: sessionId || undefined,
  };
  const { data, isLoading, isFetching, error, refetch } = useGetStudentsQuery(params);

  const exportCsv = async () => {
    const { page: _page, limit: _limit, ...filters } = params;
    void _page;
    void _limit;
    try {
      await downloadFile("/students/export", "students.csv", filters);
    } catch (err) {
      toast.error(getApiErrorMessage(err, t));
    }
  };

  const className = useMemo(() => new Map((classes.data?.rows ?? []).map((c) => [c._id, c.name])), [classes.data]);
  const sectionName = useMemo(() => new Map((sections.data?.rows ?? []).map((s) => [s._id, s.name])), [sections.data]);
  const sectionOptions = (sections.data?.rows ?? []).filter((s) => !classId || s.classId === classId);

  const columns = useMemo<TColumn<TStudent>[]>(
    () => [
      {
        key: "name",
        header: t("stu.col.name", { student: term("student") }),
        cell: (s) => (
          <span className="block min-w-0">
            <span className="block truncate font-semibold text-navy">{lang === "bn" && s.nameBn ? s.nameBn : s.name}</span>
            <span className="tabular block truncate text-xs text-muted-foreground">{s.studentId}</span>
          </span>
        ),
      },
      {
        key: "class",
        header: term("class"),
        cell: (s) => {
          const e = enrolmentOf(s);
          if (!e) return <span className="text-muted-foreground">-</span>;
          const sec = e.sectionId ? sectionName.get(e.sectionId) : undefined;
          return `${className.get(e.classId) ?? "-"}${sec && sec !== "Default" ? ` · ${sec}` : ""}`;
        },
      },
      {
        key: "roll",
        header: term("roll"),
        cell: (s) => <span className="tabular">{enrolmentOf(s) ? formatNumber(enrolmentOf(s)!.roll, fmt) : "-"}</span>,
      },
      { key: "status", header: t("stu.col.status"), cell: (s) => <StudentStatusChip status={s.status} /> },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, term, lang, banglaDigits, className, sectionName]
  );

  const filtered = !!(url.get("q") || classId || url.get("sectionId") || url.get("status"));

  return (
    <>
      <PageHeader
        title={term("student")}
        description={t("stu.desc", { student: term("student") })}
        action={
          <>
            <Button variant="outline" onClick={exportCsv}>
              <Download aria-hidden="true" />
              {t("stu.export")}
            </Button>
            <RoleGate permission="students.manage">
              <Button variant="outline" asChild>
                <Link href="/dashboard/students/promote">{t("promo.open")}</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard/students/import">
                  <Upload aria-hidden="true" />
                  {t("stu.import")}
                </Link>
              </Button>
              <Button asChild>
                <Link href="/dashboard/students/new">
                  <Plus aria-hidden="true" />
                  {t("stu.add", { student: term("student") })}
                </Link>
              </Button>
            </RoleGate>
          </>
        }
      />

      <div className="mb-4 grid gap-3 md:grid-cols-[1fr_11rem_11rem_11rem]">
        <SearchInput value={url.get("q")} onChange={(q) => url.set({ q })} placeholder={t("stu.search")} />
        <Select aria-label={term("class")} value={classId} onChange={(e) => url.set({ classId: e.target.value, sectionId: "" })}>
          <option value="">{t("stu.allClasses", { class: term("class") })}</option>
          {(classes.data?.rows ?? []).map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </Select>
        <Select aria-label={term("section")} value={url.get("sectionId")} onChange={(e) => url.set({ sectionId: e.target.value })}>
          <option value="">{t("stu.allSections", { section: term("section") })}</option>
          {sectionOptions.map((s) => (
            <option key={s._id} value={s._id}>{s.name}</option>
          ))}
        </Select>
        <Select aria-label={t("stu.col.status")} value={url.get("status")} onChange={(e) => url.set({ status: e.target.value })}>
          <option value="">{t("stu.allStatus")}</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{t(`stu.status.${s}`)}</option>
          ))}
        </Select>
      </div>

      <DataTable
        columns={columns}
        rows={data?.rows}
        meta={data?.meta}
        rowKey={(s) => s._id}
        loading={isLoading || (isFetching && !data)}
        error={error}
        onRetry={refetch}
        onPageChange={(page) => url.set({ page: String(page) }, { resetPage: false })}
        onRowClick={(s) => router.push(`/dashboard/students/${s._id}`)}
        emptyTitle={t("stu.empty", { student: term("student") })}
        emptyDescription={t("stu.emptyDesc")}
        emptyAction={
          filtered ? (
            <Button variant="outline" onClick={() => url.set({ q: "", classId: "", sectionId: "", status: "" })}>
              {t("common.clear")}
            </Button>
          ) : undefined
        }
      />
    </>
  );
}
