"use client";

import { Download, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { ErrorState } from "@/components/common/ErrorState";
import { FormField } from "@/components/common/FormField";
import { StatCard } from "@/components/common/StatCard";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { downloadFile, fetchFileUrl } from "@/lib/download";
import { getApiErrorMessage } from "@/lib/errors";
import { useT } from "@/lib/i18n/useT";
import { useGetClassesQuery, useGetSectionsQuery } from "@/redux/api/academicApi";
import { useCalculateExamMutation, useCorrectResultMutation, useGetResultsQuery } from "@/redux/api/examApi";
import type { TExam, TResult } from "@/types";

export function ResultsTab({ exam }: { exam: TExam }) {
  const { t, term } = useT();
  const classes = useGetClassesQuery();
  const examClasses = (classes.data?.rows ?? []).filter((c) => exam.classIds.includes(c._id));
  const [classId, setClassId] = useState("");
  const sections = useGetSectionsQuery({ classId }, { skip: !classId });
  const [sectionId, setSectionId] = useState("");
  const [calculate, calculating] = useCalculateExamMutation();
  const { data, isLoading, error, refetch } = useGetResultsQuery({ examId: exam._id, classId: classId || undefined, sectionId: sectionId || undefined });
  const [correcting, setCorrecting] = useState<TResult | null>(null);
  const [sheetFor, setSheetFor] = useState<TResult | null>(null);

  const onCalculate = async () => {
    try {
      await calculate(exam._id).unwrap();
      toast.success(t("exam.results.calculated"));
    } catch (err) {
      toast.error(getApiErrorMessage(err, t));
    }
  };

  const meritCsv = async () => {
    if (!classId) return;
    try {
      await downloadFile(`/exams/${exam._id}/merit-list`, "merit-list.csv", { classId, format: "csv" });
    } catch (err) {
      toast.error(getApiErrorMessage(err, t));
    }
  };

  return (
    <>
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <Button onClick={onCalculate} disabled={calculating.isLoading}>
          {calculating.isLoading ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
          {t("exam.results.calculate")}
        </Button>
        <Select aria-label={term("class")} value={classId} onChange={(e) => { setClassId(e.target.value); setSectionId(""); }}>
          <option value="">{t("fee.gen.allClasses")}</option>
          {examClasses.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </Select>
        <Select aria-label={term("section")} value={sectionId} onChange={(e) => setSectionId(e.target.value)} disabled={!classId}>
          <option value="">{t("fee.gen.allSections")}</option>
          {(sections.data?.rows ?? []).map((s) => (
            <option key={s._id} value={s._id}>{s.name}</option>
          ))}
        </Select>
        <Button variant="outline" onClick={meritCsv} disabled={!classId}>
          <Download aria-hidden="true" />
          {t("exam.results.meritCsv")}
        </Button>
      </div>

      {error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : !data || data.results.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("exam.results.empty")}</p>
      ) : (
        <>
          <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label={t("exam.results.students")} value={String(data.summary.students)} />
            <StatCard label={t("exam.results.passed")} value={String(data.summary.passed)} tone="success" />
            <StatCard label={t("exam.results.failed")} value={String(data.summary.failed)} tone="warning" />
            <StatCard label={t("exam.results.passRate")} value={data.summary.passRate !== null ? `${data.summary.passRate}%` : "-"} />
          </div>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left">
                  <th className="px-2 py-2">{t("exam.results.col.roll")}</th>
                  <th className="px-2 py-2">{t("exam.results.col.name")}</th>
                  <th className="tabular px-2 py-2 text-right">{t("exam.results.col.total")}</th>
                  <th className="tabular px-2 py-2 text-right">{t("exam.results.col.gpa")}</th>
                  <th className="px-2 py-2">{t("exam.results.col.letter")}</th>
                  <th className="tabular px-2 py-2 text-right">{t("exam.results.col.position")}</th>
                  <th className="px-2 py-2" />
                </tr>
              </thead>
              <tbody>
                {data.results.map((r) => (
                  <tr key={r._id} className="border-b border-border/60">
                    <td className="tabular px-2 py-1">{r.roll}</td>
                    <td className="px-2 py-1">
                      {r.name}
                      {r.version > 1 ? <span className="ml-1 text-xs text-warning">{t("exam.results.corrected", { version: r.version })}</span> : null}
                    </td>
                    <td className="tabular px-2 py-1 text-right">{r.totalMarks}/{r.fullMarks}</td>
                    <td className="tabular px-2 py-1 text-right">{r.gpa ?? "-"}</td>
                    <td className="px-2 py-1">{r.letter ?? "-"}</td>
                    <td className="tabular px-2 py-1 text-right">{r.positionInClass ?? "-"}</td>
                    <td className="flex gap-2 px-2 py-1">
                      <Button variant="ghost" size="sm" onClick={() => setSheetFor(r)}>{t("exam.results.marksheet")}</Button>
                      {exam.status === "published" ? (
                        <Button variant="ghost" size="sm" onClick={() => setCorrecting(r)}>{t("exam.correct.action")}</Button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {correcting ? <CorrectDialog exam={exam} result={correcting} onClose={() => setCorrecting(null)} /> : null}
      {sheetFor ? <MarksheetDialog exam={exam} result={sheetFor} onClose={() => setSheetFor(null)} /> : null}
    </>
  );
}

type TCorrectForm = { reason: string; changes: { subjectId: string; obtained: string }[] };

function CorrectDialog({ exam, result, onClose }: { exam: TExam; result: TResult; onClose: () => void }) {
  const { t } = useT();
  const [correct, correcting] = useCorrectResultMutation();
  const { register, control, handleSubmit } = useForm<TCorrectForm>({
    mode: "onTouched",
    defaultValues: { reason: "", changes: result.subjects.map((s) => ({ subjectId: s.subjectId, obtained: String(s.total) })) },
  });
  const { fields } = useFieldArray({ control, name: "changes" });

  const onSubmit = handleSubmit(async (v) => {
    if (v.reason.trim().length < 5) return toast.error(t("val.tooShort"));
    try {
      await correct({
        examId: exam._id,
        studentId: result.studentId,
        data: {
          reason: v.reason,
          changes: v.changes
            .filter((c, i) => Number(c.obtained) !== result.subjects[i].total)
            .map((c) => ({ subjectId: c.subjectId, components: [{ key: "total", obtained: Number(c.obtained), absent: false }] })),
        },
      }).unwrap();
      toast.success(t("exam.correct.saved"));
      onClose();
    } catch (err) {
      toast.error(getApiErrorMessage(err, t));
    }
  });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent closeLabel={t("common.close")}>
        <DialogTitle>{t("exam.correct.title", { name: result.name ?? "" })}</DialogTitle>
        <form onSubmit={onSubmit} noValidate className="grid gap-4">
          {fields.map((f, i) => (
            <FormField key={f.id} label={result.subjects[i]?.name ?? ""}>
              {(c) => <Input type="number" min={0} {...c} {...register(`changes.${i}.obtained`)} />}
            </FormField>
          ))}
          <FormField label={t("exam.correct.reason")}>
            {(c) => <Textarea {...c} {...register("reason")} />}
          </FormField>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={correcting.isLoading}>
              {correcting.isLoading ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
              {t("common.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function MarksheetDialog({ exam, result, onClose }: { exam: TExam; result: TResult; onClose: () => void }) {
  const { t } = useT();
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let current: string | null = null;
    fetchFileUrl(`/exams/${exam._id}/results/${result.studentId}/marksheet.pdf`)
      .then((u) => { current = u; setUrl(u); })
      .catch(() => toast.error(t("common.somethingWrong")));
    return () => { if (current) URL.revokeObjectURL(current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exam._id, result.studentId]);

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent closeLabel={t("common.close")} className="max-w-2xl">
        <DialogTitle>{t("exam.sheet.title")}</DialogTitle>
        {url ? <iframe src={url} title={t("exam.sheet.title")} className="h-[480px] w-full rounded-lg border border-border" /> : <Skeleton className="h-[480px] w-full" />}
        <DialogFooter>
          <Button variant="outline" asChild>
            <a href={url ?? undefined} download={`marksheet-${result.studentCode ?? result.studentId}.pdf`}>{t("exam.sheet.pdf")}</a>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
