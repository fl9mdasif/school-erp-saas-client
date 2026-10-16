"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n/useT";
import { FEATURE_COUNT, FEATURE_GROUPS } from "./featureData";

/** The full feature catalogue: a hero, a sticky category bar, a card grid per area, and a closing call to action. */
export function AllFeatures() {
  const { t, lang } = useT();
  const L = lang === "bn" ? "bn" : "en";

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-tint via-background to-background">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center md:py-24">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-card px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            <Sparkles className="size-3.5" aria-hidden="true" />
            {t("mk.all.eyebrow")}
          </span>
          <h1 className="mt-5 text-3xl font-bold leading-tight text-navy md:text-5xl">{t("mk.all.title")}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">{t("mk.all.subtitle", { count: FEATURE_COUNT })}</p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/signup">{t("mk.hero.cta")}</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
              <Link href="/find-school">{t("mk.all.tryDemo")}</Link>
            </Button>
          </div>
        </div>
      </section>

      <nav aria-label={t("mk.all.jump")} className="sticky top-16 z-30 border-y border-border bg-card/95 backdrop-blur">
        <ul className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 py-2.5">
          {FEATURE_GROUPS.map((g) => (
            <li key={g.id} className="shrink-0">
              <a href={`#${g.id}`} className="inline-flex min-h-9 items-center rounded-full border border-border px-3.5 text-sm font-medium text-navy transition-colors hover:border-primary hover:bg-primary-tint">
                {g.title[L]}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mx-auto max-w-6xl space-y-16 px-4 py-14">
        {FEATURE_GROUPS.map((g, gi) => (
          <section key={g.id} id={g.id} aria-labelledby={`${g.id}-h`} className="scroll-mt-32">
            <div className="mb-6 flex items-end gap-4">
              <span className="tabular grid size-10 shrink-0 place-items-center rounded-xl bg-navy text-sm font-bold text-white">{String(gi + 1).padStart(2, "0")}</span>
              <div>
                <h2 id={`${g.id}-h`} className="text-2xl font-semibold text-navy">{g.title[L]}</h2>
                <p className="text-sm text-muted-foreground">{g.blurb[L]}</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {g.features.map((f) => (
                <article
                  key={f.title.en}
                  className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
                >
                  <span className="mb-4 grid size-12 place-items-center rounded-xl bg-primary-tint text-primary-deep transition-colors group-hover:bg-primary group-hover:text-white">
                    <f.icon className="size-6" aria-hidden="true" />
                  </span>
                  <h3 className="font-semibold text-navy">{f.title[L]}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.body[L]}</p>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>

      <section className="bg-gradient-to-br from-navy via-navy to-primary-deep py-16 text-center">
        <div className="mx-auto max-w-2xl px-4">
          <h2 className="text-2xl font-semibold text-white md:text-3xl">{t("mk.final.title")}</h2>
          <p className="mt-2 text-sidebar-foreground">{t("mk.final.body")}</p>
          <Button asChild size="lg" className="mt-6">
            <Link href="/signup">
              {t("mk.hero.cta")}
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
