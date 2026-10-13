"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatLocalDate } from "@/lib/format";
import { useT } from "@/lib/i18n/useT";
import { useAppSelector } from "@/redux/hooks";
import type { TStudentDetail } from "@/types";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[9rem_1fr] gap-2 py-2 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-words font-medium">{children || "-"}</dd>
    </div>
  );
}

export function ProfileTab({ student: s }: { student: TStudentDetail }) {
  const { t, lang } = useT();
  const banglaDigits = useAppSelector((st) => st.ui.banglaDigits);
  const fmt = { lang, banglaDigits } as const;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>{t("stu.form.profile")}</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="divide-y divide-border">
            <Row label={t("stu.form.name")}>{s.name}</Row>
            <Row label={t("stu.form.nameBn")}>{s.nameBn}</Row>
            <Row label={t("stu.form.gender")}>{t(`stu.form.gender.${s.gender}`)}</Row>
            <Row label={t("stu.form.dob")}><span className="tabular">{formatLocalDate(s.dob, fmt)}</span></Row>
            <Row label={t("stu.form.admissionNo")}>{s.admissionNo}</Row>
            <Row label={t("stu.detail.admittedOn")}><span className="tabular">{formatLocalDate(s.admittedOn, fmt)}</span></Row>
            <Row label={t("stu.form.religion")}>{s.religion}</Row>
            <Row label={t("stu.form.address")}>{s.address}</Row>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("stu.form.guardians")}</CardTitle>
        </CardHeader>
        <CardContent>
          {s.guardians.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("stu.detail.noGuardians")}</p>
          ) : (
            <ul className="divide-y divide-border">
              {s.guardians.map((g) => (
                <li key={g._id} className="flex items-center justify-between gap-3 py-2 text-sm">
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{g.name}</span>
                    <span className="text-xs text-muted-foreground">{t(`stu.rel.${g.relation}`)}</span>
                  </span>
                  <a href={`tel:${g.phone}`} className="tabular shrink-0 text-primary hover:underline">{g.phone}</a>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
