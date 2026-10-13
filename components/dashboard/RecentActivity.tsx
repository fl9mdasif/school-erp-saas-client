"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatLocalDate, isoToLocalDate } from "@/lib/format";
import { useT } from "@/lib/i18n/useT";
import { useGetInquiriesQuery, useGetNoticesQuery } from "@/redux/api/communicationApi";
import { useAppSelector } from "@/redux/hooks";

const LATEST = { page: 1, limit: 5 };

export function RecentActivity() {
  const { t, lang } = useT();
  const banglaDigits = useAppSelector((s) => s.ui.banglaDigits);
  const fmt = { lang, banglaDigits } as const;
  const inquiries = useGetInquiriesQuery({ ...LATEST, status: "new" });
  const notices = useGetNoticesQuery({ ...LATEST, status: "published" });

  return (
    <div className="mt-4 grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader className="flex-row items-center justify-between gap-2">
          <CardTitle>{t("ad.recent.inquiries")}</CardTitle>
          <Link href="/dashboard/website/inquiries" className="text-sm font-medium text-primary hover:underline">
            {t("ad.recent.viewAll")}
          </Link>
        </CardHeader>
        <CardContent>
          {inquiries.isLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : !inquiries.data?.rows.length ? (
            <p className="py-6 text-center text-sm text-muted-foreground">{t("ad.recent.noInquiries")}</p>
          ) : (
            <ul className="divide-y divide-border text-sm">
              {inquiries.data.rows.map((q) => (
                <li key={q._id} className="flex items-center justify-between gap-3 py-2">
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{q.name}</span>
                    <span className="tabular block text-xs text-muted-foreground">{q.phone}</span>
                  </span>
                  <span className="tabular shrink-0 text-xs text-muted-foreground">{formatLocalDate(isoToLocalDate(q.createdAt), fmt)}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between gap-2">
          <CardTitle>{t("ad.recent.notices")}</CardTitle>
          <Link href="/dashboard/notices" className="text-sm font-medium text-primary hover:underline">
            {t("ad.recent.viewAll")}
          </Link>
        </CardHeader>
        <CardContent>
          {notices.isLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : !notices.data?.rows.length ? (
            <p className="py-6 text-center text-sm text-muted-foreground">{t("ad.recent.noNotices")}</p>
          ) : (
            <ul className="divide-y divide-border text-sm">
              {notices.data.rows.map((n) => (
                <li key={n._id} className="flex items-center justify-between gap-3 py-2">
                  <span className="min-w-0 truncate font-medium">{n.title}</span>
                  <span className="tabular shrink-0 text-xs text-muted-foreground">{formatLocalDate(isoToLocalDate(n.publishAt), fmt)}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
