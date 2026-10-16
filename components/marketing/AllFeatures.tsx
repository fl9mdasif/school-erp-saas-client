"use client";

import { ArrowRight, GraduationCap, Receipt, Sparkles, Trophy, CalendarCheck } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n/useT";
import { cn } from "@/lib/utils";
import { ACCENT, type TAccent } from "./accents";
import { DemoSchoolCard } from "./DemoSchoolCard";
import { FeatureCard } from "./FeatureCard";
import { RevealGrid } from "./RevealGrid";
import { FEATURE_COUNT, FEATURE_GROUPS } from "./featureData";

type L = { en: string; bn: string };
const ROLES: { label: L; accent: TAccent }[] = [
  { label: { en: "Admin", bn: "অ্যাডমিন" }, accent: "blue" },
  { label: { en: "Teacher", bn: "শিক্ষক" }, accent: "violet" },
  { label: { en: "Accountant", bn: "হিসাবরক্ষক" }, accent: "emerald" },
  { label: { en: "Student", bn: "শিক্ষার্থী" }, accent: "cyan" },
  { label: { en: "Guardian", bn: "অভিভাবক" }, accent: "sky" },
  { label: { en: "Platform owner", bn: "প্ল্যাটফর্ম মালিক" }, accent: "slate" },
  { label: { en: "Public visitor", bn: "সাধারণ দর্শক" }, accent: "rose" },
];
const HIGHLIGHTS: { big: string; label: L }[] = [
  { big: "3", label: { en: "taps to mark a student", bn: "ট্যাপে একজনের হাজিরা" } },
  { big: "0", label: { en: "duplicate invoices on retry", bn: "আবার চাপলেও ডুপ্লিকেট চালান" } },
  { big: "PDF", label: { en: "receipts and marksheets", bn: "রসিদ ও মার্কশিট" } },
  { big: "2", label: { en: "languages, Bangla first", bn: "ভাষা, বাংলা আগে" } },
];
const HERO_ICONS = [
  { icon: CalendarCheck, accent: "violet" as const, cls: "left-0 top-2" },
  { icon: Receipt, accent: "emerald" as const, cls: "right-2 top-14" },
  { icon: Trophy, accent: "cyan" as const, cls: "left-10 bottom-6" },
  { icon: GraduationCap, accent: "indigo" as const, cls: "right-0 bottom-0" },
];

