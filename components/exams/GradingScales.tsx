"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { DataTable, type TColumn } from "@/components/common/DataTable";
import { FormField } from "@/components/common/FormField";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusChip } from "@/components/common/StatusChip";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { getApiErrorMessage } from "@/lib/errors";
import { useT } from "@/lib/i18n/useT";
import { useCreateGradingScaleMutation, useDeleteGradingScaleMutation, useGetGradingScalesQuery, useUpdateGradingScaleMutation } from "@/redux/api/examApi";
import type { TGradingScale } from "@/types";
import { gradingScaleSchema, type TGradingScaleForm } from "@/utils/schemas/exam";

const PRESETS: Record<string, TGradingScaleForm> = {
  gpa5: {
    name: "Bangladesh GPA 5.00",
    kind: "gpa",
    passPercent: 33,
    bands: [
      { minPercent: 80, maxPercent: 100, letter: "A+", point: 5 },
      { minPercent: 70, maxPercent: 79, letter: "A", point: 4 },
      { minPercent: 60, maxPercent: 69, letter: "A-", point: 3.5 },
      { minPercent: 50, maxPercent: 59, letter: "B", point: 3 },
      { minPercent: 40, maxPercent: 49, letter: "C", point: 2 },
      { minPercent: 33, maxPercent: 39, letter: "D", point: 1 },
      { minPercent: 0, maxPercent: 32, letter: "F", point: 0 },
    ],
    failIfAnyCompulsoryFails: true,
    fourthSubjectBonus: true,
    graceMarksPerSubject: 0,
    meritTieBreak: "total_then_roll",
  },
  percentage: {
    name: "Percentage",
    kind: "percentage",
    passPercent: 33,
    bands: [
      { minPercent: 80, maxPercent: 100, letter: "Excellent" },
      { minPercent: 60, maxPercent: 79, letter: "Very good" },
      { minPercent: 40, maxPercent: 59, letter: "Good" },
      { minPercent: 33, maxPercent: 39, letter: "Pass" },
      { minPercent: 0, maxPercent: 32, letter: "Fail" },
    ],
    failIfAnyCompulsoryFails: true,
    fourthSubjectBonus: false,
    graceMarksPerSubject: 0,
    meritTieBreak: "total_then_roll",
  },
  division: {
    name: "Division",
    kind: "division",
    passPercent: 33,
    bands: [
      { minPercent: 60, maxPercent: 100, letter: "1st Division" },
      { minPercent: 45, maxPercent: 59, letter: "2nd Division" },
      { minPercent: 33, maxPercent: 44, letter: "3rd Division" },
      { minPercent: 0, maxPercent: 32, letter: "Fail" },
    ],
    failIfAnyCompulsoryFails: true,
    fourthSubjectBonus: false,
    graceMarksPerSubject: 0,
    meritTieBreak: "total_then_roll",
  },
};

export function GradingScales() {
  const { t } = useT();
  const { data, isLoading, error, refetch } = useGetGradingScalesQuery();
  const [update] = useUpdateGradingScaleMutation();
  const [del, deleting] = useDeleteGradingScaleMutation();
  const [editing, setEditing] = useState<TGradingScale | "new" | null>(null);
  const [removing, setRemoving] = useState<TGradingScale | null>(null);

  const makeDefault = async (s: TGradingScale) => {
    try {
      await update({ id: s._id, data: { isDefault: true } }).unwrap();
      toast.success(t("exam.scale.saved"));
    } catch (err) {
      toast.error(getApiErrorMessage(err, t));
    }
  };

  const confirmDelete = async () => {
    if (!removing) return;
    try {
      await del(removing._id).unwrap();
      toast.success(t("exam.scale.deleted"));
      setRemoving(null);
    } catch (err) {
      toast.error(getApiErrorMessage(err, t));
    }
  };

  const columns: TColumn<TGradingScale>[] = [
    {
      key: "name",
      header: t("exam.scale.name"),
      cell: (s) => (
        <span className="flex items-center gap-2">
          <span className="font-semibold text-navy">{s.name}</span>
          {s.isDefault ? <StatusChip tone="success">{t("exam.scale.default")}</StatusChip> : null}
        </span>
      ),
    },
    { key: "kind", header: t("exam.scale.kind"), cell: (s) => t(`exam.scale.kind.${s.kind}`) },
    { key: "bands", header: t("exam.scale.bands"), cell: (s) => s.bands.length },
    { key: "pass", header: t("exam.scale.passPercent"), cell: (s) => `${s.passPercent}%` },
  ];

  return (
    <>
      <PageHeader
        title={t("exam.scale.title")}
        description={t("exam.scale.desc")}
        action={
          <Button onClick={() => setEditing("new")}>
            <Plus aria-hidden="true" />
            {t("exam.scale.add")}
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
        emptyTitle={t("exam.scale.empty")}
        rowActions={(s) => (
          <>
            {!s.isDefault ? (
              <Button variant="outline" onClick={() => makeDefault(s)}>
                {t("exam.scale.makeDefault")}
              </Button>
            ) : null}
            <Button variant="ghost" size="icon" onClick={() => setEditing(s)} aria-label={t("common.edit")}>
              <Pencil aria-hidden="true" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setRemoving(s)} aria-label={t("common.delete")}>
              <Trash2 aria-hidden="true" />
            </Button>
          </>
        )}
      />
      {editing ? <ScaleDialog scale={editing === "new" ? null : editing} onClose={() => setEditing(null)} /> : null}
      <ConfirmDialog
        open={!!removing}
        onOpenChange={(o) => !o && setRemoving(null)}
        title={t("exam.scale.deleteTitle")}
        confirmLabel={t("common.delete")}
        onConfirm={confirmDelete}
        loading={deleting.isLoading}
        destructive
      />
    </>
  );
}

