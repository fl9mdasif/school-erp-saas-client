"use client";

import Link from "next/link";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { Skeleton } from "@/components/ui/skeleton";
import { formatLocalDate, isoToLocalDate } from "@/lib/format";
import { useT } from "@/lib/i18n/useT";
import { useGetNoticesQuery } from "@/redux/api/communicationApi";
import { useAppSelector } from "@/redux/hooks";

export function NoticesFeed({ limit = 10 }: { limit?: number }) {
  const { t, lang } = useT();
  const banglaDigits = useAppSelector((s) => s.ui.banglaDigits);
  const fmt = { lang, banglaDigits } as const;
  const { data, isLoading, error, refetch } = useGetNoticesQuery({ limit });

  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold text-navy">{t("pt.notices.title")}</h2>
      {isLoading ? (
        <Skeleton className="h-32 w-full" />
      ) : error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : !data || data.rows.length === 0 ? (
        <EmptyState title={t("pt.notices.empty")} />
      ) : (
        <ul className="space-y-2">
          {data.rows.map((n) => (
            <li key={n._id}>
              <Link href={`/dashboard/portal/notices/${n._id}`} className="block rounded-lg border border-border p-3 hover:bg-accent">
                <span className="block font-medium text-navy">{n.title}</span>
                <span className="text-xs text-muted-foreground">{formatLocalDate(isoToLocalDate(n.publishAt), fmt)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
