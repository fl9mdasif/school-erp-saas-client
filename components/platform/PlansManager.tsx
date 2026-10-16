"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
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
import { formatMoney } from "@/lib/format";
import { useT } from "@/lib/i18n/useT";
import { useCreatePlanMutation, useGetPlatformPlansQuery, useUpdatePlanMutation } from "@/redux/api/platformApi";
import { useAppSelector } from "@/redux/hooks";
import type { TPlan } from "@/types";
import { planSchema, type TPlanForm } from "@/utils/schemas/platform";

const EMPTY: TPlanForm = {
  slug: "", name: "",
  monthlyPrice: 0, yearlyPrice: 0, yearlyDiscount: 0, trialDays: 0,
  isActive: true, isPopular: false,
  features: [], notIncluded: [],
};

const toForm = (p: TPlan): TPlanForm => ({
  slug: p.slug,
  name: p.name,
  monthlyPrice: p.monthlyPrice,
  yearlyPrice: p.yearlyPrice,
  yearlyDiscount: p.yearlyDiscount,
  trialDays: p.trialDays,
  isActive: p.isActive,
  isPopular: p.isPopular,
  features: p.features,
  notIncluded: p.notIncluded,
});

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
                  <p className="text-xs text-muted-foreground">{p.slug}</p>
                </div>
                <div className="flex shrink-0 flex-wrap justify-end gap-1">
                  {p.isPopular ? <Badge>{t("pf.plans.popular")}</Badge> : null}
                  {!p.isActive ? <Badge>{t("pf.plans.hidden")}</Badge> : null}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="tabular text-2xl font-semibold text-navy">
                    {formatMoney(p.monthlyPrice, fmt)}{" "}
                    <span className="text-sm font-normal text-muted-foreground">{t("mk.pricing.perMonth")}</span>
                  </p>
                  {p.yearlyPrice > 0 ? (
                    <p className="text-sm text-muted-foreground">
                      {formatMoney(p.yearlyPrice, fmt)} {t("mk.pricing.perYear")}
                    </p>
                  ) : null}
                  {p.trialDays > 0 ? (
                    <p className="text-xs text-muted-foreground">{p.trialDays}d trial</p>
                  ) : null}
                </div>
                {p.features.length > 0 ? (
                  <ul className="space-y-1 text-sm">
                    {p.features.map((f) => (
                      <li key={f}>✅ {f}</li>
                    ))}
                    {p.notIncluded.map((f) => (
                      <li key={f} className="text-muted-foreground">❌ {f}</li>
                    ))}
                  </ul>
                ) : null}
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
  const { register, control, watch, setValue, handleSubmit, formState: { errors } } = useForm<TPlanForm>({
    resolver: zodResolver(planSchema),
    mode: "onTouched",
    defaultValues: plan ? toForm(plan) : EMPTY,
  });
  const featuresVal = watch("features");
  const notIncludedVal = watch("notIncluded");

  const onSubmit = handleSubmit(async (v) => {
    const body = {
      slug: v.slug,
      name: v.name,
      monthlyPrice: v.monthlyPrice,
      yearlyPrice: v.yearlyPrice,
      yearlyDiscount: v.yearlyDiscount,
      trialDays: v.trialDays,
      isActive: v.isActive,
      isPopular: v.isPopular,
      features: v.features.filter(Boolean),
      notIncluded: v.notIncluded.filter(Boolean),
    };
    try {
      if (plan) {
        const { slug: _s, ...rest } = body;
        void _s;
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
        <form onSubmit={onSubmit} noValidate className="grid max-h-[70vh] gap-4 overflow-y-auto pr-1">
          <FormField label={t("pf.plans.code")} hint={t("pf.plans.codeHint")} error={tv(errors.slug?.message)}>
            {(c) => <Input autoCapitalize="none" spellCheck={false} disabled={!!plan} {...c} {...register("slug")} />}
          </FormField>
          <FormField label={t("pf.plans.name")} error={tv(errors.name?.message)}>
            {(c) => <Input {...c} {...register("name")} />}
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label={t("pf.plans.price")} error={tv(errors.monthlyPrice?.message)}>
              {(c) => (
                <Controller
                  control={control}
                  name="monthlyPrice"
                  render={({ field }) => (
                    <MoneyInput {...c} value={Number.isFinite(field.value) ? field.value : null} onChange={(v) => field.onChange(v ?? 0)} />
                  )}
                />
              )}
            </FormField>
            <FormField label={t("pf.plans.yearlyPrice")} error={tv(errors.yearlyPrice?.message)}>
              {(c) => (
                <Controller
                  control={control}
                  name="yearlyPrice"
                  render={({ field }) => (
                    <MoneyInput {...c} value={Number.isFinite(field.value) ? field.value : null} onChange={(v) => field.onChange(v ?? 0)} />
                  )}
                />
              )}
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label={t("pf.plans.yearlyDiscount")} error={tv(errors.yearlyDiscount?.message)}>
              {(c) => (
                <Controller
                  control={control}
                  name="yearlyDiscount"
                  render={({ field }) => (
                    <MoneyInput {...c} value={Number.isFinite(field.value) ? field.value : null} onChange={(v) => field.onChange(v ?? 0)} />
                  )}
                />
              )}
            </FormField>
            <FormField label={t("pf.plans.trialDays")} error={tv(errors.trialDays?.message)}>
              {(c) => <Input type="number" inputMode="numeric" min={0} {...c} {...register("trialDays", { valueAsNumber: true })} />}
            </FormField>
          </div>

          <div className="flex gap-6">
            <label className="flex min-h-9 items-center gap-2 text-sm">
              <input type="checkbox" className="size-4 accent-primary" {...register("isActive")} />
              {t("pf.plans.active")}
            </label>
            <label className="flex min-h-9 items-center gap-2 text-sm">
              <input type="checkbox" className="size-4 accent-primary" {...register("isPopular")} />
              {t("pf.plans.popular")}
            </label>
          </div>

          {/* features[] */}
          <div>
            <p className="mb-2 text-sm font-medium">{t("pf.plans.features")}</p>
            {featuresVal.map((val, i) => (
              <div key={i} className="mb-2 flex gap-2">
                <Input
                  value={val}
                  onChange={(e) => {
                    const arr = [...featuresVal];
                    arr[i] = e.target.value;
                    setValue("features", arr);
                  }}
                />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => setValue("features", featuresVal.filter((_, j) => j !== i))}
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </Button>
              </div>
            ))}
            <Button type="button" size="sm" variant="outline" onClick={() => setValue("features", [...featuresVal, ""])}>
              <Plus className="size-3" aria-hidden="true" />
              {t("pf.plans.addFeature")}
            </Button>
          </div>

          {/* notIncluded[] */}
          <div>
            <p className="mb-2 text-sm font-medium">{t("pf.plans.notIncluded")}</p>
            {notIncludedVal.map((val, i) => (
              <div key={i} className="mb-2 flex gap-2">
                <Input
                  value={val}
                  onChange={(e) => {
                    const arr = [...notIncludedVal];
                    arr[i] = e.target.value;
                    setValue("notIncluded", arr);
                  }}
                />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => setValue("notIncluded", notIncludedVal.filter((_, j) => j !== i))}
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </Button>
              </div>
            ))}
            <Button type="button" size="sm" variant="outline" onClick={() => setValue("notIncluded", [...notIncludedVal, ""])}>
              <Plus className="size-3" aria-hidden="true" />
              {t("pf.plans.addNotIncluded")}
            </Button>
          </div>

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
