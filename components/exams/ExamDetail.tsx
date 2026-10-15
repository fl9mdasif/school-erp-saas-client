"use client";

import { AlertTriangle, ArrowLeft, Check, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { RoleGate } from "@/components/auth/RoleGate";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { ErrorState } from "@/components/common/ErrorState";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusChip, type TTone } from "@/components/common/StatusChip";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getApiErrorMessage } from "@/lib/errors";
import { useT } from "@/lib/i18n/useT";
import { useGetClassesQuery, useGetClassSubjectsQuery, useGetSectionsQuery, useGetSubjectsQuery } from "@/redux/api/academicApi";
import {
  useGetExamProgressQuery,
  useGetExamQuery,
  useGetMarksSheetQuery,
  usePublishExamMutation,
  useSaveMarksMutation,
  useSetExamStatusMutation,
  useSubmitMarksMutation,
  useUnlockMarksMutation,
} from "@/redux/api/examApi";
import { useAppSelector } from "@/redux/hooks";
import type { TExam, TExamStatus, TMarkValue } from "@/types";
import { ResultsTab } from "./ResultsTab";

const TONE: Record<TExamStatus, TTone> = { draft: "muted", marks_open: "info", marks_closed: "warning", published: "success" };

export function ExamDetail({ id }: { id: string }) {
  const { t } = useT();
  const { data: exam, isLoading, error, refetch } = useGetExamQuery(id);
  const [setStatus, settingStatus] = useSetExamStatusMutation();

  if (isLoading) return <Skeleton className="h-96 w-full" />;
  if (error || !exam) return <ErrorState error={error} onRetry={refetch} />;

  const changeStatus = async (status: TExamStatus) => {
    try {
      await setStatus({ id: exam._id, status }).unwrap();
      toast.success(t("exam.statusChanged"));
    } catch (err) {
      toast.error(getApiErrorMessage(err, t));
    }
  };

  return (
    <>
      <PageHeader
        title={exam.name}
        action={
          <>
            <Button variant="outline" asChild>
              <Link href="/dashboard/exams">
                <ArrowLeft aria-hidden="true" />
                {t("common.back")}
              </Link>
            </Button>
            <RoleGate permission="exams.manage">
              {exam.status === "draft" || exam.status === "marks_closed" ? (
                <Button disabled={settingStatus.isLoading} onClick={() => changeStatus("marks_open")}>
                  {t("exam.openMarks")}
                </Button>
              ) : null}
              {exam.status === "marks_open" ? (
                <Button variant="outline" disabled={settingStatus.isLoading} onClick={() => changeStatus("marks_closed")}>
                  {t("exam.closeMarks")}
                </Button>
              ) : null}
            </RoleGate>
          </>
        }
      />
      <div className="mb-4">
        <StatusChip tone={TONE[exam.status]}>{t(`exam.status.${exam.status}`)}</StatusChip>
      </div>
      {exam.status === "published" ? <p className="mb-4 max-w-2xl rounded-lg border border-success/30 bg-success-tint p-3 text-sm text-success-deep">{t("exam.publish.locked")}</p> : null}

      <Tabs defaultValue="setup">
        <TabsList aria-label={exam.name}>
          <TabsTrigger value="setup">{t("exam.tab.setup")}</TabsTrigger>
          <TabsTrigger value="marks">{t("exam.tab.marks")}</TabsTrigger>
          <TabsTrigger value="progress">{t("exam.tab.progress")}</TabsTrigger>
          <TabsTrigger value="results">{t("exam.tab.results")}</TabsTrigger>
          <RoleGate permission="exams.manage">
            <TabsTrigger value="publish">{t("exam.tab.publish")}</TabsTrigger>
          </RoleGate>
        </TabsList>
        <TabsContent value="setup">
          <SetupTab exam={exam} />
        </TabsContent>
        <TabsContent value="marks">
          <MarksTab exam={exam} />
        </TabsContent>
        <TabsContent value="progress">
          <ProgressTab examId={exam._id} />
        </TabsContent>
        <TabsContent value="results">
          <ResultsTab exam={exam} />
        </TabsContent>
        <RoleGate permission="exams.manage">
          <TabsContent value="publish">
            <PublishTab exam={exam} />
          </TabsContent>
        </RoleGate>
      </Tabs>
    </>
  );
}

