"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, BookOpen, Check, GraduationCap, Loader2, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { FormField } from "@/components/common/FormField";
import { PasswordInput } from "@/components/common/PasswordInput";
import { PhoneInput } from "@/components/common/PhoneInput";
import { AuthCard } from "@/components/auth/AuthCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getApiErrorMessage, getFieldErrors } from "@/lib/errors";
import { useT } from "@/lib/i18n/useT";
import { useStartSession } from "@/lib/useStartSession";
import { useLazySlugAvailableQuery, useRegisterInstitutionMutation } from "@/redux/api/authApi";
import { cn } from "@/lib/utils";
import { SIGNUP_STEP_FIELDS, signupSchema, type TSignupForm } from "@/utils/interface";
import { passwordStrength } from "@/utils/passwordStrength";
import { normalizeSlug, slugSuggestions } from "@/utils/slug";

const DOMAIN = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN ?? "xyz.com";
const TYPES = [
  { value: "school", icon: GraduationCap },
  { value: "madrasa", icon: BookOpen },
  { value: "coaching", icon: Building2 },
] as const;

type SlugState = "idle" | "checking" | "available" | "taken" | "reserved" | "invalid" | "error";

export function SignupWizard() {
  const { t, tv } = useT();
  const startSession = useStartSession();
  const [step, setStep] = useState(0);
  const [slugState, setSlugState] = useState<SlugState>("idle");
  const [register, { isLoading }] = useRegisterInstitutionMutation();
  const [checkSlug] = useLazySlugAvailableQuery();

  const form = useForm<TSignupForm>({
    resolver: zodResolver(signupSchema),
    mode: "onTouched",
    defaultValues: {
      institutionName: "",
      institutionNameBn: "",
      institutionType: undefined,
      district: "",
      phone: "",
      slug: "",
      adminName: "",
      adminEmail: "",
      password: "",
      terms: undefined,
    },
  });
  const { register: field, control, watch, trigger, setValue, handleSubmit, setError, formState } = form;
  const errors = formState.errors;

  const slugInput = watch("slug");
  const normalized = normalizeSlug(slugInput ?? "");
  const district = watch("district");
  const password = watch("password");

  // As the visitor types, the address is normalized at once and checked with the server after 400 ms
  useEffect(() => {
    if (!normalized) return setSlugState("idle");
    if (normalized.length < 3) return setSlugState("invalid");
    setSlugState("checking");
    const timer = setTimeout(async () => {
      const res = await checkSlug(normalized, true);
      if (res.data?.available) setSlugState("available");
      else if (res.data?.reason === "SLUG_TAKEN") setSlugState("taken");
      else if (res.data?.reason === "SLUG_RESERVED") setSlugState("reserved");
      else setSlugState(res.isError ? "error" : "invalid");
    }, 400);
    return () => clearTimeout(timer);
  }, [normalized, checkSlug]);

  const goNext = async () => {
    const ok = await trigger([...SIGNUP_STEP_FIELDS[step]]);
    if (!ok) return;
    if (step === 1 && slugState !== "available" && slugState !== "error") return;
    setStep((s) => s + 1);
  };

  const onSubmit = handleSubmit(async (values) => {
    try {
      await register({
        institutionName: values.institutionName,
        institutionNameBn: values.institutionNameBn || undefined,
        institutionType: values.institutionType,
        slug: normalized,
        phone: values.phone,
        district: values.district || undefined,
        adminName: values.adminName,
        adminEmail: values.adminEmail,
        password: values.password,
      }).unwrap();
      await startSession();
    } catch (err) {
      // Form data stays in place so a network error or a taken address never costs the visitor their typing
      const fieldErrors = getFieldErrors(err);
      for (const [path, message] of Object.entries(fieldErrors)) {
        if (path in values) setError(path as keyof TSignupForm, { message });
      }
      const code = (err as { code?: string })?.code;
      if (code === "SLUG_TAKEN" || code === "SLUG_RESERVED" || code === "SLUG_INVALID") setStep(1);
      toast.error(getApiErrorMessage(err, t));
    }
  });

  const strength = passwordStrength(password ?? "");
  const stepTitle = [t("signup.step1.title"), t("signup.step2.title"), t("signup.step3.title")][step];

  return (
    <AuthCard
      wide
      title={t("signup.title")}
      subtitle={t("signup.subtitle")}
      footer={
        <>
          {t("signup.haveAccount")}{" "}
          <Link href="/login" className="font-semibold text-primary underline-offset-4 hover:underline">
            {t("mk.nav.login")}
          </Link>
        </>
      }
    >
      <ol className="mb-6 flex items-center gap-2" aria-label={t("signup.step", { step: step + 1 })}>
        {[0, 1, 2].map((i) => (
          <li key={i} className="flex flex-1 items-center gap-2">
            <span
              aria-current={i === step ? "step" : undefined}
              className={cn(
                "grid size-8 shrink-0 place-items-center rounded-full text-sm font-semibold",
                i < step ? "bg-primary text-white" : i === step ? "bg-primary-tint text-primary-deep ring-2 ring-primary" : "bg-muted text-muted-foreground"
              )}
            >
              {i < step ? <Check className="size-4" aria-hidden="true" /> : i + 1}
            </span>
            {i < 2 ? <span className={cn("h-0.5 flex-1 rounded", i < step ? "bg-primary" : "bg-border")} /> : null}
          </li>
        ))}
      </ol>
      <p className="mb-4 text-sm font-semibold text-navy">
        {t("signup.step", { step: step + 1 })}: {stepTitle}
      </p>

      <form onSubmit={onSubmit} noValidate className="space-y-5">
        {/* step 1: the institution */}
        <div hidden={step !== 0} className="space-y-4">
          <FormField label={t("signup.name")} required error={tv(errors.institutionName?.message)}>
            {(c) => <Input autoComplete="organization" {...c} {...field("institutionName")} />}
          </FormField>
          <FormField label={t("signup.nameBn")}>{(c) => <Input lang="bn" {...c} {...field("institutionNameBn")} />}</FormField>

          <fieldset>
            <legend className="mb-2 text-sm font-medium">{t("signup.type")}</legend>
            <Controller
              control={control}
              name="institutionType"
              render={({ field: f }) => (
                <div className="grid gap-3 sm:grid-cols-3" role="radiogroup">
                  {TYPES.map(({ value, icon: Icon }) => {
                    const selected = f.value === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => f.onChange(value)}
                        className={cn(
                          "flex min-h-24 flex-col items-start gap-1 rounded-lg border p-3 text-left transition-colors duration-200",
                          selected ? "border-primary bg-primary-tint ring-2 ring-primary" : "border-input bg-card hover:bg-accent"
                        )}
                      >
                        <Icon className="size-5 text-primary" aria-hidden="true" />
                        <span className="font-semibold">{t(`signup.type.${value}`)}</span>
                        <span className="text-xs text-muted-foreground">{t(`signup.type.${value}.desc`)}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            />
            {errors.institutionType ? (
              <p role="alert" className="mt-1.5 text-xs font-medium text-destructive">{tv(errors.institutionType.message)}</p>
            ) : null}
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label={t("signup.district")}>{(c) => <Input {...c} {...field("district")} />}</FormField>
            <FormField label={t("signup.phone")} required error={tv(errors.phone?.message)}>
              {(c) => <PhoneInput {...c} {...field("phone")} />}
            </FormField>
          </div>
        </div>

        {/* step 2: the site address */}
        <div hidden={step !== 1} className="space-y-4">
          <FormField label={t("signup.slug")} required error={tv(errors.slug?.message)} hint={t("signup.slug.rule")}>
            {(c) => <Input autoCapitalize="none" autoCorrect="off" spellCheck={false} {...c} {...field("slug")} />}
          </FormField>

          <div className="rounded-lg border border-border bg-muted p-3 text-sm">
            <p className="text-muted-foreground">{t("signup.slug.preview", { url: `${DOMAIN}/schools/${normalized || "..."}` })}</p>
            {normalized && normalized !== slugInput.trim() ? (
              <p className="mt-1 font-medium text-navy">{t("signup.slug.normalized", { slug: normalized })}</p>
            ) : null}
          </div>

          <p role="status" aria-live="polite" className="min-h-6 text-sm font-medium">
            {slugState === "checking" ? (
              <span className="inline-flex items-center gap-2 text-muted-foreground">
                <Loader2 className="size-4 animate-spin" aria-hidden="true" /> {t("signup.slug.checking")}
              </span>
            ) : slugState === "available" ? (
              <span className="inline-flex items-center gap-2 text-success-deep">
                <Check className="size-4" aria-hidden="true" /> {t("signup.slug.available", { slug: normalized })}
              </span>
            ) : slugState === "error" ? (
              <span className="inline-flex items-center gap-2 text-warning">{t("signup.slug.checkFailed")}</span>
            ) : slugState === "taken" || slugState === "reserved" || slugState === "invalid" ? (
              <span className="inline-flex items-center gap-2 text-destructive">
                <X className="size-4" aria-hidden="true" />
                {slugState === "taken"
                  ? t("signup.slug.taken", { slug: normalized })
                  : slugState === "reserved"
                    ? t("signup.slug.reserved")
                    : t("signup.slug.invalid")}
              </span>
            ) : null}
          </p>

          {slugState === "taken" ? (
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-muted-foreground">{t("signup.slug.try")}</span>
              {slugSuggestions(normalized, district).map((s) => (
                <Button key={s} type="button" size="sm" variant="outline" onClick={() => setValue("slug", s, { shouldValidate: true })}>
                  {s}
                </Button>
              ))}
            </div>
          ) : null}
        </div>

        {/* step 3: the admin account */}
        <div hidden={step !== 2} className="space-y-4">
          <FormField label={t("signup.adminName")} required error={tv(errors.adminName?.message)}>
            {(c) => <Input autoComplete="name" {...c} {...field("adminName")} />}
          </FormField>
          <FormField label={t("signup.adminEmail")} required error={tv(errors.adminEmail?.message)}>
            {(c) => <Input type="email" autoComplete="email" {...c} {...field("adminEmail")} />}
          </FormField>
          <FormField label={t("signup.password")} required error={tv(errors.password?.message)} hint={t("signup.password.hint")}>
            {(c) => <PasswordInput autoComplete="new-password" {...c} {...field("password")} />}
          </FormField>
          {password ? (
            <div aria-live="polite" className="flex items-center gap-3 text-xs">
              <div className="flex flex-1 gap-1" aria-hidden="true">
                {[1, 2, 3].map((n) => (
                  <span
                    key={n}
                    className={cn(
                      "h-1.5 flex-1 rounded-full",
                      n <= (strength.level === "weak" ? 1 : strength.level === "okay" ? 2 : 3)
                        ? strength.level === "weak"
                          ? "bg-destructive"
                          : strength.level === "okay"
                            ? "bg-warning"
                            : "bg-success"
                        : "bg-muted"
                    )}
                  />
                ))}
              </div>
              <span className="font-medium">{t(`signup.strength.${strength.level}`)}</span>
            </div>
          ) : null}
          <div>
            <label className="flex min-h-11 items-start gap-3 text-sm">
              <input type="checkbox" className="mt-1 size-5 accent-primary" {...field("terms")} />
              <span>{t("signup.terms")}</span>
            </label>
            {errors.terms ? <p role="alert" className="mt-1 text-xs font-medium text-destructive">{tv(errors.terms.message)}</p> : null}
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          {step > 0 ? (
            <Button type="button" variant="outline" onClick={() => setStep((s) => s - 1)} disabled={isLoading}>
              {t("common.back")}
            </Button>
          ) : (
            <span />
          )}
          {step < 2 ? (
            <Button type="button" onClick={goNext} disabled={step === 1 && slugState !== "available" && slugState !== "error"}>
              {t("common.next")}
            </Button>
          ) : (
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
              {isLoading ? t("signup.creating") : t("signup.submit")}
            </Button>
          )}
        </div>
      </form>
    </AuthCard>
  );
}
