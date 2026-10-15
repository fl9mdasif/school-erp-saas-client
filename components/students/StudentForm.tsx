"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import toast from "react-hot-toast";
import { DatePicker } from "@/components/common/DatePicker";
import { ErrorState } from "@/components/common/ErrorState";
import { FormField } from "@/components/common/FormField";
import { PageHeader } from "@/components/common/PageHeader";
import { PhoneInput } from "@/components/common/PhoneInput";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploader } from "@/services/ImageUploader";
import { getApiCode, getApiErrorMessage } from "@/lib/errors";
import { formatNumber, normalizeBdPhone } from "@/lib/format";
import { useT } from "@/lib/i18n/useT";
import { useGetClassesQuery, useGetSectionsQuery } from "@/redux/api/academicApi";
import { useGetDashboardSummaryQuery } from "@/redux/api/dashboardApi";
import { useCreateStudentMutation, useGetStudentQuery, useUpdateStudentMutation } from "@/redux/api/studentApi";
import { useAppSelector } from "@/redux/hooks";
import { studentCreateSchema, type TStudentCreateForm } from "@/utils/schemas/student";

const EMPTY: TStudentCreateForm = {
  name: "",
  nameBn: "",
  gender: "male",
  dob: "",
  admissionNo: "",
  religion: "",
  address: "",
  admittedOn: "",
  photoUrl: "",
  classId: "",
  sectionId: "",
  roll: "",
  guardians: [{ name: "", phone: "", relation: "father" }],
};

