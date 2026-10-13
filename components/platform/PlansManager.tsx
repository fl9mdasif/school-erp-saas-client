"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil, Plus } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { FormField } from "@/components/common/FormField";
import { MoneyInput } from "@/components/common/MoneyInput";
import { PageHeader } from "@/components/common/PageHeader";
import { CardSkeleton } from "@/components/common/Skeletons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { getApiErrorMessage } from "@/lib/errors";
import { formatMoney, formatNumber } from "@/lib/format";
import { useT } from "@/lib/i18n/useT";
import { useCreatePlanMutation, useGetPlatformPlansQuery, useUpdatePlanMutation } from "@/redux/api/platformApi";
import { useAppSelector } from "@/redux/hooks";
import type { TPlan } from "@/types";
import { planSchema, type TPlanForm } from "@/utils/schemas/platform";

const EMPTY: TPlanForm = { code: "", name: "", priceMonthly: 0, studentCap: 100, csvImport: true, marksheetPdf: true, customDomain: false, isActive: true };

const toForm = (p: TPlan): TPlanForm => ({
  code: p.code,
  name: p.name,
  priceMonthly: p.priceMonthly,
  studentCap: p.studentCap,
  csvImport: p.features.csvImport,
  marksheetPdf: p.features.marksheetPdf,
  customDomain: p.features.customDomain,
  isActive: p.isActive,
});

const FLAGS = [
  { key: "csvImport", label: "pf.plans.csv" },
  { key: "marksheetPdf", label: "pf.plans.pdf" },
  { key: "customDomain", label: "pf.plans.domain" },
  { key: "isActive", label: "pf.plans.active" },
] as const;

export function PlansManager() {
  const { t, lang } = useT();
  const banglaDigits = useAppSelector((s) => s.ui.banglaDigits);
  const fmt = { lang, banglaDigits } as const;
  const { data, isLoading, error, refetch } = useGetPlatformPlansQuery();
  const [editing, setEditing] = useState<TPlan | "new" | null>(null);

  return (
    <>
      <PageHeader
        title={t("pf.plans.title")}
        description={t("pf.plans.desc")}
        action={
          <Button onClick={() => setEditing("new")}>
            <Plus aria-hidden="true" />
            {t("pf.plans.add")}
          </Button>
        }
      />

      {error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : isLoading ? (
        <CardSkeleton count={3} />
      ) : !data?.length ? (
        <EmptyState title={t("pf.plans.empty")} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.map((p) => (
            <Card key={p._id}>
              <CardHeader className="flex-row items-start justify-between gap-2">
                <div className="min-w-0">
                  <CardTitle>{p.name}</CardTitle>
                  <p className="text-xs text-muted-foreground">{p.code}</p>
                </div>
                {!p.isActive ? <Badge>{t("pf.plans.hidden")}</Badge> : null}
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="tabular text-2xl font-semibold text-navy">
                  {formatMoney(p.priceMonthly, fmt)} <span className="text-sm font-normal text-muted-foreground">{t("mk.pricing.perMonth")}</span>
                </p>
                <ul className="space-y-1 text-sm">
                  <li>
                    {t("pf.plans.cap")}: <span className="tabular font-semibold">{formatNumber(p.studentCap, fmt)}</span>
                  </li>
                  {p.features.csvImport ? <li>{t("pf.plans.csv")}</li> : null}
                  {p.features.marksheetPdf ? <li>{t("pf.plans.pdf")}</li> : null}
                  {p.features.customDomain ? <li>{t("pf.plans.domain")}</li> : null}
                </ul>
                <Button variant="outline" onClick={() => setEditing(p)}>
                  <Pencil aria-hidden="true" />
                  {t("pf.plans.edit")}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {editing ? <PlanDialog plan={editing === "new" ? null : editing} onClose={() => setEditing(null)} /> : null}
    </>
  );
}

function PlanDialog({ plan, onClose }: { plan: TPlan | null; onClose: () => void }) {
  const { t, tv } = useT();
  const [create, creating] = useCreatePlanMutation();
  const [update, updating] = useUpdatePlanMutation();
  const busy = creating.isLoading || updating.isLoading;
  const { register, control, handleSubmit, formState: { errors } } = useForm<TPlanForm>({
    resolver: zodResolver(planSchema),
    mode: "onTouched",
    defaultValues: plan ? toForm(plan) : EMPTY,
  });

  const onSubmit = handleSubmit(async (v) => {
    const body = {
      code: v.code,
      name: v.name,
      priceMonthly: v.priceMonthly,
      studentCap: v.studentCap,
      isActive: v.isActive,
      features: { csvImport: v.csvImport, marksheetPdf: v.marksheetPdf, customDomain: v.customDomain },
    };
    try {
      if (plan) {
        const { code, ...rest } = body;
        void code;
        await update({ id: plan._id, data: rest }).unwrap();
      } else {
        await create(body).unwrap();
      }
      toast.success(t("pf.plans.saved"));
      onClose();
    } catch (err) {
      toast.error(getApiErrorMessage(err, t));
    }
  });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent closeLabel={t("common.close")}>
        <DialogTitle>{plan ? t("pf.plans.edit") : t("pf.plans.add")}</DialogTitle>
        <form onSubmit={onSubmit} noValidate className="grid gap-4">
          <FormField label={t("pf.plans.code")} hint={t("pf.plans.codeHint")} error={tv(errors.code?.message)}>
            {(c) => <Input autoCapitalize="none" spellCheck={false} disabled={!!plan} {...c} {...register("code")} />}
          </FormField>
          <FormField label={t("pf.plans.name")} error={tv(errors.name?.message)}>
            {(c) => <Input {...c} {...register("name")} />}
          </FormField>
          <FormField label={t("pf.plans.price")} error={tv(errors.priceMonthly?.message)}>
            {(c) => (
              <Controller
                control={control}
                name="priceMonthly"
                render={({ field }) => (
                  <MoneyInput {...c} value={Number.isFinite(field.value) ? field.value : null} onChange={(v) => field.onChange(v ?? undefined)} />
                )}
              />
            )}
          </FormField>
          <FormField label={t("pf.plans.cap")} error={tv(errors.studentCap?.message)}>
            {(c) => <Input type="number" inputMode="numeric" min={1} {...c} {...register("studentCap", { valueAsNumber: true })} />}
          </FormField>
          {FLAGS.map((f) => (
            <label key={f.key} className="flex min-h-11 items-center gap-3 text-sm">
              <input type="checkbox" className="size-5 accent-primary" {...register(f.key)} />
              {t(f.label)}
            </label>
          ))}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
              {t("pf.plans.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
