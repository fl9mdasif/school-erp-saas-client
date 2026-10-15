"use client";

import { Loader2 } from "lucide-react";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { ErrorState } from "@/components/common/ErrorState";
import { FormField } from "@/components/common/FormField";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { getApiErrorMessage } from "@/lib/errors";
import { useT } from "@/lib/i18n/useT";
import { useGetSiteQuery, useUpdateSiteMutation } from "@/redux/api/websiteApi";
import type { TSectionsVisible, TSiteTemplate } from "@/types";
import { ImageUploader } from "@/services/ImageUploader";
import { PublishPanel } from "./PublishPanel";

type TForm = {
  primaryColor: string;
  template: TSiteTemplate;
  heroTitle: string;
  heroSubtitle: string;
  heroImageUrl: string;
  about: string;
  mission: string;
  phone: string;
  email: string;
  address: string;
  mapUrl: string;
  facebook: string;
  youtube: string;
  seoTitle: string;
  seoDescription: string;
  sections: TSectionsVisible;
};

const SECTION_KEYS: (keyof TSectionsVisible)[] = ["about", "teachers", "notices", "gallery", "admission", "results"];

/** WCAG relative luminance contrast ratio of a hex colour against white text. */
function contrastOnWhiteText(hex: string): number {
  const m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  if (!m) return 0;
  const lin = (c: number) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
  const [r, g, b] = [m[1], m[2], m[3]].map((h) => lin(parseInt(h, 16)));
  const l = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return (1.05) / (l + 0.05);
}

export function WebsiteContent() {
  const { t } = useT();
  const { data: site, isLoading, error, refetch } = useGetSiteQuery();

  if (isLoading) return <Skeleton className="h-96 w-full max-w-3xl" />;
  if (error || !site) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <>
      <PageHeader title={t("web.title")} description={t("web.desc")} />
      <PublishPanel site={site} />
      <ContentForm site={site} />
    </>
  );
}

function ContentForm({ site }: { site: NonNullable<ReturnType<typeof useGetSiteQuery>["data"]> }) {
  const { t } = useT();
  const [update, updating] = useUpdateSiteMutation();
  const { register, watch, setValue, handleSubmit } = useForm<TForm>({
    defaultValues: {
      primaryColor: site.theme.primaryColor,
      template: site.theme.template,
      heroTitle: site.hero?.title ?? "",
      heroSubtitle: site.hero?.subtitle ?? "",
      heroImageUrl: site.hero?.imageUrl ?? "",
      about: site.about ?? "",
      mission: site.mission ?? "",
      phone: site.contact?.phone ?? "",
      email: site.contact?.email ?? "",
      address: site.contact?.address ?? "",
      mapUrl: site.contact?.mapUrl ?? "",
      facebook: site.social?.facebook ?? "",
      youtube: site.social?.youtube ?? "",
      seoTitle: site.seo?.title ?? "",
      seoDescription: site.seo?.description ?? "",
      sections: site.sectionsVisible,
    },
  });
  const primaryColor = watch("primaryColor");
  const heroImageUrl = watch("heroImageUrl");
  const ratio = useMemo(() => contrastOnWhiteText(primaryColor), [primaryColor]);
  const passesAA = ratio >= 4.5;

  const onSubmit = handleSubmit(async (v) => {
    try {
      await update({
        theme: { primaryColor: v.primaryColor, template: v.template },
        hero: { title: v.heroTitle, subtitle: v.heroSubtitle, imageUrl: v.heroImageUrl || undefined },
        about: v.about,
        mission: v.mission,
        contact: { phone: v.phone, email: v.email || undefined, address: v.address, mapUrl: v.mapUrl || undefined },
        social: { facebook: v.facebook || undefined, youtube: v.youtube || undefined },
        seo: { title: v.seoTitle, description: v.seoDescription },
        sectionsVisible: v.sections,
      }).unwrap();
      toast.success(t("web.saved"));
    } catch (err) {
      toast.error(getApiErrorMessage(err, t));
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="max-w-3xl space-y-4">
      <Card>
        <CardContent className="space-y-4 pt-5">
          <p className="font-semibold text-navy">{t("web.theme")}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label={t("web.primaryColor")}>
              {(c) => <Input type="color" className="h-10 w-20 p-1" {...c} {...register("primaryColor")} />}
            </FormField>
            <FormField label={t("web.template")}>
              {(c) => (
                <Select {...c} {...register("template")}>
                  <option value="classic">{t("web.template.classic")}</option>
                  <option value="modern">{t("web.template.modern")}</option>
                </Select>
              )}
            </FormField>
          </div>
          <p className={`text-sm ${passesAA ? "text-success-deep" : "text-destructive"}`}>
            {t("web.contrast", { ratio: ratio.toFixed(1) })} — {passesAA ? t("web.contrastPass") : t("web.contrastFail")}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 pt-5">
          <p className="font-semibold text-navy">{t("web.hero")}</p>
          <FormField label={t("web.hero.title")}>{(c) => <Input {...c} {...register("heroTitle")} />}</FormField>
          <FormField label={t("web.hero.subtitle")}>{(c) => <Textarea {...c} {...register("heroSubtitle")} />}</FormField>
          <ImageUploader folder="gallery" initialImageUrl={heroImageUrl || undefined} onUploadSuccess={(url) => setValue("heroImageUrl", url)} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 pt-5">
          <p className="font-semibold text-navy">{t("web.about")}</p>
          <FormField label={t("web.about")}>{(c) => <Textarea rows={5} {...c} {...register("about")} />}</FormField>
          <FormField label={t("web.mission")}>{(c) => <Textarea rows={3} {...c} {...register("mission")} />}</FormField>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 pt-5">
          <p className="font-semibold text-navy">{t("web.contact")}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label={t("web.phone")}>{(c) => <Input {...c} {...register("phone")} />}</FormField>
            <FormField label={t("web.email")}>{(c) => <Input type="email" {...c} {...register("email")} />}</FormField>
            <FormField label={t("web.address")} className="sm:col-span-2">{(c) => <Input {...c} {...register("address")} />}</FormField>
            <FormField label={t("web.mapUrl")} className="sm:col-span-2">{(c) => <Input {...c} {...register("mapUrl")} />}</FormField>
            <FormField label={t("web.facebook")}>{(c) => <Input {...c} {...register("facebook")} />}</FormField>
            <FormField label={t("web.youtube")}>{(c) => <Input {...c} {...register("youtube")} />}</FormField>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 pt-5">
          <p className="font-semibold text-navy">{t("web.sections")}</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {SECTION_KEYS.map((k) => (
              <label key={k} className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="size-4" {...register(`sections.${k}`)} />
                {t(`web.section.${k}`)}
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 pt-5">
          <p className="font-semibold text-navy">{t("web.seo")}</p>
          <FormField label={t("web.seo.title")}>{(c) => <Input maxLength={70} {...c} {...register("seoTitle")} />}</FormField>
          <FormField label={t("web.seo.description")}>{(c) => <Textarea maxLength={160} {...c} {...register("seoDescription")} />}</FormField>
        </CardContent>
      </Card>

      <Button type="submit" disabled={updating.isLoading}>
        {updating.isLoading ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
        {t("common.save")}
      </Button>
    </form>
  );
}
