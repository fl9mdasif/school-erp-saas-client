"use client";

import { DataTable, type TColumn } from "@/components/common/DataTable";
import { Badge } from "@/components/ui/badge";
import { formatNumber } from "@/lib/format";
import { useT } from "@/lib/i18n/useT";
import { useGetClassesQuery, useGetSectionsQuery, useGetSessionsQuery } from "@/redux/api/academicApi";
import { useAppSelector } from "@/redux/hooks";
import type { TEnrolment, TStudentDetail } from "@/types";

export function EnrolmentsTab({ student }: { student: TStudentDetail }) {
  const { t, term, lang } = useT();
  const banglaDigits = useAppSelector((s) => s.ui.banglaDigits);
  const fmt = { lang, banglaDigits } as const;
  const sessions = useGetSessionsQuery();
  const classes = useGetClassesQuery();
  const sections = useGetSectionsQuery();

  const sessionName = new Map((sessions.data?.rows ?? []).map((s) => [s._id, s.name]));
  const className = new Map((classes.data?.rows ?? []).map((c) => [c._id, c.name]));
  const sectionName = new Map((sections.data?.rows ?? []).map((s) => [s._id, s.name]));

  const columns: TColumn<TEnrolment>[] = [
    { key: "session", header: t("stu.enrol.session"), cell: (e) => sessionName.get(e.sessionId) ?? "-" },
    { key: "class", header: term("class"), cell: (e) => className.get(e.classId) ?? "-" },
    { key: "section", header: term("section"), cell: (e) => (e.sectionId ? sectionName.get(e.sectionId) ?? "-" : "-") },
    { key: "roll", header: term("roll"), cell: (e) => <span className="tabular">{formatNumber(e.roll, fmt)}</span> },
    { key: "status", header: t("stu.col.status"), cell: (e) => <Badge>{t(`stu.enrol.status.${e.status}`)}</Badge> },
  ];

  return (
    <DataTable
      columns={columns}
      rows={student.enrolments}
      rowKey={(e) => e._id}
      emptyTitle={t("stu.enrol.empty")}
    />
  );
}
