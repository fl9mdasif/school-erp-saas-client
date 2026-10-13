"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import toast from "react-hot-toast";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { DataTable, type TColumn } from "@/components/common/DataTable";
import { FormField } from "@/components/common/FormField";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { getApiErrorMessage } from "@/lib/errors";
import { formatNumber } from "@/lib/format";
import { useT } from "@/lib/i18n/useT";
import { useCreateSubjectMutation, useDeleteSubjectMutation, useGetSubjectsQuery, useUpdateSubjectMutation } from "@/redux/api/academicApi";
import { useAppSelector } from "@/redux/hooks";
import type { TSubject } from "@/types";
import { subjectSchema, type TSubjectForm } from "@/utils/schemas/academic";

const total = (s: TSubject, f: "fullMarks" | "passMarks") => s.components.reduce((n, c) => n + c.fullMarks * (f === "fullMarks" ? 1 : 0) + c.passMarks * (f === "passMarks" ? 1 : 0), 0);

export function SubjectsManager() {
  const { t, lang } = useT();
  const banglaDigits = useAppSelector((s) => s.ui.banglaDigits);
  const fmt = { lang, banglaDigits } as const;
  const { data, isLoading, error, refetch } = useGetSubjectsQuery();
  const [remove, removing] = useDeleteSubjectMutation();
  const [editing, setEditing] = useState<TSubject | "new" | null>(null);
  const [deleting, setDeleting] = useState<TSubject | null>(null);

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await remove(deleting._id).unwrap();
      toast.success(t("ac.sub.deleted"));
    } catch (err) {
      // For example "this subject is mapped to a class"
      toast.error(getApiErrorMessage(err, t));
    }
    setDeleting(null);
  };

  const columns: TColumn<TSubject>[] = [
    {
      key: "name",
      header: t("ac.sub.name"),
      cell: (s) => (
        <span className="block min-w-0">
          <span className="font-medium">{lang === "bn" && s.nameBn ? s.nameBn : s.name}</span>
          {s.code ? <span className="ml-2 text-xs text-muted-foreground">{s.code}</span> : null}
        </span>
      ),
    },
    {
      key: "parts",
      header: t("ac.sub.parts"),
      cell: (s) => (s.components.length ? s.components.map((c) => c.label).join(" + ") : <span className="text-muted-foreground">{t("ac.sub.single")}</span>),
    },
    {
      key: "full",
      header: t("ac.sub.full"),
      cell: (s) => <span className="tabular">{s.components.length ? formatNumber(total(s, "fullMarks"), fmt) : "-"}</span>,
    },
    {
      key: "pass",
      header: t("ac.sub.pass"),
      cell: (s) => <span className="tabular">{s.components.length ? formatNumber(total(s, "passMarks"), fmt) : "-"}</span>,
    },
  ];

  return (
    <>
      <PageHeader
        title={t("ac.sub.title")}
        description={t("ac.sub.desc")}
        action={
          <Button onClick={() => setEditing("new")}>
            <Plus aria-hidden="true" />
            {t("ac.sub.add")}
          </Button>
        }
      />
      <DataTable
        columns={columns}
        rows={data?.rows}
        meta={data?.meta}
        rowKey={(s) => s._id}
        loading={isLoading}
        error={error}
        onRetry={refetch}
        emptyTitle={t("ac.sub.empty")}
        emptyDescription={t("ac.sub.emptyDesc")}
        rowActions={(s) => (
          <>
            <Button variant="ghost" size="icon" onClick={() => setEditing(s)} aria-label={t("common.edit")}>
              <Pencil aria-hidden="true" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setDeleting(s)} aria-label={t("common.delete")}>
              <Trash2 aria-hidden="true" />
            </Button>
          </>
        )}
      />
      {editing ? <SubjectDialog subject={editing === "new" ? null : editing} onClose={() => setEditing(null)} /> : null}
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={t("ac.sub.deleteTitle", { name: deleting?.name ?? "" })}
        description={t("ac.sub.deleteBody")}
        confirmLabel={t("common.delete")}
        destructive
        loading={removing.isLoading}
        onConfirm={confirmDelete}
      />
    </>
  );
}

