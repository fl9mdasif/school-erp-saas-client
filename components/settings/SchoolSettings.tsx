"use client";

import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { ErrorState } from "@/components/common/ErrorState";
import { FormField } from "@/components/common/FormField";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusChip } from "@/components/common/StatusChip";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getApiErrorMessage } from "@/lib/errors";
import { formatLocalDate, isoToLocalDate } from "@/lib/format";
import { useT } from "@/lib/i18n/useT";
import { PhoneInput } from "@/components/common/PhoneInput";
import {
  useGetSchoolProfileQuery,
  useGetSchoolUsageQuery,
  useUpdateSchoolProfileMutation,
  useUpdateSchoolSettingsMutation,
} from "@/redux/api/settingsApi";
import { useAppSelector } from "@/redux/hooks";
import { ImageUploader } from "@/services/ImageUploader";

const WEEKDAYS = [
  { v: 0, l: "Sun" }, { v: 1, l: "Mon" }, { v: 2, l: "Tue" }, { v: 3, l: "Wed" }, { v: 4, l: "Thu" }, { v: 5, l: "Fri" }, { v: 6, l: "Sat" },
];

export function SchoolSettings() {
  const { t } = useT();
  const { data: profile, isLoading, error, refetch } = useGetSchoolProfileQuery();

  if (isLoading) return <Skeleton className="h-96 w-full max-w-3xl" />;
  if (error || !profile) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <>
      <PageHeader title={t("set.title")} description={t("set.desc")} />
      {profile.status === "suspended" ? (
        <p className="mb-4 max-w-2xl rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{t("set.suspended")}</p>
      ) : null}
      <Tabs defaultValue="profile">
        <TabsList aria-label={t("set.title")}>
          <TabsTrigger value="profile">{t("set.tab.profile")}</TabsTrigger>
          <TabsTrigger value="preferences">{t("set.tab.preferences")}</TabsTrigger>
          <TabsTrigger value="terminology">{t("set.tab.terminology")}</TabsTrigger>
          <TabsTrigger value="plan">{t("set.tab.plan")}</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <ProfileTab profile={profile} />
        </TabsContent>
        <TabsContent value="preferences">
          <PreferencesTab profile={profile} />
        </TabsContent>
        <TabsContent value="terminology">
          <TerminologyTab />
        </TabsContent>
        <TabsContent value="plan">
          <PlanTab />
        </TabsContent>
      </Tabs>
    </>
  );
}

