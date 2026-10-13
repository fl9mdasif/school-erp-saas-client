"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { AuthCard } from "@/components/auth/AuthCard";
import { FormField } from "@/components/common/FormField";
import { PasswordInput } from "@/components/common/PasswordInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getApiErrorMessage } from "@/lib/errors";
import { useT } from "@/lib/i18n/useT";
import { useStartSession } from "@/lib/useStartSession";
import {
  useChangePasswordMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} from "@/redux/api/authApi";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  type TChangePasswordForm,
  type TForgotPasswordForm,
  type TResetPasswordForm,
} from "@/utils/interface";

const Submit = ({ loading, children }: { loading: boolean; children: React.ReactNode }) => (
  <Button type="submit" className="w-full" disabled={loading}>
    {loading ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
    {children}
  </Button>
);

/** Shown before anything else when the server says the password is a temporary one. */
export function ChangePasswordForm() {
  const { t, tv } = useT();
  const startSession = useStartSession();
  const [change, { isLoading }] = useChangePasswordMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TChangePasswordForm>({ resolver: zodResolver(changePasswordSchema), mode: "onTouched" });

  const onSubmit = handleSubmit(async ({ oldPassword, newPassword }) => {
    try {
      await change({ oldPassword, newPassword }).unwrap();
      toast.success(t("cp.done"));
      await startSession();
    } catch (err) {
      toast.error(getApiErrorMessage(err, t));
    }
  });

  return (
    <AuthCard title={t("cp.title")} subtitle={t("cp.body")}>
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <FormField label={t("cp.old")} required error={tv(errors.oldPassword?.message)}>
          {(c) => <PasswordInput autoComplete="current-password" {...c} {...register("oldPassword")} />}
        </FormField>
        <FormField label={t("cp.new")} required error={tv(errors.newPassword?.message)} hint={t("signup.password.hint")}>
          {(c) => <PasswordInput autoComplete="new-password" {...c} {...register("newPassword")} />}
        </FormField>
        <FormField label={t("cp.confirm")} required error={tv(errors.confirmPassword?.message)}>
          {(c) => <PasswordInput autoComplete="new-password" {...c} {...register("confirmPassword")} />}
        </FormField>
        <Submit loading={isLoading}>{t("cp.submit")}</Submit>
      </form>
    </AuthCard>
  );
}

/** Admin only. The server answers the same way whether or not the account exists. */
export function ForgotPasswordForm({ slug }: { slug: string }) {
  const { t, tv } = useT();
  const [sent, setSent] = useState(false);
  const [forgot, { isLoading }] = useForgotPasswordMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onTouched",
    defaultValues: { tenantSlug: slug, email: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await forgot({ ...values, tenantSlug: slug }).unwrap();
      setSent(true);
    } catch (err) {
      toast.error(getApiErrorMessage(err, t));
    }
  });

  return (
    <AuthCard
      title={t("fp.title")}
      subtitle={t("fp.body")}
      footer={
        <Link href={`/schools/${slug}/login`} className="font-semibold text-primary underline-offset-4 hover:underline">
          {t("login.submit")}
        </Link>
      }
    >
      {sent ? (
        <p role="status" className="rounded-lg bg-success-tint p-4 text-sm font-medium text-success-deep">
          {t("fp.sent")}
        </p>
      ) : (
        <form onSubmit={onSubmit} noValidate className="space-y-4">
          <FormField label={t("fp.school")}>{(c) => <Input value={slug} readOnly {...c} />}</FormField>
          <FormField label={t("fp.email")} required error={tv(errors.email?.message)}>
            {(c) => <Input type="email" autoComplete="email" {...c} {...register("email")} />}
          </FormField>
          <Submit loading={isLoading}>{t("fp.submit")}</Submit>
        </form>
      )}
    </AuthCard>
  );
}

/** Opened from the email link: /schools/<slug>/reset-password?token=... */
export function ResetPasswordForm({ slug, token }: { slug: string; token: string }) {
  const { t, tv } = useT();
  const router = useRouter();
  const [reset, { isLoading }] = useResetPasswordMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TResetPasswordForm>({ resolver: zodResolver(resetPasswordSchema), mode: "onTouched" });

  const onSubmit = handleSubmit(async ({ newPassword }) => {
    try {
      await reset({ tenantSlug: slug, token, newPassword }).unwrap();
      toast.success(t("reset.done"));
      router.replace(`/schools/${slug}/login`);
    } catch (err) {
      toast.error(getApiErrorMessage(err, t));
    }
  });

  return (
    <AuthCard title={t("reset.title")}>
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <FormField label={t("cp.new")} required error={tv(errors.newPassword?.message)} hint={t("signup.password.hint")}>
          {(c) => <PasswordInput autoComplete="new-password" {...c} {...register("newPassword")} />}
        </FormField>
        <FormField label={t("cp.confirm")} required error={tv(errors.confirmPassword?.message)}>
          {(c) => <PasswordInput autoComplete="new-password" {...c} {...register("confirmPassword")} />}
        </FormField>
        <Submit loading={isLoading}>{t("reset.submit")}</Submit>
      </form>
    </AuthCard>
  );
}
