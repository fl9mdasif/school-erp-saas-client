"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { DatePicker } from "@/components/common/DatePicker";
import { FormField } from "@/components/common/FormField";
import { MoneyInput } from "@/components/common/MoneyInput";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { formatLocalDate, formatMoney, isoToLocalDate, todayLocal, addDays } from "@/lib/format";
import { getApiErrorMessage } from "@/lib/errors";
import { useT } from "@/lib/i18n/useT";
import { useGetPlatformPlansQuery, useRecordSubscriptionPaymentMutation } from "@/redux/api/platformApi";
import { useAppSelector } from "@/redux/hooks";
import type { TTenantDetail } from "@/types";
import { subscriptionPaymentSchema, type TSubscriptionPaymentForm } from "@/utils/schemas/platform";

const METHODS = ["bkash_manual", "nagad_manual", "bank", "cash"] as const;

/** Subscriptions are collected by hand in v1: the owner records what was received. */
export function SubscriptionPaymentCard({ tenant }: { tenant: TTenantDetail }) {
  const { t, tv, lang } = useT();
  const banglaDigits = useAppSelector((s) => s.ui.banglaDigits);
  const fmt = { lang, banglaDigits } as const;
  const plans = useGetPlatformPlansQuery();
  const [record, { isLoading }] = useRecordSubscriptionPaymentMutation();

  const today = todayLocal();
  const { register, control, handleSubmit, reset, formState: { errors } } = useForm<TSubscriptionPaymentForm>({
    resolver: zodResolver(subscriptionPaymentSchema),
    mode: "onTouched",
    defaultValues: { planId: tenant.planId, method: "bkash_manual", reference: "", periodStart: today, periodEnd: addDays(today, 30) },
  });

  const onSubmit = handleSubmit(async (v) => {
    try {
      await record({ id: tenant.id, data: v }).unwrap();
      toast.success(t("pf.pay.saved"));
      reset({ planId: v.planId, method: v.method, reference: "", periodStart: v.periodEnd, periodEnd: addDays(v.periodEnd, 30) });
    } catch (err) {
      toast.error(getApiErrorMessage(err, t));
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("pf.pay.title")}</CardTitle>
        <CardDescription>{t("pf.pay.activates")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <form onSubmit={onSubmit} noValidate className="grid gap-4 sm:grid-cols-2">
          <FormField label={t("pf.pay.plan")} error={tv(errors.planId?.message)}>
            {(c) => (
              <Select {...c} {...register("planId")}>
                {(plans.data ?? []).map((p) => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </Select>
            )}
          </FormField>
          <FormField label={t("pf.pay.amount")} error={tv(errors.amount?.message)}>
            {(c) => (
              <Controller
                control={control}
                name="amount"
                render={({ field }) => (
                  <MoneyInput {...c} value={Number.isFinite(field.value) ? field.value : null} onChange={(v) => field.onChange(v ?? undefined)} />
                )}
              />
            )}
          </FormField>
          <FormField label={t("pf.pay.method")}>
            {(c) => (
              <Select {...c} {...register("method")}>
                {METHODS.map((m) => (
                  <option key={m} value={m}>{t(`pf.pay.method.${m}`)}</option>
                ))}
              </Select>
            )}
          </FormField>
          <FormField label={t("pf.pay.reference")} error={tv(errors.reference?.message)}>
            {(c) => <Input {...c} {...register("reference")} />}
          </FormField>
          <FormField label={t("pf.pay.from")} error={tv(errors.periodStart?.message)}>
            {(c) => (
              <Controller control={control} name="periodStart" render={({ field }) => <DatePicker {...c} value={field.value} onChange={field.onChange} />} />
            )}
          </FormField>
          <FormField label={t("pf.pay.to")} error={tv(errors.periodEnd?.message)}>
            {(c) => (
              <Controller control={control} name="periodEnd" render={({ field }) => <DatePicker {...c} value={field.value} onChange={field.onChange} />} />
            )}
          </FormField>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
              {t("pf.pay.save")}
            </Button>
          </div>
        </form>

        <div>
          <h3 className="mb-2 text-sm font-semibold text-navy">{t("pf.pay.history")}</h3>
          {tenant.subscriptionPayments.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("pf.pay.none")}</p>
          ) : (
            <ul className="divide-y divide-border text-sm">
              {tenant.subscriptionPayments.map((p) => (
                <li key={p._id} className="flex items-center justify-between gap-3 py-2">
                  <span className="min-w-0">
                    <span className="tabular block font-semibold">{formatMoney(p.amount, fmt)}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {t(`pf.pay.method.${p.method}`)} · {p.reference}
                    </span>
                  </span>
                  <span className="tabular shrink-0 text-xs text-muted-foreground">
                    {formatLocalDate(isoToLocalDate(p.periodStart), fmt)} – {formatLocalDate(isoToLocalDate(p.periodEnd), fmt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