function ProfileTab({ profile }: { profile: NonNullable<ReturnType<typeof useGetSchoolProfileQuery>["data"]> }) {
  const { t } = useT();
  const [update, updating] = useUpdateSchoolProfileMutation();
  const { register, watch, setValue, handleSubmit } = useForm({
    defaultValues: {
      name: profile.name,
      nameBn: profile.nameBn ?? "",
      logoUrl: profile.logoUrl ?? "",
      eiin: profile.eiin ?? "",
      phone: profile.contact?.phone ?? "",
      email: profile.contact?.email ?? "",
      address: profile.contact?.address ?? "",
      district: profile.contact?.district ?? "",
      upazila: profile.contact?.upazila ?? "",
    },
  });
  const logoUrl = watch("logoUrl");

  const onSubmit = handleSubmit(async (v) => {
    try {
      await update({
        name: v.name,
        nameBn: v.nameBn || undefined,
        logoUrl: v.logoUrl || undefined,
        eiin: v.eiin || undefined,
        contact: { phone: v.phone || undefined, email: v.email || undefined, address: v.address || undefined, district: v.district || undefined, upazila: v.upazila || undefined },
      }).unwrap();
      toast.success(t("set.saved"));
    } catch (err) {
      toast.error(getApiErrorMessage(err, t));
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="max-w-2xl space-y-4">
      <Card>
        <CardContent className="space-y-4 pt-5">
          <ImageUploader folder="logo" initialImageUrl={logoUrl || undefined} onUploadSuccess={(url) => setValue("logoUrl", url)} />
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label={t("set.name")}>{(c) => <Input {...c} {...register("name")} />}</FormField>
            <FormField label={t("ac.sub.nameBn")}>{(c) => <Input {...c} {...register("nameBn")} />}</FormField>
            <FormField label={t("set.eiin")}>{(c) => <Input {...c} {...register("eiin")} />}</FormField>
            <FormField label={t("web.phone")}>{(c) => <PhoneInput {...c} {...register("phone")} />}</FormField>
            <FormField label={t("web.email")}>{(c) => <Input type="email" {...c} {...register("email")} />}</FormField>
            <FormField label={t("web.address")}>{(c) => <Input {...c} {...register("address")} />}</FormField>
            <FormField label={t("set.district")}>{(c) => <Input {...c} {...register("district")} />}</FormField>
            <FormField label={t("set.upazila")}>{(c) => <Input {...c} {...register("upazila")} />}</FormField>
          </div>
        </CardContent>
      </Card>
      <Button type="submit" disabled={updating.isLoading}>
        {updating.isLoading ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
        {t("common.save")}
      </Button>
    </form>
  );
}

function PreferencesTab({ profile }: { profile: NonNullable<ReturnType<typeof useGetSchoolProfileQuery>["data"]> }) {
  const { t } = useT();
  const [update, updating] = useUpdateSchoolSettingsMutation();
  const { register, watch, setValue, handleSubmit } = useForm({
    defaultValues: {
      weekendDays: profile.settings.weekendDays,
      defaultFeeCycle: profile.settings.defaultFeeCycle,
      attendanceEditWindowHours: profile.settings.attendanceEditWindowHours ?? 24,
      resultLookupMode: profile.settings.resultLookupMode ?? "roll_dob",
    },
  });
  const weekendDays = watch("weekendDays");

  const toggleDay = (d: number) => setValue("weekendDays", weekendDays.includes(d) ? weekendDays.filter((x) => x !== d) : [...weekendDays, d]);

  const onSubmit = handleSubmit(async (v) => {
    try {
      await update(v).unwrap();
      toast.success(t("set.saved"));
    } catch (err) {
      toast.error(getApiErrorMessage(err, t));
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="max-w-xl space-y-4">
      <Card>
        <CardContent className="space-y-4 pt-5">
          <div>
            <p className="mb-2 text-sm font-medium">{t("set.weekends")}</p>
            <div className="flex flex-wrap gap-2">
              {WEEKDAYS.map((d) => (
                <button
                  key={d.v}
                  type="button"
                  onClick={() => toggleDay(d.v)}
                  className={`rounded-md border px-3 py-1.5 text-sm ${weekendDays.includes(d.v) ? "border-primary bg-primary-tint text-primary-deep" : "border-input"}`}
                >
                  {d.l}
                </button>
              ))}
            </div>
          </div>
          <FormField label={t("set.defaultFeeCycle")}>
            {(c) => (
              <Select {...c} {...register("defaultFeeCycle")}>
                <option value="monthly">{t("fee.cycle.monthly")}</option>
                <option value="term">{t("fee.cycle.term")}</option>
                <option value="yearly">{t("fee.cycle.yearly")}</option>
                <option value="one_time">{t("fee.cycle.one_time")}</option>
              </Select>
            )}
          </FormField>
          <FormField label={t("set.editWindow")}>
            {(c) => <Input type="number" min={0} max={720} {...c} {...register("attendanceEditWindowHours", { valueAsNumber: true })} />}
          </FormField>
          <FormField label={t("set.lookupMode")}>
            {(c) => (
              <Select {...c} {...register("resultLookupMode")}>
                <option value="roll_dob">{t("set.lookupMode.roll_dob")}</option>
                <option value="roll_only">{t("set.lookupMode.roll_only")}</option>
                <option value="student_id_dob">{t("set.lookupMode.student_id_dob")}</option>
              </Select>
            )}
          </FormField>
        </CardContent>
      </Card>
      <Button type="submit" disabled={updating.isLoading}>
        {updating.isLoading ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
        {t("common.save")}
      </Button>
    </form>
  );
}

function TerminologyTab() {
  const { t } = useT();
  const terminology = useAppSelector((s) => s.auth.tenant?.terminology) ?? {};
  const entries = Object.entries(terminology);

  return (
    <Card className="max-w-md">
      <CardContent className="pt-5">
        <p className="mb-3 text-sm text-muted-foreground">{t("set.terminologyDesc")}</p>
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("set.terminologyNone")}</p>
        ) : (
          <table className="w-full text-sm">
            <tbody>
              {entries.map(([key, v]) => (
                <tr key={key} className="border-b border-border/60">
                  <td className="py-2 capitalize text-muted-foreground">{key}</td>
                  <td className="py-2">{v.en}</td>
                  <td className="py-2">{v.bn}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  );
}

function PlanTab() {
  const { t, lang, banglaDigits } = useT();
  const fmt = { lang, banglaDigits } as const;
  const { data: usage, isLoading, error, refetch } = useGetSchoolUsageQuery();

  if (isLoading) return <Skeleton className="h-48 w-full max-w-md" />;
  if (error || !usage) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <Card className="max-w-md">
      <CardContent className="space-y-3 pt-5">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-navy">{usage.plan?.name ?? t("set.noPlan")}</p>
          <StatusChip tone={usage.status === "active" || usage.status === "trial" ? "success" : "destructive"}>{t(`pf.status.${usage.status}`)}</StatusChip>
        </div>
        <p className="text-sm text-muted-foreground">
          {t("set.students")}: {usage.students} / {usage.studentCap}
        </p>
        <p className="text-sm text-muted-foreground">{t("set.staff")}: {usage.staff}</p>
        {usage.trialEndsAt ? <p className="text-sm text-muted-foreground">{t("set.trialEnds")}: {formatLocalDate(isoToLocalDate(usage.trialEndsAt), fmt)}</p> : null}
      </CardContent>
    </Card>
  );
}