/** One form for both adding and editing. When editing, the enrolment and guardians are managed on the detail page. */
export function StudentForm({ studentId }: { studentId?: string }) {
  const { t, tv, term, lang } = useT();
  const router = useRouter();
  const banglaDigits = useAppSelector((s) => s.ui.banglaDigits);
  const fmt = { lang, banglaDigits } as const;
  const cap = useAppSelector((s) => s.auth.tenant?.plan?.studentCap);
  const summary = useGetDashboardSummaryQuery();
  const classes = useGetClassesQuery();
  const sections = useGetSectionsQuery();
  const existing = useGetStudentQuery(studentId ?? "", { skip: !studentId });
  const [create, creating] = useCreateStudentMutation();
  const [update, updating] = useUpdateStudentMutation();
  const editing = !!studentId;

  const { register, control, handleSubmit, setValue, formState: { errors } } = useForm<TStudentCreateForm>({
    resolver: zodResolver(studentCreateSchema),
    mode: "onTouched",
    values: editing && existing.data
      ? {
          ...EMPTY,
          name: existing.data.name,
          nameBn: existing.data.nameBn ?? "",
          gender: existing.data.gender,
          dob: existing.data.dob,
          admissionNo: existing.data.admissionNo ?? "",
          religion: existing.data.religion ?? "",
          address: existing.data.address ?? "",
          admittedOn: existing.data.admittedOn,
          photoUrl: existing.data.photoUrl ?? "",
          classId: "edit",
          guardians: [],
        }
      : undefined,
    defaultValues: EMPTY,
  });
  const { fields, append, remove } = useFieldArray({ control, name: "guardians" });
  const classId = useWatch({ control, name: "classId" });
  const photoUrl = useWatch({ control, name: "photoUrl" });

  const active = summary.data?.role === "admin" ? summary.data.students : 0;
  const atCap = !editing && !!cap && active >= cap;
  const nearCap = !editing && !!cap && !atCap && active >= cap * 0.9;
  const sectionOptions = (sections.data?.rows ?? []).filter((s) => s.classId === classId);

  const onSubmit = handleSubmit(async (v) => {
    const profile = {
      name: v.name,
      nameBn: v.nameBn || undefined,
      gender: v.gender,
      dob: v.dob,
      admissionNo: v.admissionNo || undefined,
      religion: v.religion || undefined,
      address: v.address || undefined,
      admittedOn: v.admittedOn || undefined,
      photoUrl: v.photoUrl || undefined,
    };
    try {
      if (studentId) {
        await update({ id: studentId, data: profile }).unwrap();
        toast.success(t("stu.form.saved"));
        router.push(`/dashboard/students/${studentId}`);
      } else {
        const res = await create({
          ...profile,
          enrolment: { classId: v.classId, sectionId: v.sectionId || undefined, roll: v.roll ? Number(v.roll) : undefined },
          guardians: v.guardians.map((g) => ({ ...g, phone: normalizeBdPhone(g.phone) ?? g.phone })),
        }).unwrap();
        toast.success(t("stu.form.created", { id: res.studentId }));
        router.push(`/dashboard/students/${res._id}`);
      }
    } catch (err) {
      toast.error(getApiCode(err) === "PLAN_LIMIT_REACHED" ? t("stu.form.capReached") : getApiErrorMessage(err, t));
    }
  });

  if (editing && existing.error) return <ErrorState error={existing.error} onRetry={existing.refetch} />;

  return (
    <>
      <Link href={studentId ? `/dashboard/students/${studentId}` : "/dashboard/students"} className="mb-3 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-primary hover:underline">
        <ArrowLeft className="size-4" aria-hidden="true" />
        {t("stu.form.back", { student: term("student") })}
      </Link>
      <PageHeader title={editing ? t("stu.form.edit", { student: term("student") }) : t("stu.add", { student: term("student") })} />

      {atCap ? (
        <p role="alert" className="mb-4 rounded-lg border border-destructive bg-destructive-tint p-3 text-sm text-destructive-deep">
          {t("stu.form.capReached")}
        </p>
      ) : nearCap ? (
        <p className="mb-4 rounded-lg border border-warning bg-warning-tint p-3 text-sm text-warning-deep">
          {t("stu.form.capNear", { active: formatNumber(active, fmt), cap: formatNumber(cap!, fmt) })}
        </p>
      ) : null}

      <form onSubmit={onSubmit} noValidate className="grid max-w-3xl gap-4">
        <Card>
          <CardHeader>
            <CardTitle>{t("stu.form.profile")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <FormField label={t("stu.form.name")} required error={tv(errors.name?.message)}>
              {(c) => <Input {...c} {...register("name")} />}
            </FormField>
            <FormField label={t("stu.form.nameBn")}>
              {(c) => <Input {...c} {...register("nameBn")} />}
            </FormField>
            <FormField label={t("stu.form.gender")}>
              {(c) => (
                <Select {...c} {...register("gender")}>
                  <option value="male">{t("stu.form.gender.male")}</option>
                  <option value="female">{t("stu.form.gender.female")}</option>
                  <option value="other">{t("stu.form.gender.other")}</option>
                </Select>
              )}
            </FormField>
            <FormField label={t("stu.form.dob")} required error={tv(errors.dob?.message)}>
              {(c) => <Controller control={control} name="dob" render={({ field }) => <DatePicker {...c} max={new Date().toISOString().slice(0, 10)} value={field.value} onChange={field.onChange} />} />}
            </FormField>
            <FormField label={t("stu.form.admissionNo")}>
              {(c) => <Input {...c} {...register("admissionNo")} />}
            </FormField>
            <FormField label={t("stu.form.religion")}>
              {(c) => <Input {...c} {...register("religion")} />}
            </FormField>
            <FormField className="sm:col-span-2" label={t("stu.form.address")}>
              {(c) => <Textarea rows={2} {...c} {...register("address")} />}
            </FormField>
            <div className="sm:col-span-2">
              <p className="mb-1.5 text-sm font-medium">{t("stu.form.photo")}</p>
              <ImageUploader folder="photos" initialImageUrl={photoUrl || undefined} onUploadSuccess={(url) => setValue("photoUrl", url)} />
            </div>
          </CardContent>
        </Card>

        {editing ? null : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>{t("stu.form.enrolment")}</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-3">
                <FormField label={term("class")} required error={tv(errors.classId?.message)}>
                  {(c) => (
                    <Select {...c} {...register("classId", { onChange: () => setValue("sectionId", "") })}>
                      <option value="">{t("stu.form.pick")}</option>
                      {(classes.data?.rows ?? []).map((k) => (
                        <option key={k._id} value={k._id}>{k.name}</option>
                      ))}
                    </Select>
                  )}
                </FormField>
                <FormField label={term("section")}>
                  {(c) => (
                    <Select {...c} {...register("sectionId")} disabled={!sectionOptions.length}>
                      <option value="">{t("stu.form.noSection")}</option>
                      {sectionOptions.map((s) => (
                        <option key={s._id} value={s._id}>{s.name}</option>
                      ))}
                    </Select>
                  )}
                </FormField>
                <FormField label={term("roll")} hint={t("stu.form.rollHint")} error={tv(errors.roll?.message)}>
                  {(c) => <Input inputMode="numeric" {...c} {...register("roll")} />}
                </FormField>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("stu.form.guardians")}</CardTitle>
                <p className="text-sm text-muted-foreground">{t("stu.form.guardianMatch")}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                {fields.map((f, i) => (
                  <div key={f.id} className="grid gap-3 rounded-lg border border-border p-3 sm:grid-cols-[1fr_1fr_8rem_auto] sm:items-end">
                    <FormField label={t("stu.form.gName")} error={tv(errors.guardians?.[i]?.name?.message)}>
                      {(c) => <Input {...c} {...register(`guardians.${i}.name`)} />}
                    </FormField>
                    <FormField label={t("stu.form.gPhone")} error={tv(errors.guardians?.[i]?.phone?.message)}>
                      {(c) => <PhoneInput {...c} {...register(`guardians.${i}.phone`)} />}
                    </FormField>
                    <FormField label={t("stu.form.gRelation")}>
                      {(c) => (
                        <Select {...c} {...register(`guardians.${i}.relation`)}>
                          <option value="father">{t("stu.rel.father")}</option>
                          <option value="mother">{t("stu.rel.mother")}</option>
                          <option value="other">{t("stu.rel.other")}</option>
                        </Select>
                      )}
                    </FormField>
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(i)} aria-label={t("common.delete")}>
                      <Trash2 aria-hidden="true" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" disabled={fields.length >= 4} onClick={() => append({ name: "", phone: "", relation: "mother" })}>
                  <Plus aria-hidden="true" />
                  {t("stu.form.addGuardian")}
                </Button>
              </CardContent>
            </Card>
          </>
        )}

        <div>
          <Button type="submit" disabled={creating.isLoading || updating.isLoading || atCap}>
            {creating.isLoading || updating.isLoading ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
            {t("common.save")}
          </Button>
        </div>
      </form>
    </>
  );
}
