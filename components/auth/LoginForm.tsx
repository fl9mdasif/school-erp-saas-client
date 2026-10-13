"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
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
import { useLoginMutation, usePlatformLoginMutation } from "@/redux/api/authApi";
import { loginSchema, platformLoginSchema, type TLoginForm, type TPlatformLoginForm } from "@/utils/interface";

/** Sign in to one school. Wrong school, wrong password and inactive user all show the same message. */
export function SchoolLoginForm({ slug }: { slug: string }) {
  const { t, tv } = useT();
  const startSession = useStartSession();
  const [login, { isLoading }] = useLoginMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TLoginForm>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
    defaultValues: { tenantSlug: slug, identifier: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await login({ ...values, tenantSlug: slug }).unwrap();
      await startSession();
    } catch (err) {
      // locked accounts and rate limits come back as a code plus a wait time and are shown as one sentence
      toast.error(getApiErrorMessage(err, t), { id: "login-error" });
    }
  });

  return (
    <AuthCard
      title={t("login.title")}
      subtitle={t("login.signingInto", { school: slug })}
      footer={
        <Link href="/login" className="font-semibold text-primary underline-offset-4 hover:underline">
          {t("login.chooseOther")}
        </Link>
      }
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <FormField label={t("login.identifier")} required error={tv(errors.identifier?.message)}>
          {(c) => <Input autoComplete="username" autoCapitalize="none" spellCheck={false} {...c} {...register("identifier")} />}
        </FormField>
        <FormField label={t("login.password")} required error={tv(errors.password?.message)}>
          {(c) => <PasswordInput autoComplete="current-password" {...c} {...register("password")} />}
        </FormField>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
          {isLoading ? t("login.submitting") : t("login.submit")}
        </Button>
      </form>

      <div className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
        <Link href={`/schools/${slug}/forgot-password`} className="font-semibold text-primary underline-offset-4 hover:underline">
          {t("login.forgot")}
        </Link>
        <p className="text-muted-foreground">{t("login.forgot.others")}</p>
      </div>
    </AuthCard>
  );
}

/** Sign in for the platform owner (email and password, no school). */
export function PlatformLoginForm() {
  const { t, tv } = useT();
  const startSession = useStartSession();
  const [login, { isLoading }] = usePlatformLoginMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TPlatformLoginForm>({ resolver: zodResolver(platformLoginSchema), mode: "onTouched" });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await login(values).unwrap();
      await startSession({ fallback: "/platform" });
    } catch (err) {
      toast.error(getApiErrorMessage(err, t), { id: "login-error" });
    }
  });

  return (
    <AuthCard title={t("login.platform.title")}>
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <FormField label={t("login.email")} required error={tv(errors.email?.message)}>
          {(c) => <Input type="email" autoComplete="username" {...c} {...register("email")} />}
        </FormField>
        <FormField label={t("login.password")} required error={tv(errors.password?.message)}>
          {(c) => <PasswordInput autoComplete="current-password" {...c} {...register("password")} />}
        </FormField>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
          {isLoading ? t("login.submitting") : t("login.submit")}
        </Button>
      </form>
    </AuthCard>
  );
}
