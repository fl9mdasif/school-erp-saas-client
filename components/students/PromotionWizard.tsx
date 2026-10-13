"use client";

import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { FormField } from "@/components/common/FormField";
import { PageHeader } from "@/components/common/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { getApiErrorMessage } from "@/lib/errors";
import { formatNumber } from "@/lib/format";
import { useT } from "@/lib/i18n/useT";
import { useGetClassesQuery, useGetSectionsQuery, useGetSessionsQuery } from "@/redux/api/academicApi";
import { useCommitPromotionMutation, useGetStudentsQuery, usePreviewPromotionMutation } from "@/redux/api/studentApi";
import { useAppSelector } from "@/redux/hooks";
import type { TPromoteInput, TPromotionResult } from "@/types";

export function PromotionWizard() {
  const { t, term, lang } = useT();
  const banglaDigits = useAppSelector((s) => s.ui.banglaDigits);
  const fmt = { lang, banglaDigits } as const;
  const sessions = useGetSessionsQuery();
  const classes = useGetClassesQuery();
  const sections = useGetSectionsQuery();
  const [preview, previewing] = usePreviewPromotionMutation();
  const [commit, committing] = useCommitPromotionMutation();

  const current = sessions.data?.rows.find((s) => s.isCurrent)?._id ?? "";
  const [fromSession, setFromSession] = useState("");
  const [toSession, setToSession] = useState("");
  const [fromClass, setFromClass] = useState("");
  const [toClass, setToClass] = useState("");
  const [toSection, setToSection] = useState("");
  const [passOut, setPassOut] = useState(false);
  const [rollMode, setRollMode] = useState<"previous_roll" | "name">("previous_roll");
  const [repeaters, setRepeaters] = useState<string[]>([]);
  const [result, setResult] = useState<TPromotionResult | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState<TPromotionResult | null>(null);

  const from = fromSession || current;
  const roster = useGetStudentsQuery(
    { classId: fromClass, sessionId: from, status: "active", limit: 100 },
    { skip: !fromClass || !from }
  );
  const rows = roster.data?.rows ?? [];
  const targetSections = (sections.data?.rows ?? []).filter((s) => s.classId === toClass);
  const ready = !!from && !!toSession && !!fromClass && (passOut || !!toClass);

  const input = (): TPromoteInput => ({
    fromSessionId: from,
    toSessionId: toSession,
    fromClassId: fromClass,
    toClassId: passOut ? undefined : toClass,
    toSectionId: passOut || !toSection ? undefined : toSection,
    repeatStudentIds: repeaters,
    rollMode,
    passOut,
  });

  const runPreview = async () => {
    try {
      setResult(await preview(input()).unwrap());
    } catch (err) {
      toast.error(getApiErrorMessage(err, t));
    }
  };

  const runCommit = async () => {
    try {
      setDone(await commit(input()).unwrap());
      setConfirming(false);
    } catch (err) {
      toast.error(getApiErrorMessage(err, t));
      setConfirming(false);
    }
  };

  const toggle = (id: string) => {
    setResult(null);
    setRepeaters((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  };
  const reset = <T,>(set: (v: T) => void) => (v: T) => {
    set(v);
    setResult(null);
  };

  return (
    <>
      <Link href="/dashboard/students" className="mb-3 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-primary hover:underline">
        <ArrowLeft className="size-4" aria-hidden="true" />
        {t("stu.form.back", { student: term("student") })}
      </Link>
      <PageHeader title={t("promo.title")} description={t("promo.desc", { class: term("class") })} />

      {done ? (
        <Card className="max-w-xl border-success">
          <CardContent className="space-y-3 pt-5">
            <p className="flex items-center gap-2 font-semibold text-navy">
              <CheckCircle2 className="size-5 text-success" aria-hidden="true" />
              {t("promo.done")}
            </p>
            <p className="tabular text-sm">{t("promo.counts", { promote: formatNumber(done.promote, fmt), repeat: formatNumber(done.repeat, fmt), passOut: formatNumber(done.passOut, fmt) })}</p>
            <Button asChild>
              <Link href="/dashboard/students">{t("imp.viewList", { student: term("student") })}</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid max-w-3xl gap-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("promo.from")}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <FormField label={t("promo.fromSession")}>
                {(c) => (
                  <Select {...c} value={from} onChange={(e) => reset(setFromSession)(e.target.value)}>
                    <option value="">{t("stu.form.pick")}</option>
                    {(sessions.data?.rows ?? []).map((s) => (
                      <option key={s._id} value={s._id}>{s.name}</option>
                    ))}
                  </Select>
                )}
              </FormField>
              <FormField label={term("class")}>
                {(c) => (
                  <Select {...c} value={fromClass} onChange={(e) => { reset(setFromClass)(e.target.value); setRepeaters([]); }}>
                    <option value="">{t("stu.form.pick")}</option>
                    {(classes.data?.rows ?? []).map((k) => (
                      <option key={k._id} value={k._id}>{k.name}</option>
                    ))}
                  </Select>
                )}
              </FormField>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("promo.to")}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <FormField label={t("promo.toSession")}>
                {(c) => (
                  <Select {...c} value={toSession} onChange={(e) => reset(setToSession)(e.target.value)}>
                    <option value="">{t("stu.form.pick")}</option>
                    {(sessions.data?.rows ?? []).filter((s) => s._id !== from).map((s) => (
                      <option key={s._id} value={s._id}>{s.name}</option>
                    ))}
                  </Select>
                )}
              </FormField>
              <label className="flex min-h-11 items-center gap-3 self-end text-sm">
                <input type="checkbox" className="size-5 accent-primary" checked={passOut} onChange={(e) => reset(setPassOut)(e.target.checked)} />
                {t("promo.passOut")}
              </label>
              {passOut ? null : (
                <>
                  <FormField label={t("promo.toClass", { class: term("class") })}>
                    {(c) => (
                      <Select {...c} value={toClass} onChange={(e) => { reset(setToClass)(e.target.value); setToSection(""); }}>
                        <option value="">{t("stu.form.pick")}</option>
                        {(classes.data?.rows ?? []).map((k) => (
                          <option key={k._id} value={k._id}>{k.name}</option>
                        ))}
                      </Select>
                    )}
                  </FormField>
                  <FormField label={term("section")}>
                    {(c) => (
                      <Select {...c} value={toSection} disabled={!targetSections.length} onChange={(e) => reset(setToSection)(e.target.value)}>
                        <option value="">{t("stu.form.noSection")}</option>
                        {targetSections.map((s) => (
                          <option key={s._id} value={s._id}>{s.name}</option>
                        ))}
                      </Select>
                    )}
                  </FormField>
                  <FormField label={t("promo.rollMode", { roll: term("roll") })}>
                    {(c) => (
                      <Select {...c} value={rollMode} onChange={(e) => reset(setRollMode)(e.target.value as "previous_roll" | "name")}>
                        <option value="previous_roll">{t("promo.rollPrev")}</option>
                        <option value="name">{t("promo.rollName")}</option>
                      </Select>
                    )}
                  </FormField>
                </>
              )}
            </CardContent>
          </Card>

          {fromClass && !passOut ? (
            <Card>
              <CardHeader>
                <CardTitle>{t("promo.repeaters")}</CardTitle>
                <p className="text-sm text-muted-foreground">{t("promo.repeatersHint")}</p>
              </CardHeader>
              <CardContent>
                {roster.isLoading ? (
                  <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
                ) : rows.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t("promo.noStudents", { student: term("student") })}</p>
                ) : (
                  <ul className="grid max-h-72 gap-1 overflow-auto sm:grid-cols-2">
                    {rows.map((s) => (
                      <li key={s._id}>
                        <label className="flex min-h-11 items-center gap-3 rounded-md px-2 text-sm hover:bg-accent">
                          <input type="checkbox" className="size-5 accent-primary" checked={repeaters.includes(s._id)} onChange={() => toggle(s._id)} />
                          <span className="min-w-0 truncate">{s.name}</span>
                          <span className="tabular ml-auto text-xs text-muted-foreground">{s.studentId}</span>
                        </label>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          ) : null}

          <div>
            <Button onClick={runPreview} disabled={!ready || previewing.isLoading}>
              {previewing.isLoading ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
              {t("promo.preview")}
            </Button>
          </div>

          {result ? (
            <Card>
              <CardHeader>
                <CardTitle>{t("promo.previewTitle")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="tabular text-sm font-medium">
                  {t("promo.counts", { promote: formatNumber(result.promote, fmt), repeat: formatNumber(result.repeat, fmt), passOut: formatNumber(result.passOut, fmt) })}
                </p>
                {result.conflicts.length ? (
                  <div role="alert" className="rounded-lg border border-warning bg-warning-tint p-3 text-sm text-warning-deep">
                    <p className="font-semibold">{t("promo.conflicts")}</p>
                    <ul className="mt-1 list-disc pl-5">
                      {result.conflicts.map((c) => (
                        <li key={c.studentId}>{c.studentId}: {c.reason}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {result.preview.length ? (
                  <ul className="divide-y divide-border text-sm">
                    {result.preview.map((p) => (
                      <li key={p.studentId} className="flex items-center justify-between gap-3 py-2">
                        <span className="min-w-0 truncate">{p.name}</span>
                        <span className="flex shrink-0 items-center gap-2">
                          <Badge variant={p.action === "repeat" ? "warning" : "success"}>{t(`promo.action.${p.action}`)}</Badge>
                          <span className="tabular text-muted-foreground">{term("roll")} {formatNumber(p.roll, fmt)}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : null}
                <Button onClick={() => setConfirming(true)} disabled={result.promote + result.repeat + result.passOut === 0}>
                  {t("promo.apply")}
                </Button>
              </CardContent>
            </Card>
          ) : null}
        </div>
      )}

      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title={t("promo.confirmTitle")}
        description={t("promo.confirmBody")}
        confirmLabel={t("promo.apply")}
        loading={committing.isLoading}
        onConfirm={runCommit}
      />
    </>
  );
}
