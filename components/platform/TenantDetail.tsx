"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { ErrorState } from "@/components/common/ErrorState";
import { FormField } from "@/components/common/FormField";
import { PageHeader } from "@/components/common/PageHeader";
import { ReasonDialog } from "@/components/common/ReasonDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select } from "@/components/ui/select";
import { formatLocalDate, formatMoney, formatNumber, isoToLocalDate } from "@/lib/format";
import { getApiErrorMessage } from "@/lib/errors";
import { useT } from "@/lib/i18n/useT";
import {
  useChangeTenantSlugMutation,
  useGetPlatformPlansQuery,
  useGetTenantDetailQuery,
  useSetTenantPlanMutation,
  useSetTenantStatusMutation,
} from "@/redux/api/platformApi";
import { useAppSelector } from "@/redux/hooks";
import type { TTenantDetail } from "@/types";
import { planChangeSchema, slugChangeSchema, type TPlanChangeForm, type TSlugChangeForm } from "@/utils/schemas/platform";
import { SubscriptionPaymentCard } from "./SubscriptionPaymentCard";
import { TenantStatusChip } from "./TenantStatusChip";

type Action = "suspend" | "reactivate" | "cancel";
const STATUS_FOR: Record<Action, "suspended" | "active" | "cancelled"> = { suspend: "suspended", reactivate: "active", cancel: "cancelled" };

