"use client";

import { CheckCircle2, Circle, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useT } from "@/lib/i18n/useT";
import { useGetClassesQuery, useGetSessionsQuery, useGetSubjectsQuery } from "@/redux/api/academicApi";
import type { TAdminSummary } from "@/types";

const KEY = "asm.onboarding.dismissed";

const read = () => {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
};

/** Setup steps come from live counts, so finishing the work elsewhere ticks the box by itself. */
export function OnboardingChecklist({ summary }: { summary?: TAdminSummary }) {
  const { t, term } = useT();
  const sessions = useGetSessionsQuery();
  const classes = useGetClassesQuery();
  const subjects = useGetSubjectsQuery();
  const [dismissed, setDismissed] = useState(read);

  if (!summary || sessions.isLoading || classes.isLoading || subjects.isLoading) return null;

  const items = [
    { done: (sessions.data?.rows ?? []).some((s) => s.isCurrent), label: t("ad.setup.session"), href: "/dashboard/academic/sessions" },
    { done: (classes.data?.rows.length ?? 0) > 0, label: t("ad.setup.classes", { class: term("class") }), href: "/dashboard/academic/classes" },
    { done: (subjects.data?.rows.length ?? 0) > 0, label: t("ad.setup.subjects"), href: "/dashboard/academic/subjects" },
    { done: summary.students > 0, label: t("ad.setup.students", { student: term("student") }), href: "/dashboard/students/new" },
    { done: summary.staff > 1, label: t("ad.setup.staff"), href: "/dashboard/staff" },
    { done: summary.notices > 0, label: t("ad.setup.notice"), href: "/dashboard/notices/new" },
  ];
  const doneCount = items.filter((i) => i.done).length;
  const coreDone = items.slice(0, 4).every((i) => i.done);

  if (dismissed || doneCount === items.length) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      /* private mode: hide for this visit only */
    }
    setDismissed(true);
  };

  return (
    <Card className="mb-6">
      <CardHeader className="flex-row items-start justify-between gap-3">
        <div className="min-w-0">
          <CardTitle>{t("ad.setup.title")}</CardTitle>
          <CardDescription>{t("ad.setup.progress", { done: doneCount, total: items.length })}</CardDescription>
        </div>
        {coreDone ? (
          <Button variant="ghost" size="icon" onClick={dismiss} aria-label={t("ad.setup.dismiss")}>
            <X aria-hidden="true" />
          </Button>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={(doneCount / items.length) * 100} label={t("ad.setup.title")} />
        <ul className="grid gap-2 md:grid-cols-2">
          {items.map((i) => (
            <li key={i.href}>
              <Link href={i.href} className="flex min-h-11 items-center gap-3 rounded-lg px-2 text-sm hover:bg-accent">
                {i.done ? (
                  <CheckCircle2 className="size-5 shrink-0 text-success" aria-hidden="true" />
                ) : (
                  <Circle className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                )}
                <span className={i.done ? "text-muted-foreground line-through" : "font-medium"}>{i.label}</span>
                <span className="sr-only">{i.done ? t("ad.setup.done") : t("ad.setup.todo")}</span>
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
