"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import toast from "react-hot-toast";
import { ErrorState } from "@/components/common/ErrorState";
import { FileUpload } from "@/components/common/FileUpload";
import { FormField } from "@/components/common/FormField";
import { PageHeader } from "@/components/common/PageHeader";
import { RichEditor } from "@/components/common/RichEditor";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { getApiErrorMessage } from "@/lib/errors";
import { useT } from "@/lib/i18n/useT";
import { useGetClassesQuery, useGetSectionsQuery } from "@/redux/api/academicApi";
import { useCreateNoticeMutation, useGetNoticeQuery, useUpdateNoticeMutation } from "@/redux/api/communicationApi";
import { useAppSelector } from "@/redux/hooks";
import { noticeSchema, type TNoticeForm } from "@/utils/schemas/notice";

const pad = (n: number) => String(n).padStart(2, "0");
/** ISO instant to the value a datetime-local input expects, in the browser's local time. */
const toLocalInput = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
const toIso = (local: string) => (local ? new Date(local).toISOString() : undefined);

const EMPTY: TNoticeForm = {
  title: "",
  body: "",
  audienceType: "all",
  classIds: [],
  sectionIds: [],
  isPublic: false,
  status: "published",
  publishAt: "",
  expiresAt: "",
  attachments: [],
};