export function TenantDetail({ id }: { id: string }) {
  const { t, lang } = useT();
  const banglaDigits = useAppSelector((s) => s.ui.banglaDigits);
  const fmt = { lang, banglaDigits } as const;
  const { data: tenant, isLoading, error, refetch } = useGetTenantDetailQuery(id);

  if (error) return <ErrorState error={error} onRetry={refetch} />;
  if (isLoading || !tenant) {
    return (
      <div className="space-y-4" role="status" aria-label={t("common.loading")}>
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const students = tenant.usage.students ?? 0;
  const pct = tenant.studentCap ? (students / tenant.studentCap) * 100 : 0;
  const graceExpired = tenant.status === "trial" && tenant.effectiveStatus === "suspended";

  return (
    <>
      <Link href="/platform/tenants" className="mb-3 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-primary hover:underline">
        <ArrowLeft className="size-4" aria-hidden="true" />
        {t("pf.detail.back")}
      </Link>

      <PageHeader
        title={tenant.name}
        description={`${t(`pf.type.${tenant.institutionType}`)} · ${t("pf.detail.address", { slug: tenant.slug })}`}
        action={<StatusActions tenant={tenant} />}
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <TenantStatusChip status={tenant.effectiveStatus} />
        {graceExpired ? <p className="text-sm text-warning-deep">{t("pf.detail.graceNote")}</p> : null}
        <p className="tabular text-sm text-muted-foreground">
          {t("pf.tenants.col.trial")}: {formatLocalDate(isoToLocalDate(tenant.trialEndsAt), fmt)}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>{t("pf.detail.usage")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span>{t("pf.detail.students")}</span>
                <span className="tabular font-semibold">
                  {formatNumber(students, fmt)} / {formatNumber(tenant.studentCap, fmt)}
                </span>
              </div>
              <Progress value={pct} label={t("pf.detail.students")} />
            </div>
            <p className="flex justify-between text-sm">
              <span>{t("pf.detail.staff")}</span>
              <span className="tabular font-semibold">{formatNumber(tenant.usage.staff, fmt)}</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("pf.detail.plan")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            {tenant.plan ? (
              <>
                <p className="text-lg font-semibold text-navy">{tenant.plan.name}</p>
                <p className="tabular text-muted-foreground">{formatMoney(tenant.plan.priceMonthly, fmt)} {t("mk.pricing.perMonth")}</p>
              </>
            ) : (
              <p className="text-muted-foreground">{t("pf.detail.noPlan")}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("pf.detail.contact")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p className="tabular">{tenant.contact.phone}</p>
            {tenant.contact.email ? <p className="break-all">{tenant.contact.email}</p> : null}
            {tenant.contact.district ? <p className="text-muted-foreground">{tenant.contact.district}</p> : null}
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <PlanCard tenant={tenant} />
        <SubscriptionPaymentCard tenant={tenant} />
      </div>
      <div className="mt-4">
        <SlugCard tenant={tenant} />
      </div>
    </>
  );
}

function StatusActions({ tenant }: { tenant: TTenantDetail }) {
  const { t } = useT();
  const [action, setAction] = useState<Action | null>(null);
  const [setStatus, { isLoading }] = useSetTenantStatusMutation();
  const current = tenant.status;

  const submit = async (reason: string) => {
    if (!action) return;
    try {
      await setStatus({ id: tenant.id, data: { status: STATUS_FOR[action], reason } }).unwrap();
      toast.success(t("pf.action.done"));
      setAction(null);
    } catch (err) {
      toast.error(getApiErrorMessage(err, t));
    }
  };

  return (
    <>
      {current !== "suspended" && current !== "cancelled" ? (
        <Button variant="outline" onClick={() => setAction("suspend")}>{t("pf.action.suspend")}</Button>
      ) : null}
      {current === "suspended" || current === "cancelled" || tenant.effectiveStatus === "suspended" ? (
        <Button onClick={() => setAction("reactivate")}>{t("pf.action.reactivate")}</Button>
      ) : null}
      {current !== "cancelled" ? (
        <Button variant="destructive" onClick={() => setAction("cancel")}>{t("pf.action.cancel")}</Button>
      ) : null}

      {action ? (
        <ReasonDialog
          open
          onOpenChange={(o) => !o && setAction(null)}
          title={t(`pf.action.${action}.title`)}
          description={t(`pf.action.${action}.body`)}
          reasonLabel={t("pf.action.reason")}
          confirmLabel={t(`pf.action.${action}`)}
          destructive={action !== "reactivate"}
          loading={isLoading}
          onConfirm={submit}
        />
      ) : null}
    </>
  );
}

function PlanCard({ tenant }: { tenant: TTenantDetail }) {
  const { t, lang } = useT();
  const plans = useGetPlatformPlansQuery();
  const [save, { isLoading }] = useSetTenantPlanMutation();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<TPlanChangeForm>({
    resolver: zodResolver(planChangeSchema),
    defaultValues: { planId: "", studentCap: "", extendTrialDays: "" },
  });
  void lang;

  const onSubmit = handleSubmit(async (v) => {
    const data = {
      ...(v.planId ? { planId: v.planId } : {}),
      ...(v.studentCap ? { studentCap: Number(v.studentCap) } : {}),
      ...(v.extendTrialDays ? { extendTrialDays: Number(v.extendTrialDays) } : {}),
    };
    if (Object.keys(data).length === 0) return;
    try {
      await save({ id: tenant.id, data }).unwrap();
      toast.success(t("pf.plan.saved"));
      reset();
    } catch (err) {
      toast.error(getApiErrorMessage(err, t));
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("pf.plan.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} noValidate className="space-y-4">
          <FormField label={t("pf.plan.select")}>
            {(c) => (
              <Select {...c} {...register("planId")}>
                <option value="">{t("pf.plan.keep")}</option>
                {(plans.data ?? []).map((p) => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </Select>
            )}
          </FormField>
          <FormField label={t("pf.plan.cap")} hint={t("pf.plan.capHint")} error={errors.studentCap && t("val.positive")}>
            {(c) => <Input inputMode="numeric" {...c} {...register("studentCap")} />}
          </FormField>
          <FormField label={t("pf.plan.extend")} error={errors.extendTrialDays && t("val.positive")}>
            {(c) => <Input inputMode="numeric" {...c} {...register("extendTrialDays")} />}
          </FormField>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
            {t("pf.plan.save")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function SlugCard({ tenant }: { tenant: TTenantDetail }) {
  const { t, tv } = useT();
  const [save, { isLoading }] = useChangeTenantSlugMutation();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<TSlugChangeForm>({
    resolver: zodResolver(slugChangeSchema),
    defaultValues: { slug: "", reason: "" },
  });

  const onSubmit = handleSubmit(async (v) => {
    try {
      await save({ id: tenant.id, data: v }).unwrap();
      toast.success(t("pf.slug.saved"));
      reset();
    } catch (err) {
      toast.error(getApiErrorMessage(err, t));
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("pf.slug.title")}</CardTitle>
        <CardDescription>{t("pf.slug.body")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} noValidate className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
          <FormField label={t("pf.slug.new")} error={tv(errors.slug?.message)}>
            {(c) => <Input autoCapitalize="none" spellCheck={false} {...c} {...register("slug")} />}
          </FormField>
          <FormField label={t("pf.slug.reason")} error={tv(errors.reason?.message)}>
            {(c) => <Input {...c} {...register("reason")} />}
          </FormField>
          <Button type="submit" variant="outline" disabled={isLoading}>{t("pf.slug.save")}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