function ScaleDialog({ scale, onClose }: { scale: TGradingScale | null; onClose: () => void }) {
  const { t, tv } = useT();
  const [create, creating] = useCreateGradingScaleMutation();
  const [update, updating] = useUpdateGradingScaleMutation();
  const { register, control, handleSubmit, reset, formState: { errors } } = useForm<TGradingScaleForm>({
    resolver: zodResolver(gradingScaleSchema),
    mode: "onTouched",
    defaultValues: scale
      ? { name: scale.name, kind: scale.kind, passPercent: scale.passPercent, bands: scale.bands, ...scale.rules }
      : PRESETS.gpa5,
  });
  const { fields, append, remove } = useFieldArray({ control, name: "bands" });

  const onSubmit = handleSubmit(async (v) => {
    const payload = {
      name: v.name,
      kind: v.kind,
      passPercent: v.passPercent,
      bands: v.bands,
      rules: {
        failIfAnyCompulsoryFails: v.failIfAnyCompulsoryFails,
        fourthSubjectBonus: v.fourthSubjectBonus,
        graceMarksPerSubject: v.graceMarksPerSubject,
        meritTieBreak: v.meritTieBreak,
      },
      isDefault: v.isDefault,
    };
    try {
      if (scale) await update({ id: scale._id, data: payload }).unwrap();
      else await create(payload).unwrap();
      toast.success(t("exam.scale.saved"));
      onClose();
    } catch (err) {
      toast.error(getApiErrorMessage(err, t));
    }
  });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent closeLabel={t("common.close")} className="max-w-2xl">
        <DialogTitle>{scale ? t("exam.scale.edit") : t("exam.scale.add")}</DialogTitle>
        {!scale ? (
          <div className="flex flex-wrap gap-2">
            {Object.entries(PRESETS).map(([key, preset]) => (
              <Button key={key} type="button" variant="outline" size="sm" onClick={() => reset(preset)}>
                {preset.name}
              </Button>
            ))}
          </div>
        ) : null}
        <form onSubmit={onSubmit} noValidate className="grid gap-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <FormField label={t("exam.scale.name")} error={tv(errors.name?.message)}>
              {(c) => <Input {...c} {...register("name")} />}
            </FormField>
            <FormField label={t("exam.scale.kind")}>
              {(c) => (
                <Select {...c} {...register("kind")}>
                  <option value="gpa">{t("exam.scale.kind.gpa")}</option>
                  <option value="division">{t("exam.scale.kind.division")}</option>
                  <option value="percentage">{t("exam.scale.kind.percentage")}</option>
                </Select>
              )}
            </FormField>
            <FormField label={t("exam.scale.passPercent")} error={tv(errors.passPercent?.message)}>
              {(c) => <Input type="number" min={0} max={100} {...c} {...register("passPercent", { valueAsNumber: true })} />}
            </FormField>
          </div>

          <Card>
            <CardContent className="space-y-2 pt-4">
              <p className="mb-1 text-sm font-semibold text-navy">{t("exam.scale.bands")}</p>
              {fields.map((f, i) => (
                <div key={f.id} className="grid grid-cols-[5rem_5rem_1fr_4rem_auto] items-end gap-2">
                  <Input type="number" min={0} max={100} placeholder={t("exam.scale.min")} {...register(`bands.${i}.minPercent`, { valueAsNumber: true })} />
                  <Input type="number" min={0} max={100} placeholder={t("exam.scale.max")} {...register(`bands.${i}.maxPercent`, { valueAsNumber: true })} />
                  <Input placeholder={t("exam.scale.letter")} {...register(`bands.${i}.letter`)} />
                  <Input type="number" step="0.1" min={0} max={10} placeholder={t("exam.scale.point")} {...register(`bands.${i}.point`, { valueAsNumber: true })} />
                  <Button type="button" variant="ghost" size="icon" onClick={() => remove(i)} aria-label={t("common.delete")}>
                    <Trash2 aria-hidden="true" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => append({ minPercent: 0, maxPercent: 0, letter: "" })}>
                <Plus aria-hidden="true" />
                {t("exam.scale.addBand")}
              </Button>
            </CardContent>
          </Card>

          <div className="grid gap-2 sm:grid-cols-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="size-4" {...register("failIfAnyCompulsoryFails")} />
              {t("exam.scale.failIfCompulsory")}
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="size-4" {...register("fourthSubjectBonus")} />
              {t("exam.scale.fourthBonus")}
            </label>
            <FormField label={t("exam.scale.graceMarks")}>
              {(c) => <Input type="number" min={0} max={20} {...c} {...register("graceMarksPerSubject", { valueAsNumber: true })} />}
            </FormField>
            <FormField label={t("exam.scale.tieBreak")}>
              {(c) => (
                <Select {...c} {...register("meritTieBreak")}>
                  <option value="total_then_roll">{t("exam.scale.tieBreak.roll")}</option>
                  <option value="total_then_name">{t("exam.scale.tieBreak.name")}</option>
                </Select>
              )}
            </FormField>
          </div>

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