function SetupTab({ exam }: { exam: TExam }) {
  const { t, term } = useT();
  const classes = useGetClassesQuery();
  const subjects = useGetSubjectsQuery();
  const mapping = useGetClassSubjectsQuery({ sessionId: exam.sessionId });
  const className = new Map((classes.data?.rows ?? []).map((c) => [c._id, c.name]));
  const subjectName = new Map((subjects.data?.rows ?? []).map((s) => [s._id, s.name]));
  const rows = (mapping.data?.rows ?? []).filter((m) => exam.classIds.includes(m.classId));

  return (
    <>
      <p className="mb-1 font-semibold text-navy">{t("exam.setup.title")}</p>
      <p className="mb-3 text-sm text-muted-foreground">{t("exam.setup.desc")}</p>
      <Card className="max-w-3xl">
        <CardContent className="pt-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="py-2">{term("class")}</th>
                <th className="py-2">{t("ac.map.subject")}</th>
                <th className="tabular py-2 text-right">{t("ac.map.marks")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((m) => (
                <tr key={m._id} className="border-b border-border/60">
                  <td className="py-2">{className.get(m.classId) ?? "-"}</td>
                  <td className="py-2">{subjectName.get(m.subjectId) ?? m.subjectId}</td>
                  <td className="tabular py-2 text-right">{m.fullMarks} / {m.passMarks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
      <Button variant="outline" asChild className="mt-3">
        <Link href="/dashboard/academic/class-subjects">{t("exam.setup.editLink")}</Link>
      </Button>
    </>
  );
}

function MarksTab({ exam }: { exam: TExam }) {
  const { t, term } = useT();
  const userId = useAppSelector((s) => s.auth.user?.id);
  const role = useAppSelector((s) => s.auth.user?.role);
  const classes = useGetClassesQuery();
  const examClasses = (classes.data?.rows ?? []).filter((c) => exam.classIds.includes(c._id));
  const [classId, setClassId] = useState(examClasses[0]?._id ?? "");
  const sections = useGetSectionsQuery({ classId }, { skip: !classId });
  const [sectionId, setSectionId] = useState("");
  const mapping = useGetClassSubjectsQuery({ sessionId: exam.sessionId, classId }, { skip: !classId });
  const subjectNames = useGetSubjectsQuery();
  const subjectName = new Map((subjectNames.data?.rows ?? []).map((s) => [s._id, s.name]));
  const subjects = (mapping.data?.rows ?? [])
    .filter((m) => !m.sectionId || m.sectionId === sectionId)
    .filter((m) => role !== "teacher" || m.teacherId === userId);
  const [subjectId, setSubjectId] = useState("");

  useEffect(() => setSubjectId(""), [classId, sectionId]);

  const sheet = useGetMarksSheetQuery({ examId: exam._id, classId, sectionId: sectionId || undefined, subjectId }, { skip: !classId || !subjectId });

  return (
    <>
      <div className="mb-4 grid gap-3 sm:grid-cols-3 md:max-w-2xl">
        <Select aria-label={term("class")} value={classId} onChange={(e) => setClassId(e.target.value)}>
          {examClasses.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </Select>
        <Select aria-label={term("section")} value={sectionId} onChange={(e) => setSectionId(e.target.value)}>
          <option value="">{t("fee.gen.allSections")}</option>
          {(sections.data?.rows ?? []).map((s) => (
            <option key={s._id} value={s._id}>{s.name}</option>
          ))}
        </Select>
        <Select aria-label={t("ac.cs.subject")} value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
          <option value="">{t("stu.form.pick")}</option>
          {subjects.map((m) => (
            <option key={m._id} value={m.subjectId}>{subjectName.get(m.subjectId) ?? m.subjectId}</option>
          ))}
        </Select>
      </div>

      {!subjectId ? (
        <p className="text-sm text-muted-foreground">{t("exam.marks.pickClass")}</p>
      ) : sheet.isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : sheet.error ? (
        <ErrorState error={sheet.error} onRetry={sheet.refetch} />
      ) : sheet.data ? (
        <MarksGrid key={`${classId}|${sectionId}|${subjectId}`} examId={exam._id} examStatus={exam.status} classId={classId} sectionId={sectionId} subjectId={subjectId} sheet={sheet.data} />
      ) : null}
    </>
  );
}

function MarksGrid({ examId, examStatus, classId, sectionId, subjectId, sheet }: { examId: string; examStatus: TExamStatus; classId: string; sectionId: string; subjectId: string; sheet: NonNullable<ReturnType<typeof useGetMarksSheetQuery>["data"]> }) {
  const { t } = useT();
  const [rows, setRows] = useState(sheet.rows);
  const [saveState, setSaveState] = useState<Record<string, "saving" | "saved" | "error">>({});
  const [saveMarks] = useSaveMarksMutation();
  const [submitMarks, submitting] = useSubmitMarksMutation();
  const [unlockMarks, unlocking] = useUnlockMarksMutation();
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => setRows(sheet.rows), [sheet]);

  const components = sheet.subject.components;
  const locked = examStatus !== "marks_open";
  const allSubmitted = rows.every((r) => r.status === "submitted" || r.status === "locked");
  const blankCount = rows.filter((r) => r.status === "empty").length;

  const setComponent = (studentId: string, key: string, patch: Partial<TMarkValue>) => {
    setRows((prev) => prev.map((r) => (r.studentId !== studentId ? r : { ...r, components: r.components.some((c) => c.key === key) ? r.components.map((c) => (c.key === key ? { ...c, ...patch } : c)) : [...r.components, { key, obtained: null, absent: false, ...patch }] })));
  };

  const saveComponents = async (studentId: string, rowComponents: TMarkValue[]) => {
    setSaveState((s) => ({ ...s, [studentId]: "saving" }));
    try {
      await saveMarks({
        examId,
        data: {
          classId,
          sectionId: sectionId || undefined,
          subjectId,
          marks: [{ studentId, components: components.map((c) => { const v = rowComponents.find((x) => x.key === c.key); return { key: c.key, obtained: v?.obtained ?? null, absent: v?.absent ?? false }; }) }],
        },
      }).unwrap();
      setSaveState((s) => ({ ...s, [studentId]: "saved" }));
    } catch {
      setSaveState((s) => ({ ...s, [studentId]: "error" }));
      toast.error(t("exam.marks.saveError"));
    }
  };

  const saveRow = (studentId: string) => {
    const row = rows.find((r) => r.studentId === studentId);
    if (row) void saveComponents(studentId, row.components);
  };

  const toggleAbsent = (studentId: string, absent: boolean) => {
    const updated = components.map((c) => ({ key: c.key, obtained: absent ? null : 0, absent }));
    setRows((prev) => prev.map((r) => (r.studentId !== studentId ? r : { ...r, components: updated })));
    void saveComponents(studentId, updated);
  };

  const focusNext = (rowIdx: number, colKey: string) => {
    const next = inputRefs.current[`${rowIdx + 1}-${colKey}`];
    next?.focus();
  };

  const confirmSubmitNow = async () => {
    try {
      await submitMarks({ examId, classId, sectionId: sectionId || undefined, subjectId }).unwrap();
      toast.success(t("exam.marks.submitted"));
      setConfirmSubmit(false);
    } catch (err) {
      toast.error(getApiErrorMessage(err, t));
    }
  };

  const unlock = async () => {
    try {
      await unlockMarks({ examId, classId, sectionId: sectionId || undefined, subjectId }).unwrap();
      toast.success(t("exam.marks.unlocked"));
    } catch (err) {
      toast.error(getApiErrorMessage(err, t));
    }
  };

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left">
              <th className="px-2 py-2">{t("exam.marks.col.roll")}</th>
              <th className="px-2 py-2">{t("exam.marks.col.name")}</th>
              {components.map((c) => (
                <th key={c.key} className="px-2 py-2 text-center">{c.label} <span className="text-muted-foreground">/{c.fullMarks}</span></th>
              ))}
              <th className="px-2 py-2 text-center">{t("exam.marks.absent")}</th>
              <th className="tabular px-2 py-2 text-right">{t("exam.marks.col.total")}</th>
              <th className="px-2 py-2">{t("exam.marks.col.status")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, ri) => {
              const absent = r.components.some((c) => c.absent);
              const total = absent ? 0 : r.components.reduce((n, c) => n + (c.obtained ?? 0), 0);
              return (
                <tr key={r.studentId} className="border-b border-border/60">
                  <td className="tabular px-2 py-1">{r.roll}</td>
                  <td className="px-2 py-1">{r.name}</td>
                  {components.map((c) => {
                    const v = r.components.find((x) => x.key === c.key);
                    const over = (v?.obtained ?? 0) > c.fullMarks;
                    return (
                      <td key={c.key} className="px-1 py-1">
                        <input
                          ref={(el) => { inputRefs.current[`${ri}-${c.key}`] = el; }}
                          type="number"
                          min={0}
                          max={c.fullMarks}
                          disabled={locked || absent}
                          value={v?.obtained ?? ""}
                          onChange={(e) => setComponent(r.studentId, c.key, { obtained: e.target.value === "" ? null : Number(e.target.value) })}
                          onBlur={() => saveRow(r.studentId)}
                          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); focusNext(ri, c.key); } }}
                          className={`tabular w-16 rounded-md border px-2 py-1 text-right ${over ? "border-destructive text-destructive" : "border-input"}`}
                        />
                      </td>
                    );
                  })}
                  <td className="px-2 py-1 text-center">
                    <input
                      type="checkbox"
                      className="size-4"
                      disabled={locked}
                      checked={absent}
                      onChange={(e) => toggleAbsent(r.studentId, e.target.checked)}
                    />
                  </td>
                  <td className="tabular px-2 py-1 text-right font-semibold text-navy">{total}</td>
                  <td className="px-2 py-1 text-xs">
                    {saveState[r.studentId] === "saving" ? (
                      <Loader2 className="size-4 animate-spin text-muted-foreground" aria-hidden="true" />
                    ) : saveState[r.studentId] === "saved" ? (
                      <span className="flex items-center gap-1 text-success-deep"><Check className="size-3" aria-hidden="true" />{t("exam.marks.saved")}</span>
                    ) : (
                      t(`exam.marks.status.${r.status}`)
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex gap-3">
        {!locked ? (
          <Button onClick={() => setConfirmSubmit(true)} disabled={submitting.isLoading}>
            {submitting.isLoading ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
            {t("exam.marks.submit")}
          </Button>
        ) : null}
        {allSubmitted ? (
          <Button variant="outline" onClick={unlock} disabled={unlocking.isLoading}>
            {t("exam.marks.unlock")}
          </Button>
        ) : null}
      </div>

      <ConfirmDialog
        open={confirmSubmit}
        onOpenChange={setConfirmSubmit}
        title={t("exam.marks.submitTitle")}
        description={blankCount > 0 ? `${t("exam.marks.submitDesc")} (${blankCount})` : t("exam.marks.submitDesc")}
        confirmLabel={t("exam.marks.submit")}
        onConfirm={confirmSubmitNow}
        loading={submitting.isLoading}
      />
    </>
  );
}

function ProgressTab({ examId }: { examId: string }) {
  const { t } = useT();
  const { data, isLoading, error, refetch } = useGetExamProgressQuery(examId);

  if (isLoading) return <Skeleton className="h-64 w-full max-w-3xl" />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;
  if (!data) return null;

  return (
    <>
      <p className="mb-3 font-semibold text-navy">{t("exam.progress.title")}</p>
      {data.complete ? <p className="mb-3 flex items-center gap-2 text-success-deep"><Check className="size-4" aria-hidden="true" />{t("exam.progress.allDone")}</p> : null}
      <Card className="max-w-3xl">
        <CardContent className="pt-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="py-2">{t("exam.progress.subject")}</th>
                <th className="tabular py-2 text-right">{t("exam.progress.students")}</th>
                <th className="tabular py-2 text-right">{t("exam.progress.entered")}</th>
                <th className="tabular py-2 text-right">{t("exam.progress.submitted")}</th>
                <th className="py-2 text-center">{t("exam.progress.complete")}</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((r, i) => (
                <tr key={i} className="border-b border-border/60">
                  <td className="py-2">{r.subject}</td>
                  <td className="tabular py-2 text-right">{r.students}</td>
                  <td className="tabular py-2 text-right">{r.entered}</td>
                  <td className="tabular py-2 text-right">{r.submitted}</td>
                  <td className="py-2 text-center">
                    {r.complete ? <Check className="mx-auto size-4 text-success" aria-hidden="true" /> : <AlertTriangle className="mx-auto size-4 text-warning" aria-hidden="true" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </>
  );
}

function PublishTab({ exam }: { exam: TExam }) {
  const { t } = useT();
  const progress = useGetExamProgressQuery(exam._id);
  const [forceAbsent, setForceAbsent] = useState(false);
  const [typed, setTyped] = useState("");
  const missing = useMemo(() => (progress.data?.rows ?? []).filter((r) => !r.complete).length, [progress.data]);

  if (exam.status === "published") {
    return <p className="max-w-2xl rounded-lg border border-success/30 bg-success-tint p-4 text-sm text-success-deep">{t("exam.publish.locked")}</p>;
  }

  return <PublishForm exam={exam} missing={missing} forceAbsent={forceAbsent} setForceAbsent={setForceAbsent} typed={typed} setTyped={setTyped} />;
}

function PublishForm({ exam, missing, forceAbsent, setForceAbsent, typed, setTyped }: { exam: TExam; missing: number; forceAbsent: boolean; setForceAbsent: (v: boolean) => void; typed: string; setTyped: (v: string) => void }) {
  const { t } = useT();
  const [publish, publishing] = usePublishExamMutation();
  const blocked = typed.trim() !== exam.name;

  const onPublish = async () => {
    try {
      await publish({ examId: exam._id, forceMissingAsAbsent: forceAbsent }).unwrap();
      toast.success(t("exam.publish.done"));
    } catch (err) {
      toast.error(getApiErrorMessage(err, t));
    }
  };

  return (
    <Card className="max-w-xl">
      <CardContent className="space-y-4 pt-5">
        <p className="font-semibold text-navy">{t("exam.publish.checklist")}</p>
        <p className="flex items-center gap-2 text-sm">
          {missing === 0 ? <Check className="size-4 text-success" aria-hidden="true" /> : <AlertTriangle className="size-4 text-warning" aria-hidden="true" />}
          {missing === 0 ? t("exam.publish.allSubmitted") : t("exam.publish.missing", { count: missing })}
        </p>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="size-4" checked={forceAbsent} onChange={(e) => setForceAbsent(e.target.checked)} />
          {t("exam.publish.forceAbsent")}
        </label>
        <div className="space-y-1.5">
          <p className="text-sm font-medium">{t("exam.publish.confirmLabel")}: {exam.name}</p>
          <input value={typed} onChange={(e) => setTyped(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" />
        </div>
        <Button variant="destructive" disabled={blocked || publishing.isLoading} onClick={onPublish}>
          {publishing.isLoading ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
          {t("exam.publish.action")}
        </Button>
      </CardContent>
    </Card>
  );
}