function SubjectDialog({ subject, onClose }: { subject: TSubject | null; onClose: () => void }) {
  const { t, tv, lang } = useT();
  const banglaDigits = useAppSelector((s) => s.ui.banglaDigits);
  const fmt = { lang, banglaDigits } as const;
  const [create, creating] = useCreateSubjectMutation();
  const [update, updating] = useUpdateSubjectMutation();
  const { register, control, handleSubmit, formState: { errors } } = useForm<TSubjectForm>({
    resolver: zodResolver(subjectSchema),
    mode: "onTouched",
    defaultValues: {
      name: subject?.name ?? "",
      nameBn: subject?.nameBn ?? "",
      code: subject?.code ?? "",
      components: subject?.components ?? [],
    },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "components" });
  const watched = useWatch({ control, name: "components" });
  const sumFull = (watched ?? []).reduce((n, c) => n + (Number(c?.fullMarks) || 0), 0);
  const sumPass = (watched ?? []).reduce((n, c) => n + (Number(c?.passMarks) || 0), 0);

  const onSubmit = handleSubmit(async (v) => {
    const data = { name: v.name, nameBn: v.nameBn || undefined, code: v.code || undefined, components: v.components };
    try {
      if (subject) await update({ id: subject._id, data }).unwrap();
      else await create(data).unwrap();
      toast.success(t("ac.sub.saved"));
      onClose();
    } catch (err) {
      toast.error(getApiErrorMessage(err, t));
    }
  });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent closeLabel={t("common.close")} className="max-w-2xl">
        <DialogTitle>{subject ? t("ac.sub.edit") : t("ac.sub.add")}</DialogTitle>
        <form onSubmit={onSubmit} noValidate className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <FormField label={t("ac.sub.name")} error={tv(errors.name?.message)}>
              {(c) => <Input {...c} {...register("name")} />}
            </FormField>
            <FormField label={t("ac.sub.nameBn")}>
              {(c) => <Input {...c} {...register("nameBn")} />}
            </FormField>
            <FormField label={t("ac.sub.code")}>
              {(c) => <Input {...c} {...register("code")} />}
            </FormField>
          </div>

          <fieldset className="space-y-3">
            <legend className="text-sm font-semibold text-navy">{t("ac.sub.parts")}</legend>
            <p className="text-xs text-muted-foreground">{t("ac.sub.partsHint")}</p>
            {fields.map((f, i) => (
              <div key={f.id} className="grid grid-cols-2 gap-2 rounded-lg border border-border p-3 sm:grid-cols-[1fr_1fr_6rem_6rem_auto] sm:items-end">
                <FormField label={t("ac.sub.key")} error={tv(errors.components?.[i]?.key?.message)}>
                  {(c) => <Input {...c} {...register(`components.${i}.key`)} />}
                </FormField>
                <FormField label={t("ac.sub.label")} error={tv(errors.components?.[i]?.label?.message)}>
                  {(c) => <Input {...c} {...register(`components.${i}.label`)} />}
                </FormField>
                <FormField label={t("ac.sub.full")} error={tv(errors.components?.[i]?.fullMarks?.message)}>
                  {(c) => <Input type="number" inputMode="decimal" min={0} {...c} {...register(`components.${i}.fullMarks`, { valueAsNumber: true })} />}
                </FormField>
                <FormField label={t("ac.sub.pass")} error={tv(errors.components?.[i]?.passMarks?.message)}>
                  {(c) => <Input type="number" inputMode="decimal" min={0} {...c} {...register(`components.${i}.passMarks`, { valueAsNumber: true })} />}
                </FormField>
                <Button type="button" variant="ghost" size="icon" onClick={() => remove(i)} aria-label={t("common.delete")}>
                  <Trash2 aria-hidden="true" />
                </Button>
              </div>
            ))}
            {errors.components?.message || errors.components?.root?.message ? (
              <p role="alert" className="text-sm text-destructive">{tv(errors.components?.message ?? errors.components?.root?.message)}</p>
            ) : null}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Button type="button" variant="outline" disabled={fields.length >= 8} onClick={() => append({ key: "", label: "", fullMarks: 0, passMarks: 0 })}>
                <Plus aria-hidden="true" />
                {t("ac.sub.addPart")}
              </Button>
              {fields.length ? (
                <p aria-live="polite" className="tabular text-sm font-semibold text-navy">
                  {t("ac.sub.total", { full: formatNumber(sumFull, fmt), pass: formatNumber(sumPass, fmt) })}
                </p>
              ) : null}
            </div>
          </fieldset>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={creating.isLoading || updating.isLoading}>
              {creating.isLoading || updating.isLoading ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
              {t("common.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
