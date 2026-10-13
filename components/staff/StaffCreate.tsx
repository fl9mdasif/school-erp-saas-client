"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { CopyField } from "@/components/common/CopyField";
import { FormField } from "@/components/common/FormField";
import { PageHeader } from "@/components/common/PageHeader";
import { PhoneInput } from "@/components/common/PhoneInput";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { getApiErrorMessage } from "@/lib/errors";
import { normalizeBdPhone } from "@/lib/format";
import { useT } from "@/lib/i18n/useT";
import { useCreateStaffMutation } from "@/redux/api/staffApi";
import type { TStaffCreated } from "@/types";
import { staffCreateSchema, type TStaffCreateForm } from "@/utils/schemas/staff";

export function StaffCreate() {
  const { t, tv, term } = useT();
  const [create, { isLoading }] = useCreateStaffMutation();
  const [created, setCreated] = useState<TStaffCreated | null>(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<TStaffCreateForm>({
    resolver: zodResolver(staffCreateSchema),
    mode: "onTouched",
    defaultValues: { role: "teacher", name: "", email: "", phone: "", password: "" },
  });

  const onSubmit = handleSubmit(async (v) => {
    try {
      const res = await create({
        role: v.role,
        name: v.name,
        email: v.email || undefined,
        phone: v.phone ? normalizeBdPhone(v.phone) ?? v.phone : undefined,
        password: v.password || undefined,
      }).unwrap();
      setCreated(res);
      reset();
    } catch (err) {
      toast.error(getApiErrorMessage(err, t));
    }
  });

  return (
    <>
      <Link href="/dashboard/staff" className="mb-3 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-primary hover:underline">
        <ArrowLeft className="size-4" aria-hidden="true" />
        {t("st.back")}
      </Link>
      <PageHeader title={t("st.add")} description={t("st.createDesc")} />

      {created ? (
        <Card className="mb-4 max-w-xl border-success">
          <CardContent className="space-y-3 pt-5">
            <p className="font-semibold text-navy">{t("st.created", { name: created.user.name })}</p>
            <CopyField label={t("st.tempPassword")} value={created.temporaryPassword} />
            <p className="text-sm text-warning-deep">{t("st.tempOnce")}</p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => setCreated(null)}>
                {t("st.addAnother")}
              </Button>
              <Button asChild>
                <Link href="/dashboard/staff">{t("st.done")}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="max-w-xl">
          <CardContent className="pt-5">
            <form onSubmit={onSubmit} noValidate className="grid gap-4">
              <FormField label={t("st.col.role")}>
                {(c) => (
                  <Select {...c} {...register("role")}>
                    {(["teacher", "accountant", "admin"] as const).map((r) => (
                      <option key={r} value={r}>{t(`st.role.${r}`, { teacher: term("teacher") })}</option>
                    ))}
                  </Select>
                )}
              </FormField>
              <FormField label={t("st.col.name")} required error={tv(errors.name?.message)}>
                {(c) => <Input autoComplete="off" {...c} {...register("name")} />}
              </FormField>
              <FormField label={t("st.email")} error={tv(errors.email?.message)}>
                {(c) => <Input type="email" autoComplete="off" {...c} {...register("email")} />}
              </FormField>
              <FormField label={t("st.phone")} error={tv(errors.phone?.message)}>
                {(c) => <PhoneInput {...c} {...register("phone")} />}
              </FormField>
              <FormField label={t("st.password")} hint={t("st.passwordHint")} error={tv(errors.password?.message)}>
                {(c) => <Input autoComplete="new-password" {...c} {...register("password")} />}
              </FormField>
              <div>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
                  {t("st.create")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </>
  );
}
