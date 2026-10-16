"use client";

import { ArrowRight, BookOpenCheck, CalendarCheck, Globe, GraduationCap, Landmark, School, Smartphone, Trophy, Wallet, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useT } from "@/lib/i18n/useT";
import { DemoSchoolCard } from "./DemoSchoolCard";
import { ContainerScroll } from "./ContainerScroll";
import { ACCENT, type TAccent } from "./accents";
import { FEATURE_GROUPS } from "./featureData";
import { RevealGrid } from "./RevealGrid";
import { cn } from "@/lib/utils";
import { DashboardMock, ResultMock } from "./Mocks";
import { PhoneScroll } from "./PhoneScroll";
import { PricingSection } from "./PricingSection";

const FEATURES = [
  { icon: GraduationCap, key: "students" },
  { icon: CalendarCheck, key: "attendance" },
  { icon: Wallet, key: "fees" },
  { icon: Trophy, key: "results" },
  { icon: Globe, key: "website" },
  { icon: Smartphone, key: "parents" },
] as const;

const AUDIENCE = ["school", "madrasa", "coaching"] as const;
const AUDIENCE_ACCENT: Record<(typeof AUDIENCE)[number], TAccent> = { school: "blue", madrasa: "emerald", coaching: "violet" };
const AUDIENCE_ICON: Record<(typeof AUDIENCE)[number], LucideIcon> = { school: School, madrasa: Landmark, coaching: BookOpenCheck };

export function LandingPage() {
  const { t, lang } = useT();

  return (
    <>
      {/* hero with the first 3D scroll: the dashboard tilts flat as you scroll */}
      <ContainerScroll
        titleComponent={
          <div className="px-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary md:text-sm">{t("mk.hero.eyebrow")}</p>
            <h1 className="mt-3 text-3xl font-semibold leading-tight text-navy md:text-5xl">
              {t("mk.hero.title1")}
              <span className="mt-1 block text-4xl font-bold text-primary md:text-7xl">{t("mk.hero.title2")}</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">{t("mk.hero.subtitle")}</p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/signup">{t("mk.hero.cta")}</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                <Link href="#features">{t("mk.hero.cta2")}</Link>
              </Button>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">{t("mk.hero.note")}</p>
          </div>
        }
      >
        <DashboardMock />
      </ContainerScroll>

      {/* try it now: a live demo school */}
      <section className="mx-auto max-w-4xl px-4 pb-4">
        <DemoSchoolCard />
      </section>

      {/* who it is for */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="mb-8 text-center text-2xl font-semibold md:text-3xl">{t("mk.audience.title")}</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {AUDIENCE.map((k) => (
            <Card key={k} className="group p-6 transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
              {(() => {
                const Icon = AUDIENCE_ICON[k];
                return (
                  <span className={cn("mb-4 grid size-12 place-items-center rounded-xl transition-colors group-hover:text-white", ACCENT[AUDIENCE_ACCENT[k]].tint, ACCENT[AUDIENCE_ACCENT[k]].text, ACCENT[AUDIENCE_ACCENT[k]].hover)}>
                    <Icon className="size-6" aria-hidden="true" />
                  </span>
                );
              })()}
              <h3 className="text-lg font-semibold">{t(`mk.audience.${k}.title`)}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t(`mk.audience.${k}.body`)}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* features: one colorful highlight per area, then the full list */}
      <section id="features" className="bg-gradient-to-b from-card to-background py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-2 text-center text-2xl font-semibold md:text-3xl">{t("mk.features.title")}</h2>
          <p className="mx-auto mb-10 max-w-2xl text-center text-muted-foreground">{t("mk.features.sub")}</p>
          <RevealGrid className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURE_GROUPS.slice(0, 6).map((g, i) => {
              const f = g.features.find((x) => x.featured) ?? g.features[0];
              const a = ACCENT[g.accent];
              return (
                <Link
                  key={g.id}
                  href={`/features#${g.id}`}
                  style={{ "--mk-delay": `${i * 60}ms` } as React.CSSProperties}
                  className={cn(
                    "mk-reveal group relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl",
                    a.soft,
                    a.glow
                  )}
                >
                  <span className={cn("mb-4 grid size-12 place-items-center rounded-xl text-white shadow-md", a.solid)}>
                    <f.icon className="size-6" aria-hidden="true" />
                  </span>
                  <p className={cn("text-xs font-semibold uppercase tracking-wide", a.text)}>{g.title[lang === "bn" ? "bn" : "en"]}</p>
                  <h3 className="mt-1 text-lg font-semibold text-navy">{f.title[lang === "bn" ? "bn" : "en"]}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.body[lang === "bn" ? "bn" : "en"]}</p>
                  <ArrowRight className={cn("absolute bottom-5 right-5 size-5 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100", a.text)} aria-hidden="true" />
                </Link>
              );
            })}
          </RevealGrid>
          <div className="mt-10 text-center">
            <Button asChild size="lg" variant="outline">
              <Link href="/features">
                {t("mk.features.showAll")}
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* result lookup teaser with the second 3D scroll: the phone tilts flat over the headline */}
      <PhoneScroll
        titleComponent={
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary md:text-sm">{t("mk.phone.eyebrow")}</p>
            <h2 className="mt-3 text-2xl font-semibold text-navy md:text-4xl">
              {t("mk.phone.title1")}
              <span className="mt-1 block text-3xl font-bold md:text-6xl">{t("mk.phone.title2")}</span>
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">{t("mk.phone.body")}</p>
          </div>
        }
      >
        <ResultMock />
      </PhoneScroll>

      <PricingSection />

      {/* closing call to action */}
      <section className="bg-gradient-to-br from-navy via-navy to-primary-deep py-20 text-center">
        <div className="mx-auto max-w-2xl px-4">
          <h2 className="text-2xl font-semibold text-white md:text-3xl">{t("mk.final.title")}</h2>
          <p className="mt-2 text-sidebar-foreground">{t("mk.final.body")}</p>
          <Button asChild size="lg" className="mt-6">
            <Link href="/signup">{t("mk.hero.cta")}</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
