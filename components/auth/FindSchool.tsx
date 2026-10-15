"use client";

import { ChevronRight, Loader2, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AuthCard } from "@/components/auth/AuthCard";
import { DemoSchoolCard } from "@/components/marketing/DemoSchoolCard";
import { ErrorState } from "@/components/common/ErrorState";
import { Input } from "@/components/ui/input";
import { useT } from "@/lib/i18n/useT";
import { useFindSchoolQuery } from "@/redux/api/publicApi";

/** Step one of sign in: search for the school, then go to its own login page. */
export function FindSchool() {
  const { t } = useT();
  const [text, setText] = useState("");
  const [q, setQ] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setQ(text.trim()), 300);
    return () => clearTimeout(timer);
  }, [text]);

  const enabled = q.length >= 2;
  const { data, isFetching, isError, error, refetch } = useFindSchoolQuery(q, { skip: !enabled });

  return (
    <AuthCard
      title={t("login.find.title")}
      subtitle={t("login.find.subtitle")}
      footer={
        <>
          {t("login.noAccount")}{" "}
          <Link href="/signup" className="font-semibold text-primary underline-offset-4 hover:underline">
            {t("mk.nav.signup")}
          </Link>
        </>
      }
    >
      <DemoSchoolCard className="mb-5" showAccounts={false} />

      <label htmlFor="school-search" className="sr-only">
        {t("login.find.search")}
      </label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <Input
          id="school-search"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("login.find.search")}
          className="pl-9"
          autoComplete="off"
          autoFocus
        />
        {isFetching ? <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" aria-hidden="true" /> : null}
      </div>

      <div className="mt-4" aria-live="polite">
        {!enabled ? (
          <p className="text-sm text-muted-foreground">{t("login.find.hint")}</p>
        ) : isError ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : data && data.length === 0 && !isFetching ? (
          <p className="text-sm text-muted-foreground">{t("login.find.none")}</p>
        ) : (
          <ul className="space-y-2">
            {(data ?? []).map((s) => (
              <li key={s.slug}>
                <Link
                  href={`/schools/${s.slug}/login`}
                  className="flex min-h-14 items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-2 transition-colors hover:bg-accent"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-semibold text-navy">{s.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {[s.district, s.slug].filter(Boolean).join(" · ")}
                    </span>
                  </span>
                  <ChevronRight className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AuthCard>
  );
}
