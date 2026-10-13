"use client";

import { ArrowLeft, CheckCircle2, Download, FileSpreadsheet, Loader2, XCircle } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getApiErrorMessage } from "@/lib/errors";
import { downloadFile } from "@/lib/download";
import { formatNumber } from "@/lib/format";
import { useT } from "@/lib/i18n/useT";
import { useImportCommitMutation, useImportDryRunMutation } from "@/redux/api/studentApi";
import { useAppSelector } from "@/redux/hooks";
import type { TImportCommit, TImportDryRun } from "@/types";

const MAX_BYTES = 5 * 1024 * 1024;

export function ImportWizard() {
  const { t, term, lang } = useT();
  const banglaDigits = useAppSelector((s) => s.ui.banglaDigits);
  const fmt = { lang, banglaDigits } as const;
  const input = useRef<HTMLInputElement>(null);
  const [dryRun, { isLoading: checking }] = useImportDryRunMutation();
  const [commit, { isLoading: committing }] = useImportCommitMutation();
  const [report, setReport] = useState<TImportDryRun | null>(null);
  const [done, setDone] = useState<TImportCommit | null>(null);

  const template = async () => {
    try {
      await downloadFile("/students/import/template", "students-template.csv");
    } catch (err) {
      toast.error(getApiErrorMessage(err, t));
    }
  };

  const pick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!/\.csv$/i.test(file.name)) return void toast.error(t("imp.errType"));
    if (file.size > MAX_BYTES) return void toast.error(t("imp.errSize"));
    try {
      setReport(await dryRun(file).unwrap());
    } catch (err) {
      toast.error(getApiErrorMessage(err, t));
    }
  };

  const run = async () => {
    if (!report) return;
    try {
      setDone(await commit(report.jobId).unwrap());
    } catch (err) {
      toast.error(getApiErrorMessage(err, t));
    }
  };

  const clean = !!report && report.errorCount === 0 && report.validRows > 0;

  return (
    <>
      <Link href="/dashboard/students" className="mb-3 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-primary hover:underline">
        <ArrowLeft className="size-4" aria-hidden="true" />
        {t("stu.form.back", { student: term("student") })}
      </Link>
      <PageHeader title={t("imp.title", { student: term("student") })} description={t("imp.desc")} />

      {done ? (
        <Card className="max-w-xl border-success">
          <CardContent className="space-y-3 pt-5">
            <p className="flex items-center gap-2 font-semibold text-navy">
              <CheckCircle2 className="size-5 text-success" aria-hidden="true" />
              {t("imp.done", { count: formatNumber(done.created, fmt) })}
            </p>
            {done.guardiansReused ? <p className="text-sm text-muted-foreground">{t("imp.reused", { count: formatNumber(done.guardiansReused, fmt) })}</p> : null}
            <Button asChild>
              <Link href="/dashboard/students">{t("imp.viewList", { student: term("student") })}</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid max-w-3xl gap-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("imp.step1")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-muted-foreground">{t("imp.step1Body", { class: term("class"), section: term("section") })}</p>
              <Button variant="outline" onClick={template}>
                <Download aria-hidden="true" />
                {t("imp.template")}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("imp.step2")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{t("imp.step2Body")}</p>
              <input ref={input} type="file" accept=".csv,text/csv" className="sr-only" onChange={pick} aria-label={t("imp.choose")} />
              <Button onClick={() => input.current?.click()} disabled={checking}>
                {checking ? <Loader2 className="animate-spin" aria-hidden="true" /> : <FileSpreadsheet aria-hidden="true" />}
                {report ? t("imp.chooseAnother") : t("imp.choose")}
              </Button>
            </CardContent>
          </Card>

          {report ? (
            <Card>
              <CardHeader>
                <CardTitle>{t("imp.step3")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="tabular text-sm">
                  {report.fileName}: {t("imp.summary", { rows: formatNumber(report.totalRows, fmt), valid: formatNumber(report.validRows, fmt), errors: formatNumber(report.errorCount, fmt) })}
                </p>
                {report.errorCount > 0 ? (
                  <>
                    <p role="alert" className="flex items-center gap-2 text-sm font-medium text-destructive-deep">
                      <XCircle className="size-5" aria-hidden="true" />
                      {t("imp.fixFirst")}
                    </p>
                    <div className="max-h-80 overflow-auto rounded-md border border-border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t("imp.col.row")}</TableHead>
                            <TableHead>{t("imp.col.field")}</TableHead>
                            <TableHead>{t("imp.col.problem")}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {report.errors.map((er, i) => (
                            <TableRow key={`${er.row}-${er.field}-${i}`}>
                              <TableCell className="tabular">{er.row || "-"}</TableCell>
                              <TableCell>{er.field}</TableCell>
                              <TableCell>{er.message}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </>
                ) : (
                  <p className="flex items-center gap-2 text-sm font-medium text-success-deep">
                    <CheckCircle2 className="size-5" aria-hidden="true" />
                    {t("imp.clean")}
                  </p>
                )}
                <Button onClick={run} disabled={!clean || committing}>
                  {committing ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
                  {t("imp.commit", { count: formatNumber(report.validRows, fmt) })}
                </Button>
              </CardContent>
            </Card>
          ) : null}
        </div>
      )}
    </>
  );
}
