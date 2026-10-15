"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Controller, useForm } from "react-hook-form";
import { DatePicker } from "@/components/common/DatePicker";
import { FormField } from "@/components/common/FormField";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { getApiErrorMessage } from "@/lib/errors";
import { formatMoney } from "@/lib/format";
import { useT } from "@/lib/i18n/useT";
import { useGetClassesQuery, useGetSectionsQuery, useGetSessionsQuery } from "@/redux/api/academicApi";
import { useGenerateInvoicesMutation, useGetFeeHeadsQuery, usePreviewInvoicesMutation } from "@/redux/api/feesApi";
import { useAppSelector } from "@/redux/hooks";
import type { TFeeCycle, TGenerateInput, TGeneratePreview, TGenerateResult } from "@/types";

type TForm = { classId: string; sectionId: string; periodLabel: string; cycle: TFeeCycle; feeHeadId: string; dueDate: string };
const CYCLES: TFeeCycle[] = ["monthly", "term", "yearly", "one_time"];

export function GenerateInvoices() {
  const { t, lang, term } = useT();
  const banglaDigits = useAppSelector((s) => s.ui.banglaDigits);
  const fmt = { lang, banglaDigits } as const;
  const sessions = useGetSessionsQuery();
  const picked = useAppSelector((s) => s.ui.selectedSessionId);
  const sessionId = picked || sessions.data?.rows.find((s) => s.isCurrent)?._id || "";
  const classes = useGetClassesQuery();
  const heads = useGetFeeHeadsQuery();
  const [preview, previewing] = usePreviewInvoicesMutation();
  const [generate, generating] = useGenerateInvoicesMutation();
  const [result, setResult] = useState<TGeneratePreview | TGenerateResult | null>(null);

  const { register, control, handleSubmit, watch } = useForm<TForm>({
    defaultValues: { classId: "", sectionId: "", periodLabel: "", cycle: "monthly", feeHeadId: "", dueDate: "" },
  });
  const classId = watch("classId");
  const sections = useGetSectionsQuery({ classId }, { skip: !classId });

  const buildInput = (v: TForm): TGenerateInput => ({
    sessionId,
    classId: v.classId || undefined,
    sectionId: v.sectionId || undefined,
    periodLabel: v.periodLabel,
    cycle: v.cycle,
    feeHeadIds: v.feeHeadId ? [v.feeHeadId] : undefined,
    dueDate: v.dueDate,
  });

  const onPreview = handleSubmit(async (v) => {
    try {
      setResult(await preview(buildInput(v)).unwrap());
    } catch (err) {
      toast.error(getApiErrorMessage(err, t));
    }
  });

  const onGenerate = handleSubmit(async (v) => {
    try {
      const key = crypto.randomUUID();
      setResult(await generate({ input: buildInput(v), key }).unwrap());
      toast.success(t("fee.gen.done"));
    } catch (err) {
      toast.error(getApiErrorMessage(err, t));
    }
  });

  return (
    <>
      <PageHeader title={t("fee.gen.title")} description={t("fee.gen.desc")} />
      <form className="max-w-3xl space-y-4" noValidate>
        <Card>
          <CardContent className="grid gap-4 pt-5 sm:grid-cols-2">
            <FormField label={term("class")} hint={t("fee.gen.allClasses")}>
              {(c) => (
                <Select {...c} {...register("classId")}>
                  <option value="">{t("fee.gen.allClasses")}</option>
                  {(classes.data?.rows ?? []).map((k) => (
                    <option key={k._id} value={k._id}>{k.name}</option>
                  ))}
                </Select>
              )}
            </FormField>
            <FormField label={term("section")} hint={t("fee.gen.allSections")}>
              {(c) => (
                <Select {...c} disabled={!classId} {...register("sectionId")}>
                  <option value="">{t("fee.gen.allSections")}</option>
                  {(sections.data?.rows ?? []).map((s) => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </Select>
              )}
            </FormField>
            <FormField label={t("fee.gen.period")} hint={t("fee.gen.periodHint")}>
              {(c) => <Input placeholder="2026-01" {...c} {...register("periodLabel")} />}
            </FormField>
            <FormField label={t("fee.str.cycle")}>
              {(c) => (
                <Select {...c} {...register("cycle")}>
                  {CYCLES.map((cy) => (
                    <option key={cy} value={cy}>{t(`fee.cycle.${cy}`)}</option>
                  ))}
                </Select>
              )}
            </FormField>
            <FormField label={t("fee.adj.feeHead")} hint={t("fee.gen.allHeads")}>
              {(c) => (
                <Select {...c} {...register("feeHeadId")}>
                  <option value="">{t("fee.gen.allHeads")}</option>
                  {(heads.data?.rows ?? []).filter((h) => h.isActive).map((h) => (
                    <option key={h._id} value={h._id}>{h.name}</option>
                  ))}
                </Select>
              )}
            </FormField>
            <FormField label={t("fee.gen.dueDate")}>
              {(c) => <Controller control={control} name="dueDate" render={({ field }) => <DatePicker {...c} value={field.value} onChange={field.onChange} />} />}
            </FormField>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={onPreview} disabled={previewing.isLoading || !sessionId}>
            {previewing.isLoading ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
            {t("fee.gen.preview")}
          </Button>
          <Button type="button" onClick={onGenerate} disabled={generating.isLoading || !sessionId}>
            {generating.isLoading ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
            {t("fee.gen.generate")}
          </Button>
        </div>
      </form>

      {result ? (
        <Card className="mt-6 max-w-3xl">
          <CardContent className="space-y-3 pt-5">
            <p className="font-semibold text-navy">
              {result.dryRun ? t("fee.gen.previewResult") : t("fee.gen.done")}
            </p>
            <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
              <Stat label={result.dryRun ? t("fee.gen.toCreate") : t("fee.gen.created")} value={String(result.dryRun ? result.toCreate : result.created)} />
              <Stat label={t("fee.gen.totalAmount")} value={formatMoney(result.totalAmount, fmt)} />
              <Stat label={t("fee.gen.skipped")} value={String(result.skipped)} />
            </div>
            {result.skippedDetails.length > 0 ? (
              <div>
                <p className="mb-1 text-sm font-medium text-muted-foreground">{t("fee.gen.skippedDetails")}</p>
                <ul className="max-h-48 space-y-1 overflow-y-auto text-sm">
                  {result.skippedDetails.map((s) => (
                    <li key={s.studentId} className="flex justify-between gap-3 rounded border border-border px-2 py-1">
                      <span>{s.name}</span>
                      <span className="text-muted-foreground">{s.reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="tabular text-lg font-semibold text-navy">{value}</p>
    </div>
  );
}