/** The full catalogue: gradient hero, role strip, sticky scrollspy bar, a bento grid per area, highlights, CTA. */
export function AllFeatures() {
  const { t, lang } = useT();
  const L = lang === "bn" ? "bn" : "en";
  const [active, setActive] = useState(FEATURE_GROUPS[0].id);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );
    FEATURE_GROUPS.forEach((g) => {
      const el = document.getElementById(g.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-navy via-navy to-teal-800 text-white">
        <div aria-hidden="true" className="pointer-events-none absolute -left-24 -top-24 size-96 rounded-full bg-teal-400/25 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 right-0 size-[28rem] rounded-full bg-indigo-500/25 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:py-24 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-teal-100">
              <Sparkles className="size-3.5" aria-hidden="true" />
              {t("mk.all.eyebrow")}
            </span>
            <h1 className="mt-5 text-3xl font-bold leading-tight md:text-5xl">{t("mk.all.title")}</h1>
            <p className="mt-4 max-w-xl text-base text-slate-200 md:text-lg">{t("mk.all.subtitle", { count: FEATURE_COUNT })}</p>
            <ul className="mt-6 flex flex-wrap gap-2 text-sm font-medium">
              {[`${FEATURE_COUNT}+ ${L === "bn" ? "ফিচার" : "features"}`, L === "bn" ? "৭টি ভূমিকা" : "7 roles", L === "bn" ? "বাংলা ও ইংরেজি" : "Bangla + English"].map((c) => (
                <li key={c} className="rounded-full bg-white/15 px-3.5 py-1.5 backdrop-blur">{c}</li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="w-full bg-white text-navy hover:bg-teal-50 sm:w-auto">
                <Link href="/signup">{t("mk.hero.cta")}</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white sm:w-auto">
                <Link href="/find-school">{t("mk.all.tryDemo")}</Link>
              </Button>
            </div>
          </div>
          <div aria-hidden="true" className="relative mx-auto hidden h-72 w-full max-w-sm lg:block">
            {HERO_ICONS.map(({ icon: Icon, accent, cls }, i) => (
              <span
                key={i}
                style={{ animationDelay: `${i * 0.8}s` }}
                className={cn("mk-float absolute grid size-24 place-items-center rounded-3xl bg-white shadow-2xl", cls)}
              >
                <span className={cn("grid size-14 place-items-center rounded-2xl text-white", ACCENT[accent].solid)}>
                  <Icon className="size-7" />
                </span>
              </span>
            ))}
          </div>
        </div>
      </section>

      <section aria-label={t("mk.all.roles")} className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-2 px-4 py-5">
          <span className="mr-2 text-sm font-semibold text-navy">{t("mk.all.roles")}</span>
          {ROLES.map((r) => (
            <span key={r.label.en} className={cn("rounded-full px-3 py-1 text-sm font-medium", ACCENT[r.accent].tint, ACCENT[r.accent].text)}>
              {r.label[L]}
            </span>
          ))}
        </div>
      </section>

      <nav aria-label={t("mk.all.jump")} className="sticky top-16 z-30 border-b border-border bg-card/95 backdrop-blur">
        <ul className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 py-2.5">
          {FEATURE_GROUPS.map((g) => (
            <li key={g.id} className="shrink-0">
              <a
                href={`#${g.id}`}
                aria-current={active === g.id ? "true" : undefined}
                className={cn(
                  "inline-flex min-h-9 items-center gap-2 rounded-full border px-3.5 text-sm font-medium transition-colors",
                  active === g.id ? cn("border-transparent text-white", ACCENT[g.accent].solid) : "border-border text-navy hover:bg-accent"
                )}
              >
                <span className={cn("size-2 rounded-full", active === g.id ? "bg-white" : ACCENT[g.accent].dot)} aria-hidden="true" />
                {g.title[L]}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mx-auto max-w-6xl space-y-16 px-4 py-14">
        {FEATURE_GROUPS.map((g, gi) => (
          <section key={g.id} id={g.id} aria-labelledby={`${g.id}-h`} className="scroll-mt-32">
            <div className="mb-6 flex items-center gap-4">
              <span className={cn("tabular grid size-12 shrink-0 place-items-center rounded-2xl text-lg font-bold text-white shadow-md", ACCENT[g.accent].solid)}>
                {String(gi + 1).padStart(2, "0")}
              </span>
              <div>
                <h2 id={`${g.id}-h`} className="text-2xl font-semibold text-navy">{g.title[L]}</h2>
                <p className="text-sm text-muted-foreground">{g.blurb[L]}</p>
              </div>
            </div>
            <RevealGrid className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {g.features.map((f, i) => (
                <FeatureCard key={f.title.en} feature={f} accent={g.accent} lang={L} index={i} />
              ))}
            </RevealGrid>
          </section>
        ))}
      </div>

      <section className="bg-gradient-to-r from-navy via-slate-900 to-teal-900 py-14">
        <ul className="mx-auto grid max-w-5xl grid-cols-2 gap-6 px-4 text-center md:grid-cols-4">
          {HIGHLIGHTS.map((h) => (
            <li key={h.big}>
              <p className="tabular bg-gradient-to-b from-white to-teal-200 bg-clip-text text-4xl font-bold text-transparent md:text-5xl">{h.big}</p>
              <p className="mt-1 text-sm text-slate-300">{h.label[L]}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h2 className="text-2xl font-semibold text-navy md:text-3xl">{t("mk.final.title")}</h2>
        <p className="mt-2 text-muted-foreground">{t("mk.final.body")}</p>
        <div className="mt-8 text-left">
          <DemoSchoolCard />
        </div>
        <Button asChild size="lg" className="mt-8">
          <Link href="/signup">
            {t("mk.hero.cta")}
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </section>
    </>
  );
}
