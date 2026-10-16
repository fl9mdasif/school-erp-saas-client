"use client";

import { ArrowRight, FlaskConical } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/useT";

// Shown by default (an empty or missing env value still means demo-school). Set the env to another slug, or to "off" to hide the card.
const RAW_DEMO = process.env.NEXT_PUBLIC_DEMO_SLUG?.trim();
const DEMO_SLUG = RAW_DEMO === "off" ? undefined : RAW_DEMO || "demo-school";

const ACCOUNTS = [
  { role: "admin", email: "admin@demo.school", password: "Demo@1234" },
  { role: "teacher", email: "kamal@demo.school", password: "Demo@123" },
  { role: "accountant", email: "salim@demo.school", password: "Demo@123" },
] as const;

/** A ready-made demo school anyone can sign in to. Hidden only when NEXT_PUBLIC_DEMO_SLUG is "off". */
export function DemoSchoolCard({ className, showAccounts = true }: { className?: string; showAccounts?: boolean }) {
  const { t } = useT();
  if (!DEMO_SLUG) return null;

  return (
    <section
      aria-label={t("demo.title")}
      className={cn("relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary-tint via-card to-card p-5 shadow-sm", className)}
    >
      <span className="absolute right-4 top-4 rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white">
        {t("demo.badge")}
      </span>
      <div className="flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary text-white">
          <FlaskConical className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 pr-16">
          <h3 className="text-lg font-semibold text-navy">{t("demo.title")}</h3>
          <p className="text-sm text-muted-foreground">{t("demo.body")}</p>
        </div>
      </div>

      {showAccounts ? (
        <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
          {ACCOUNTS.map((a) => (
            <li key={a.role} className="rounded-lg border border-border bg-background/70 p-2.5">
              <p className="font-semibold text-navy">{t(`demo.role.${a.role}`)}</p>
              <p className="truncate text-xs text-muted-foreground">{a.email}</p>
              <p className="tabular text-xs text-muted-foreground">{a.password}</p>
            </li>
          ))}
        </ul>
      ) : null}

      <Link
        href={`/schools/${DEMO_SLUG}/login`}
        className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-deep"
      >
        {t("demo.cta")}
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </section>
  );
}