export function NoticeForm({ noticeId }: { noticeId?: string }) {
  const { t, tv, term } = useT();
  const router = useRouter();
  const role = useAppSelector((s) => s.auth.user?.role);
  const isTeacher = role === "teacher";
  const existing = useGetNoticeQuery(noticeId ?? "", { skip: !noticeId });
  const classes = useGetClassesQuery();
  const sections = useGetSectionsQuery();
  const [create, creating] = useCreateNoticeMutation();
  const [update, updating] = useUpdateNoticeMutation();

  const n = existing.data;
  const { register, control, handleSubmit, setValue, formState: { errors } } = useForm<TNoticeForm>({
    resolver: zodResolver(noticeSchema),
    mode: "onTouched",
    defaultValues: isTeacher ? { ...EMPTY, audienceType: "class" } : EMPTY,
    values: n
      ? {
          title: n.title,
          body: n.body,
          audienceType: n.audience.type,
          classIds: n.audience.classIds,
          sectionIds: n.audience.sectionIds,
          isPublic: n.isPublic,
          status: n.status,
          publishAt: toLocalInput(n.publishAt),
          expiresAt: toLocalInput(n.expiresAt),
          attachments: n.attachments,
        }
      : undefined,
  });
  const audienceType = useWatch({ control, name: "audienceType" });
  const attachments = useWatch({ control, name: "attachments" });

  const onSubmit = handleSubmit(async (v) => {
    const data = {
      title: v.title,
      body: v.body,
      audience: {
        type: v.audienceType,
        classIds: v.audienceType === "class" ? v.classIds : [],
        sectionIds: v.audienceType === "section" ? v.sectionIds : [],
      },
      isPublic: isTeacher ? false : v.isPublic,
      status: v.status,
      attachments: v.attachments,
      publishAt: toIso(v.publishAt),
      expiresAt: toIso(v.expiresAt),
    };
    try {
      if (noticeId) await update({ id: noticeId, data }).unwrap();
      else await create(data).unwrap();
      toast.success(t("not.form.saved"));
      router.push("/dashboard/notices");
    } catch (err) {
      toast.error(getApiErrorMessage(err, t));
    }
  });

  if (noticeId && existing.error) return <ErrorState error={existing.error} onRetry={existing.refetch} />;
  if (noticeId && existing.isLoading) return <Skeleton className="h-96 w-full max-w-3xl" />;

  const audiences = isTeacher ? (["class", "section"] as const) : (["all", "staff", "students_guardians", "class", "section"] as const);
  const toggle = (name: "classIds" | "sectionIds", list: string[], id: string) =>
    setValue(name, list.includes(id) ? list.filter((x) => x !== id) : [...list, id], { shouldValidate: true });

  return (
    <>
      <Link href="/dashboard/notices" className="mb-3 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-primary hover:underline">
        <ArrowLeft className="size-4" aria-hidden="true" />
        {t("not.title")}
      </Link>
      <PageHeader title={noticeId ? t("not.form.edit") : t("not.add")} />

      <form onSubmit={onSubmit} noValidate className="max-w-3xl">
        <Card>
          <CardContent className="grid gap-4 pt-5">
            <FormField label={t("not.form.title")} required error={tv(errors.title?.message)}>
              {(c) => <Input {...c} {...register("title")} />}
            </FormField>

            <FormField label={t("not.form.body")} required error={tv(errors.body?.message)}>
              {(c) => (
                <Controller
                  control={control}
                  name="body"
                  render={({ field }) => <RichEditor key={n?._id ?? "new"} id={c.id} initialHtml={field.value} onChange={field.onChange} aria-invalid={c["aria-invalid"]} aria-describedby={c["aria-describedby"]} />}
                />
              )}
            </FormField>

            <FormField label={t("not.form.audience")}>
              {(c) => (
                <Select {...c} {...register("audienceType")}>
                  {audiences.map((a) => (
                    <option key={a} value={a}>{t(`not.aud.${a}`)}</option>
                  ))}
                </Select>
              )}
            </FormField>

            {audienceType === "class" ? (
              <fieldset>
                <legend className="mb-1 text-sm font-medium">{term("class")}</legend>
                <Controller
                  control={control}
                  name="classIds"
                  render={({ field }) => (
                    <div className="grid gap-1 sm:grid-cols-3">
                      {(classes.data?.rows ?? []).map((c) => (
                        <label key={c._id} className="flex min-h-11 items-center gap-3 text-sm">
                          <input type="checkbox" className="size-5 accent-primary" checked={field.value.includes(c._id)} onChange={() => toggle("classIds", field.value, c._id)} />
                          {c.name}
                        </label>
                      ))}
                    </div>
                  )}
                />
                {errors.classIds ? <p role="alert" className="mt-1 text-sm text-destructive">{tv(errors.classIds.message)}</p> : null}
              </fieldset>
            ) : null}

            {audienceType === "section" ? (
              <fieldset>
                <legend className="mb-1 text-sm font-medium">{term("section")}</legend>
                <Controller
                  control={control}
                  name="sectionIds"
                  render={({ field }) => (
                    <div className="grid gap-1 sm:grid-cols-3">
                      {(sections.data?.rows ?? []).map((s) => (
                        <label key={s._id} className="flex min-h-11 items-center gap-3 text-sm">
                          <input type="checkbox" className="size-5 accent-primary" checked={field.value.includes(s._id)} onChange={() => toggle("sectionIds", field.value, s._id)} />
                          {(classes.data?.rows.find((k) => k._id === s.classId)?.name ?? "") + " · " + s.name}
                        </label>
                      ))}
                    </div>
                  )}
                />
                {errors.sectionIds ? <p role="alert" className="mt-1 text-sm text-destructive">{tv(errors.sectionIds.message)}</p> : null}
              </fieldset>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-3">
              <FormField label={t("not.form.status")}>
                {(c) => (
                  <Select {...c} {...register("status")}>
                    <option value="published">{t("not.status.published")}</option>
                    <option value="draft">{t("not.status.draft")}</option>
                  </Select>
                )}
              </FormField>
              <FormField label={t("not.form.publishAt")} hint={t("not.form.publishHint")}>
                {(c) => <Input type="datetime-local" {...c} {...register("publishAt")} />}
              </FormField>
              <FormField label={t("not.form.expiresAt")} error={tv(errors.expiresAt?.message)}>
                {(c) => <Input type="datetime-local" {...c} {...register("expiresAt")} />}
              </FormField>
            </div>

            {isTeacher ? null : (
              <label className="flex min-h-11 items-start gap-3 text-sm">
                <input type="checkbox" className="mt-1 size-5 accent-primary" {...register("isPublic")} />
                <span>
                  <span className="font-medium">{t("not.form.public")}</span>
                  <span className="block text-xs text-muted-foreground">{t("not.form.publicHint")}</span>
                </span>
              </label>
            )}

            <div className="space-y-2">
              <p className="text-sm font-medium">{t("not.form.attachments")}</p>
              {attachments.map((a, i) => (
                <FileUpload
                  key={a.url}
                  current={a}
                  onUploaded={() => undefined}
                  onRemove={() => setValue("attachments", attachments.filter((_, j) => j !== i))}
                />
              ))}
              {attachments.length < 5 ? (
                <FileUpload key={attachments.length} onUploaded={(f) => setValue("attachments", [...attachments, f])} />
              ) : null}
            </div>

            <div>
              <Button type="submit" disabled={creating.isLoading || updating.isLoading}>
                {creating.isLoading || updating.isLoading ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
                {t("common.save")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </>
  );
}
