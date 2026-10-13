"use client";

import { Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { FormField } from "@/components/common/FormField";
import { MoneyInput } from "@/components/common/MoneyInput";
import { PageHeader } from "@/components/common/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { getApiErrorMessage } from "@/lib/errors";
import { formatMoney } from "@/lib/format";
import { useT } from "@/lib/i18n/useT";
import { useGetClassesQuery, useGetSessionsQuery } from "@/redux/api/academicApi";
import { useCreateFeeStructureMutation, useGetFeeHeadsQuery, useGetFeeStructuresQuery, useUpdateFeeStructureMutation } from "@/redux/api/feesApi";
import { useAppSelector } from "@/redux/hooks";
import type { TClassGroup, TFeeStructure } from "@/types";
import { structureSchema, type TStructureForm } from "@/utils/schemas/fees";

const CYCLES = ["monthly", "term", "yearly", "one_time"] as const;

export function FeeStructures() {
  const { t, term } = useT();
  const picked = useAppSelector((s) => s.ui.selectedSessionId);
  const sessions = useGetSessionsQuery();
  const classes = useGetClassesQuery();
  const [classId, setClassId] = useState("");
  const [group, setGroup] = useState<"" | "science" | "commerce" | "arts">("");

  const sessionId = picked || sessions.data?.rows.find((s) => s.isCurrent)?._id || "";
  const activeClass = classId || classes.data?.rows[0]?._id || "";
  const structures = useGetFeeStructuresQuery({ sessionId, classId: activeClass }, { skip: !sessionId || !activeClass });
  const found = structures.data?.rows.find((s) => (s.group ?? "") === group);

  return (
    <>
      <PageHeader title={t("fee.str.title")} description={t("fee.str.desc", { class: term("class") })} />

      <div className="mb-4 grid max-w-xl gap-3 sm:grid-cols-2">
        <FormField label={term("class")}>
          {(c) => (
            <Select {...c} value={activeClass} onChange={(e) => setClassId(e.target.value)}>
              {(classes.data?.rows ?? []).map((k) => (
                <option key={k._id} value={k._id}>{k.name}</option>
              ))}
            </Select>
          )}
        </FormField>
        <FormField label={t("ac.cls.group")}>
          {(c) => (
            <Select {...c} value={group} onChange={(e) => setGroup(e.target.value as typeof group)}>
              <option value="">{t("ac.cls.group.none")}</option>
              <option value="science">{t("ac.cls.group.science")}</option>
              <option value="commerce">{t("ac.cls.group.commerce")}</option>
              <option value="arts">{t("ac.cls.group.arts")}</option>
            </Select>
          )}
        </FormField>
      </div>

      {structures.error ? (
        <ErrorState error={structures.error} onRetry={structures.refetch} />
      ) : !sessionId || !activeClass ? (
        <EmptyState title={t("fee.str.needSetup", { class: term("class") })} />
      ) : structures.isLoading || structures.isFetching ? (
        <Skeleton className="h-64 w-full max-w-3xl" />
      ) : (
        <StructureEditor key={`${activeClass}|${group}|${found?._id ?? "new"}`} sessionId={sessionId} classId={activeClass} group={group || null} existing={found} />
      )}
    </>
  );
}

function StructureEditor({ sessionId, classId, group, existing }: { sessionId: string; classId: string; group: TClassGroup; existing?: TFeeStructure }) {
  const { t, tv, lang } = useT();
  const banglaDigits = useAppSelector((s) => s.ui.banglaDigits);
  const fmt = { lang, banglaDigits } as const;
  const heads = useGetFeeHeadsQuery();
  const [create, creating] = useCreateFeeStructureMutation();
  const [update, updating] = useUpdateFeeStructureMutation();
  const activeHeads = (heads.data?.rows ?? []).filter((h) => h.isActive || existing?.items.some((i) => i.feeHeadId === h._id));

  const { register, control, handleSubmit, formState: { errors } } = useForm<TStructureForm>({
    resolver: zodResolver(structureSchema),
    mode: "onTouched",
    defaultValues: { items: existing?.items.map((i) => ({ feeHeadId: i.feeHeadId, amount: i.amount, cycle: i.cycle, dueDay: i.dueDay ? String(i.dueDay) : "" })) ?? [] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const items = useWatch({ control, name: "items" });
  const monthly = (items ?? []).reduce((n, i) => n + (i?.cycle === "monthly" ? Number(i.amount) || 0 : 0), 0);

  const onSubmit = handleSubmit(async (v) => {
    const payload = v.items.map((i) => ({ feeHeadId: i.feeHeadId, amount: i.amount, cycle: i.cycle, ...(i.dueDay ? { dueDay: Number(i.dueDay) } : {}) }));
    try {
      if (existing) await update({ id: existing._id, items: payload }).unwrap();
      else await create({ sessionId, classId, group, items: payload }).unwrap();
      toast.success(t("fee.str.saved"));
    } catch (err) {
      toast.error(getApiErrorMessage(err, t));
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="max-w-4xl">
      <Card>
        <CardContent className="space-y-3 pt-5">
          {fields.length === 0 ? <p className="text-sm text-muted-foreground">{t("fee.str.none")}</p> : null}
          {fields.map((f, i) => (
            <div key={f.id} className="grid gap-3 rounded-lg border border-border p-3 sm:grid-cols-[1.4fr_1fr_1fr_6rem_auto] sm:items-end">
              <FormField label={t("fee.str.head")} error={tv(errors.items?.[i]?.feeHeadId?.message)}>
                {(c) => (
                  <Select {...c} {...register(`items.${i}.feeHeadId`)}>
                    <option value="">{t("stu.form.pick")}</option>
                    {activeHeads.map((h) => (
                      <option key={h._id} value={h._id}>{h.name}</option>
                    ))}
                  </Select>
                )}
              </FormField>
              <FormField label={t("fee.str.amount")} error={tv(errors.items?.[i]?.amount?.message)}>
                {(c) => (
                  <Controller
                    control={control}
                    name={`items.${i}.amount`}
                    render={({ field }) => <MoneyInput {...c} value={Number.isFinite(field.value) ? field.value : null} onChange={(v) => field.onChange(v ?? undefined)} />}
                  />
                )}
              </FormField>
              <FormField label={t("fee.str.cycle")}>
                {(c) => (
                  <Select {...c} {...register(`items.${i}.cycle`)}>
                    {CYCLES.map((cy) => (
                      <option key={cy} value={cy}>{t(`fee.cycle.${cy}`)}</option>
                    ))}
                  </Select>
                )}
              </FormField>
              <FormField label={t("fee.str.dueDay")} error={tv(errors.items?.[i]?.dueDay?.message)}>
                {(c) => <Input inputMode="numeric" {...c} {...register(`items.${i}.dueDay`)} />}
              </FormField>
              <Button type="button" variant="ghost" size="icon" onClick={() => remove(i)} aria-label={t("common.delete")}>
                <Trash2 aria-hidden="true" />
              </Button>
            </div>
          ))}
          {errors.items?.message || errors.items?.root?.message ? (
            <p role="alert" className="text-sm text-destructive">{tv(errors.items?.message ?? errors.items?.root?.message)}</p>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button type="button" variant="outline" onClick={() => append({ feeHeadId: "", amount: 0, cycle: "monthly", dueDay: "" })}>
              <Plus aria-hidden="true" />
              {t("fee.str.addItem")}
            </Button>
            <p className="tabular text-sm font-semibold text-navy" aria-live="polite">
              {t("fee.str.monthlyTotal")}: {formatMoney(monthly, fmt)}
            </p>
          </div>
          <Button type="submit" disabled={creating.isLoading || updating.isLoading}>
            {creating.isLoading || updating.isLoading ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
            {t("common.save")}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
