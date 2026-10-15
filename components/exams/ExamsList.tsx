"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { DataTable, type TColumn } from "@/components/common/DataTable";
import { DatePicker } from "@/components/common/DatePicker";
import { FormField } from "@/components/common/FormField";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusChip, type TTone } from "@/components/common/StatusChip";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { getApiErrorMessage } from "@/lib/errors";
import { useT } from "@/lib/i18n/useT";
import { useGetClassesQuery, useGetSessionsQuery } from "@/redux/api/academicApi";
import { useCreateExamMutation, useGetExamsQuery, useGetGradingScalesQuery } from "@/redux/api/examApi";
import { useAppSelector } from "@/redux/hooks";
import type { TExam, TExamKind } from "@/types";
import { examSchema, type TExamForm } from "@/utils/schemas/exam";

const KINDS: TExamKind[] = ["term", "class_test", "model_test", "monthly", "custom"];
const TONE: Record<TExam["status"], TTone> = { draft: "muted", marks_open: "info", marks_closed: "warning", published: "success" };

export function ExamsList() {
  const { t } = useT();
  const router = useRouter();
  const { data, isLoading, error, refetch } = useGetExamsQuery();
  const [adding, setAdding] = useState(false);

  const columns: TColumn<TExam>[] = [
    { key: "name", header: t("exam.name"), cell: (e) => <span className="font-semibold text-navy">{e.name}</span> },
    { key: "kind", header: t("exam.kind"), cell: (e) => t(`exam.kind.${e.kind}`) },
    { key: "classes", header: t("exam.classes"), cell: (e) => e.classIds.length },
    { key: "status", header: t("stu.col.status"), cell: (e) => <StatusChip tone={TONE[e.status]}>{t(`exam.status.${e.status}`)}</StatusChip> },
  ];

  return (
    <>
      <PageHeader
        title={t("exam.list.title")}
        description={t("exam.list.desc")}
        action={
          <Button onClick={() => setAdding(true)}>
            <Plus aria-hidden="true" />
            {t("exam.list.add")}
          </Button>
        }
      />
      <DataTable
        columns={columns}
        rows={data?.rows}
        meta={data?.meta}
        rowKey={(e) => e._id}
        loading={isLoading}
        error={error}
        onRetry={refetch}
        onRowClick={(e) => router.push(`/dashboard/exams/${e._id}`)}
        emptyTitle={t("exam.list.empty")}
        emptyDescription={t("exam.list.emptyDesc")}
      />
      {adding ? <ExamDialog onClose={() => setAdding(false)} onCreated={(id) => router.push(`/dashboard/exams/${id}`)} /> : null}
    </>
  );
}

function ExamDialog({ onClose, onCreated }: { onClose: () => void; onCreated: (id: string) => void }) {
  const { t, tv } = useT();
  const picked = useAppSelector((s) => s.ui.selectedSessionId);
  const sessions = useGetSessionsQuery();
  const classes = useGetClassesQuery();
  const scales = useGetGradingScalesQuery();
  const sessionId = picked || sessions.data?.rows.find((s) => s.isCurrent)?._id || "";
  const [create, creating] = useCreateExamMutation();

  const { register, control, handleSubmit, formState: { errors } } = useForm<TExamForm>({
    resolver: zodResolver(examSchema),
    mode: "onTouched",
    defaultValues: { name: "", kind: "term", sessionId, classIds: [], gradingScaleId: scales.data?.rows.find((s) => s.isDefault)?._id ?? "", startDate: "", endDate: "" },
  });

  const onSubmit = handleSubmit(async (v) => {
    try {
      const exam = await create({ ...v, gradingScaleId: v.gradingScaleId || undefined, startDate: v.startDate || undefined, endDate: v.endDate || undefined }).unwrap();
      toast.success(t("exam.saved"));
      onCreated(exam._id);
    } catch (err) {
      toast.error(getApiErrorMessage(err, t));
    }
  });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent closeLabel={t("common.close")}>
        <DialogTitle>{t("exam.list.add")}</DialogTitle>
        <form onSubmit={onSubmit} noValidate className="grid gap-4">
          <FormField label={t("exam.name")} error={tv(errors.name?.message)}>
            {(c) => <Input {...c} {...register("name")} />}
          </FormField>
          <FormField label={t("exam.kind")}>
            {(c) => (
              <Select {...c} {...register("kind")}>
                {KINDS.map((k) => (
                  <option key={k} value={k}>{t(`exam.kind.${k}`)}</option>
                ))}
              </Select>
            )}
          </FormField>
          <FormField label={t("exam.classes")} error={tv(errors.classIds?.message as string)}>
            {() => (
              <Controller
                control={control}
                name="classIds"
                render={({ field }) => (
                  <div className="grid max-h-40 grid-cols-2 gap-2 overflow-y-auto rounded-lg border border-border p-2">
                    {(classes.data?.rows ?? []).map((c) => (
                      <label key={c._id} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          className="size-4"
                          checked={field.value.includes(c._id)}
                          onChange={(e) =>
                            field.onChange(e.target.checked ? [...field.value, c._id] : field.value.filter((id) => id !== c._id))
                          }
                        />
                        {c.name}
                      </label>
                    ))}
                  </div>
                )}
              />
            )}
          </FormField>
          <FormField label={t("exam.gradingScale")}>
            {(c) => (
              <Select {...c} {...register("gradingScaleId")}>
                <option value="">{t("stu.form.pick")}</option>
                {(scales.data?.rows ?? []).map((s) => (
                  <option key={s._id} value={s._id}>{s.name}</option>
                ))}
              </Select>
            )}
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label={t("exam.startDate")}>
              {(c) => <Controller control={control} name="startDate" render={({ field }) => <DatePicker {...c} value={field.value} onChange={field.onChange} />} />}
            </FormField>
            <FormField label={t("exam.endDate")} error={tv(errors.endDate?.message)}>
              {(c) => <Controller control={control} name="endDate" render={({ field }) => <DatePicker {...c} value={field.value} onChange={field.onChange} />} />}
            </FormField>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={creating.isLoading}>
              {creating.isLoading ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
              {t("common.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
